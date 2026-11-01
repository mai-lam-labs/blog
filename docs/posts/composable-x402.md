---
date: 2026-11-01
authors:
  - harryr
categories:
  - Bruno
slug: composable-x402
---

# Composable x402

x402 makes a payment one HTTP round trip: a `402` names the price, the client signs, the
server settles and answers. For a fraction of a cent of API access, settled by a facilitator on
a fast L2, that is the right shape. Pay for something on chain with it, something worth more
than the request it rides on, and the shape stops fitting. Not because of a bug: because of
where x402 puts the payment.

<!-- more -->

## Payment as a side channel

x402 treats a payment as a channel beside the work: verified before, settled after, joined to
the request by the server's say-so. The signed object binds a token, an amount, a recipient and
a window. It binds nothing about the request, nothing about whether the work happened, nothing
about what the work produced. At a tenth of a cent, nobody needs it to. When the payment is the
gas for a $40 swap, or the price of a call that must succeed for the payment to make sense,
each missing binding becomes a failure you can name.

We built a relay that takes x402 for Ethereum transactions: pay in USDC, no ETH, and the
transaction is sent for you. It is x402-compatible, its conformance judged by x402's own SDK.
Building it showed three places where payment and work come apart.

## 1. The payment isn't bound to the request

An EIP-3009 authorization commits to `from`, `to`, `value`, a validity window and a nonce.
Nothing in it says which request it pays for. x402's `payment-identifier` extension adds an id,
but outside the signature: an idempotency key for an honest client, not a binding.

So a server can't tell, from the payment, what it is for. A client that times out and signs
again sends a second, different payment for the same request; nothing in either says they're
the same purchase, so a server that settles both has been paid twice for one thing. Ours
matches pending payments by payer and by the exact call they pay for, and holds the second for
the first: state the server keeps because the payment can't carry it. And a payment seen once
(in a log, by a proxy) is good for any request at the same price to the same recipient.

The fix needs no new field: the 3009 nonce is the client's to choose. Derive it from the
request, and the signature the client already makes binds the two.

## 2. The payment isn't bound to the outcome

x402's success means settled, and settled means a transaction hash. When the payment is made
in the same transaction as the work, so that one can't happen without the other, there is no
hash until that transaction is included: it is signed afresh for each block it competes for.
x402's `settlement_pending` must carry a broadcast hash too. So the server holds the request
until inclusion, a slot or several, while most HTTP clients give up after a few seconds by
default. `maxTimeoutSeconds` says how long to wait; it's up to every client to honour it.

The alternative x402 offers, `upfront`, settles first and works after. The hash comes at once,
and the payment is gone whether or not the work succeeds, with no refund defined. That is the
side channel made explicit.

What fits instead is a receipt: accept the paid request, answer with a handle, settle the
payment and the work together, and report the outcome when there is one.

## 3. The payment isn't bound to execution

`transferWithAuthorization` can be submitted by anyone holding the signature. The payment can
land on its own, in a transaction of its own, whether or not the call it paid for ever runs. A
server can make them atomic only by keeping the signature to itself until it sends both
together, privately.

EIP-3009 has the primitive that binds them: `receiveWithAuthorization`, which only the payee
can execute, inside its own call. A contract that collects its payment that way does its work
and takes its payment as one event. It also composes: a payee contract can split, escrow or
forward within the same call. x402's EVM methods (3009's transfer, Permit2 through x402's proxy,
ERC-7710 delegations) all move funds to the payee from outside it. A `receive` method is a
scheme x402's extensibility already allows for.

## The growth cost: discovery runs through facilitators

The Bazaar, x402's discovery, is built by facilitators from the payments they settle. A
resource is listed by settling through one. The facilitator most clients' Bazaar searches index
from doesn't settle on Ethereum; and a server that settles its own payments atomically, with
the work, has no facilitator to settle through. The main passive discovery channel can't see it.

Discovery should be declared by the resource, not inferred from settlement: x402 already has
the metadata (the `bazaar` extension) and a discovery API any host can serve.

## What correct design looks like

- **A request-bound payment:** the authorization's nonce derived from the request.
- **A settlement receipt:** paid requests answered with a handle; the outcome reported when it
  exists.
- **A `receive` scheme:** payment collected by the payee contract within its own call.
- **Discovery declared, not settled into.**

Each of these is wire-compatible with x402 as it is: a nonce rule, a flow, a scheme, an index.
We'll open them upstream.

## How the relay does it today

The relay settles the x402 payment and the user's transaction in one transaction: a runner
that makes the transfer, makes the call, and reverts unless both happen. It sends only through
builders that drop reverting transactions, privately, so a payment never lands without its
call, and a call that fails costs no one anything. That is why it runs only where builders give
that guarantee: Ethereum today, chains with the same guarantee next.

It speaks x402 v2 `exact` with EIP-3009, as the spec writes it. Where x402 can't express a
guarantee, the relay keeps the guarantee and pays the cost: requests held until inclusion, one
payment per payer in flight, discovery outside the Bazaar.

Composable x402: x402 on the wire, the payment bound to the work.

## Appendix: further practical issues

(From the author's notes.)
