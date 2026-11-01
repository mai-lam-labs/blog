---
date: 2026-11-01
authors:
  - harryr
categories:
  - Bruno
slug: erc-4337-api-key-problem
---

# ERC-4337's API key problem

ERC-4337 set out to give Ethereum smart accounts without changing the protocol. A user signs an
operation, any bundler picks it up, and the bundler pays the gas and is paid back from the
account. Operations were to travel through a shared mempool, so that no single operator could
decide what gets included. It was meant to be as open as sending a transaction.

Today, using a bundler starts with signing up. You create an account with a vendor, get an API
key, and put it in the bundler URL. The SDK you install is usually the same vendor's, and its
examples point at its own endpoint. If your users have no ETH, which is most users, you also
need the vendor's paymaster. That means a deposit, a spending policy and a monthly plan.

<!-- more -->

None of this is a failure of the standard. It follows from one question: who pays for the gas
before anyone has paid for it?

## How we got here

I waited years for account abstraction to arrive as a native feature of Ethereum, and it was
frustrating to watch. EIP-3074, which let a key hand control to a contract, was proposed in
October 2020 ([EIP-3074](https://eips.ethereum.org/EIPS/eip-3074)). It was finally scheduled
for Pectra in early 2024. In May 2024, Vitalik proposed EIP-7702
([EIP-7702](https://eips.ethereum.org/EIPS/eip-7702)), and within weeks the core developers
swapped it in
([ACDE #187](https://galaxy.com/insights/research/ethereum-all-core-developers-execution-call-187),
[ACDE #190](https://paragraph.xyz/@timbeiko.eth/acde-190-recap)). Pectra activated it in May 2025
([Ethereum Foundation](https://blog.ethereum.org/2025/04/23/pectra-mainnet)). Today a key can
delegate to smart account code with a signature, and keep its address.

In the meantime, ERC-4337 ([ERC-4337](https://eips.ethereum.org/EIPS/eip-4337)), from September
2021, gave us smart accounts without waiting for a fork: an alternative mempool, a singleton
EntryPoint contract, and bundlers to carry operations on chain. It worked, and a whole
ecosystem grew up around it. I still think it's overengineered. Operations travel through a
mempool of their own, with far more restrictions than Ethereum's: validation rules on which
opcodes an account may use and which storage it may touch, staking, and reputation for the
contracts involved ([ERC-7562](https://eips.ethereum.org/EIPS/eip-7562)).

I see the bundler economy as a symptom. The protocol didn't offer what people needed, so a
shadow economy formed to supply it, and entire companies were built to do something that
probably didn't need doing. That's worth learning from. It's also why the habits it left
behind deserve a second look now that the protocol has caught up.

## The paymaster is the product

A new user holds no ETH. Their first operation needs gas, so someone has to pay it up front and
hope to be repaid. ERC-4337's answer is the paymaster, a contract that pays for an operation
from its own deposit. Whoever runs it carries the risk. So a paymaster needs to know who it's
paying for. It needs an account, a key to tie requests to that account, limits on what it will
spend, and a way to bill for it.

Once the paymaster needs an account, there's little reason for the bundler not to need one too.
The two are sold together, priced per month or as a markup on gas, and billed to the developer.
The developer, not the user, becomes the customer.

## What it costs to let someone in

For an established app, a gas plan is a line item. For a team still finding its users, it's a
cost paid before the first transaction, on top of the gas itself.
[Pimlico](https://pimlico.io/pricing) adds 10% to sponsored gas on mainnet.
[Alchemy](https://www.alchemy.com/pricing) adds an 8% admin fee to it, bills its APIs by compute
unit, and sends anything larger to sales. [ZeroDev](https://zerodev.app/pricing) adds 8% on top
of a monthly plan. [Privy](https://www.privy.io/pricing) charges by active user, up to a
$2,000 base fee past 10,000 of them. Much of what's paid isn't for gas. It's for an
account with a vendor whose service could, in principle, be open to anyone.

Teams pay it for good reasons: a name they trust, and not having to run infrastructure. A
bundler at a public URL asks for no infrastructure either. In the age of LLM coding agents,
adding a second bundler as an option is an afternoon's work, not a project.

## An operation that pays for itself

There's another answer to the question. If the operation pays its own fee as it runs, nobody
has to pay anything up front.

An ERC-4337 operation can already do this in ETH: its gas fields pay the bundler, with no
paymaster. It can do it in a token too. One of the account's own calls transfers the fee to the
bundler, in the same operation as everything else it does. The bundler simulates the operation,
checks that it pays enough, and sends it. If it doesn't pay, it isn't sent.

A bundler that works this way needs to know nothing about who sent the operation. It needs no
account, no key and no spending limits, because it never spends anything it isn't paid back in
the same transaction. Its URL can be public.

On Ethereum, it can go further. Builders accept bundles and drop a transaction in one that would
revert. A bundler that sends this way never has an operation included that fails, so a failed
operation costs its sender nothing. The bundler doesn't pay for it either.

## The first transaction, from any token

Take a user holding USDT and no ETH. USDT has no permit and no EIP-3009, so every app wants an
approval first, and the approval needs gas.

With EIP-7702, the user delegates their account to a smart account implementation by signing an
authorization. That signature is not a transaction. The first operation can then do everything
in one go:

1. swap part of the USDT into a token the bundler accepts, enough to cover the fee;
2. make the app's calls: the approval (USDT's set to zero first), a swap through whichever
   router the app uses, a deposit, a transfer;
3. pay the bundler's fee in the token from the first step.

The user needed a signature and the token, nothing else. The app needed a bundler URL.

## What we'd like to see

A bundler URL should be a setting, like an RPC URL. Most developers already treat their RPC
provider this way: they pick one, keep a fallback, and switch when the price or the service
changes. Nobody expects an RPC provider's SDK to work only with its own nodes.

Bundlers could work the same way. ERC-7769 gives them a common JSON-RPC interface, and the
account SDKs already accept any URL; ZeroDev's docs say bundlers are "perfectly interoperable"
([ZeroDev](https://docs.zerodev.app/api-and-toolings/infrastructure/choose-an-infra-provider)).
What's missing is the habit. Examples and quickstarts embed a vendor's endpoint with a key, so
the first bundler an app uses is the one it keeps.

We'd like to see:

- SDK examples that take the bundler URL as configuration, and docs that show how to use
  another, or several with a fallback;
- developers choosing their bundler as they choose their RPC provider, so that changing it is a
  one-line change, not a migration (when Biconomy stopped its bundler, its users had to move);
- bundlers that take payment from the operation itself, so their URLs can be public, with no
  account needed to try one.

None of this asks anyone to give anything up. A vendor whose bundler is good keeps its users
because they choose it.

## What we run

We built Bruno to work this way. It's a gas relay that sends your transaction first and is paid
during it, from the tokens the account holds or from what the call itself releases. It's also an
ERC-4337 bundler, at a public URL, with no API key, no account and no deposit.

It's built on a few principles:

- **Permissionless.** Anyone can send through it. Nothing to sign up for, and nothing to ask.
- **Paid on delivery.** An operation pays Bruno as it runs, in ETH by its fees or in a token by
  one of its calls, at a price quoted from on-chain pools before signing. Bruno is never a
  paymaster, so it fronts nothing it isn't paid back in the same transaction.
- **Never charged for failure.** Wherever builders offer it, Bruno sends only as bundles,
  through `eth_sendBundle`, and a bundled transaction that would revert is dropped, not
  included. An operation that fails costs its sender nothing.
- **Open.** The relay is open source, under the AGPL, and its specification is public, heading
  for an ERC.

It serves Ethereum and Sepolia, EntryPoint v0.7 and v0.8, and EIP-7702 accounts as well as
smart accounts. It's tested with viem, permissionless.js, ZeroDev, Alchemy's and MetaMask's
SDKs. For an operation paying in ETH, the integration is the bundler URL; paying in a token
takes a few lines more, to add the payment call:

```ts
const bundlerClient = createBundlerClient({
  client: publicClient,
  transport: http("https://bruno.mailam.app/ethereum"),
});
```

Agents can pay it over x402 too, holding nothing but USDC. The documentation is at
[docs.mailam.app/bruno](https://docs.mailam.app/bruno/), and the code at
[github.com/mai-lam-labs/bruno](https://github.com/mai-lam-labs/bruno).
