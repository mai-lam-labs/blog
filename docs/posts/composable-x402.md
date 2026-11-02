---
date: 2026-10-28
authors:
  - harryr
categories:
  - Bruno
slug: composable-x402
---

# What binds an x402 payment to the service?

x402 has made it easy to pay a fraction of a cent for API access on fast L2 chains, and it's
quickly growing in the agentic and machine-to-machine spaces as an alternative to
advertising-subsidised services, individual API keys, and pre- or post-paid billing
relationships. An HTTP `402` response names the price and payment details, the client signs a
payment, and the server settles it and answers, all in one round trip. For small payments
settled by a facilitator, that's exactly what you want.

But something has been bugging us the more we integrate, develop and provide x402-paid
services, especially once the payment is for something on chain and worth more than the
request it rides on. What binds the payment to the service?

<!-- more -->

## We've been here before

I've seen the same problems come up time and time again in Web2 payments: webhooks that fail
silently, checkout pages that warn you not to refresh your browser because nothing stops you
being charged twice, push notifications and polling that disagree about what happened, and
merchants with no reliable, ordered record of their own payments. The payments industry learned
the hard way that a payment has to be joined up with the thing it pays for, that retrying it
has to be safe, and that everyone involved needs to know what to expect and when. Cryptography
has its own version of the same lesson, which is that a signature should commit to exactly what
it authorises.

x402 treats the payment as something that happens next to the work rather than as part of it.
The server verifies the payment before doing anything and settles it afterwards, and the only
thing joining the two is the server's word, because the signed authorization commits to a
token, an amount, a recipient and a time window, and says nothing about which request it pays
for, whether the work happened, or what the work produced.

That's a reasonable design for what its authors seem to have had in mind, which is payments of
a cent or less, settled by a facilitator on a chain with fast blocks, where a payment that goes
astray is a rounding error. It shipped quickly and it's been adopted quickly, which is how good
protocols spread. The trouble is that the assumptions spread with it, so every SDK and product
built on x402 now carries the same gaps, and they get harder to fix the longer they're left.
When the payment is the gas for a $40 swap, or the price of a call that has to succeed for the
payment to make sense, each of those gaps turns into a failure you can point to.

## Where the payment and the work come apart

I ran into all of them while building a relay that takes x402 for Ethereum transactions, where
you pay in USDC, don't need any ETH, and the transaction is sent for you. It's x402-compatible,
and we check that with x402's own SDK, so everything below happened while following the spec.

The first was idempotence, and it was embarrassingly ordinary. A client sends a paid request,
the response takes a little too long, and the client does what clients do: it gives up and
tries again. That means a fresh signature, and a fresh payment, and nothing in either payment
says they're for the same thing, because the EIP-3009 authorization only commits to who pays
whom, how much, and when (plus a nonce). So if the server settles both, it's been paid twice
for one request. x402 does have a `payment-identifier` extension that adds an id to the
payment, but it sits outside the signature, so it works as an idempotency key for a client
that's behaving honestly, not as something the server can rely on. We ended up keeping our own
records to catch it, matching pending payments by the payer and by the exact call they pay
for, and holding the second until the first is done, which is the don't-refresh-your-browser
problem all over again. And because nothing ties the payment to the request, a payment that's
been seen once, in a log or by a proxy, is good for any other request at the same price to the
same recipient. What's frustrating is that the fix doesn't need a new field, because the 3009
nonce is the client's to choose, so if the client derives it from the request, the signature it
already makes binds the payment to the request.

The second was expectation management. In x402, success means the payment has settled, and
settled means there's a transaction hash, which is fine when the payment is a transfer on its
own. In our case the payment is made in the same transaction as the work, so that one can't
happen without the other, and since that transaction is signed afresh for each block it
competes for, there's no hash to give until it's included. x402's `settlement_pending` response
has to carry a broadcast hash too, so it doesn't help, and what we do instead is hold the
request open until the transaction is included, which can take a slot or several. Most HTTP
clients give up after a few seconds by default, and although x402 has a `maxTimeoutSeconds`
field that says how long to wait, it's up to every client to honour it.

The other option x402 offers is `upfront`, which settles the payment first and does the work
afterwards, so you get a hash straight away, but the payment is gone whether the work succeeds
or not, with no refund defined. That makes the gap between payment and work official rather
than closing it. What anyone from payments would recognise as the answer is a receipt, where
the server accepts the paid request, answers with a handle, settles the payment and the work
together, and reports the outcome once there is one.

The third was joined-upness. `transferWithAuthorization` can be submitted by anyone who holds
the signature, so the payment can land on its own, in a transaction of its own, whether or not
the call it paid for ever runs, and the only way a server can make the two atomic is to keep
the signature to itself and send both together, privately. EIP-3009 already has the piece that
binds them, `receiveWithAuthorization`, which only the payee can execute, inside its own call,
so a contract that collects its payment that way does its work and takes its payment in the
same step. It composes too, because the payee contract can split, escrow or forward the payment
within the same call. Yet none of x402's EVM methods use it. 3009's transfer, Permit2 through
x402's proxy, and ERC-7710 delegations all move funds to the payee from outside it, even though
a `receive` method is exactly the kind of scheme x402's extensibility allows for.

Facilitators show up in one more place, which is discovery. The Bazaar, x402's discovery
service, is built by facilitators from the payments they settle, so a resource only gets listed
by settling through one, and the facilitator that most clients' Bazaar searches index from
doesn't settle on Ethereum. A server that settles its own payments atomically, together with
the work, has no facilitator to settle through in the first place, so the main way people
passively find x402 services can't see it. It's the same narrow use case again, this time
built into how the ecosystem grows.

## What would help

None of this needs x402 to change shape, and each fix works with x402 as it is on the wire.
Clients could derive the authorization's nonce from the request, so the payment is bound to it
and a retry is recognisably the same purchase. Servers could answer a paid request with a
handle, like a receipt, and report the outcome once it exists. A `receive` scheme would let the
payee contract collect the payment within its own call. And resources could declare themselves
for discovery, with the metadata x402 already has (the `bazaar` extension) and a discovery API
that any host can serve, instead of being found through where they settle.

These aren't new ideas, either. They're what payments and cryptography learned long ago,
and the earlier x402 takes them on, the less every SDK and product built on it will have to
unlearn later. In the meantime, if you're building on x402, whether that's a client, a server
or an SDK, you don't have to wait for the spec to keep these guarantees. You can bind the
payment to the request, wait for the outcome, and make the payment and the work one event
yourself, even where the spec would let you skip it.

## Our small part

That's what we've tried to do with Bruno, our relay, which settles the x402 payment and the
user's transaction in a single transaction. A small
runner makes the transfer, makes the call, and reverts unless both happen. We only send
through builders that drop reverting transactions, and we send privately, so a payment never
lands without its call, and a call that fails costs no one anything. That guarantee is why the
relay runs only where builders give it, which is Ethereum today, with other chains to follow
once they offer the same.

It speaks x402 v2 `exact` with EIP-3009, as the spec writes it. Where x402 can't express a
guarantee we care about, we keep the guarantee and pay the cost ourselves. Requests are held
until inclusion, each payer has one payment in flight at a time, and discovery happens outside
the Bazaar. We'd much rather the payment carried those guarantees itself, so that any x402
service could compose with on-chain work the same way. The documentation is at
[docs.mailam.app/bruno](https://docs.mailam.app/bruno/), and the code at
[github.com/mai-lam-labs/bruno](https://github.com/mai-lam-labs/bruno).
