---
date: 2026-11-01
authors:
  - harryr
categories:
  - Bruno
slug: erc-4337-api-key-problem
---

# How did account abstraction end up behind an API key?

ERC-4337 set out to give Ethereum smart accounts without changing the protocol. The idea was
that you'd sign an operation, any bundler could pick it up and pay the gas, and your account
would pay the bundler back, with operations travelling through a shared mempool so that no
single operator got to decide what gets included. On paper, it was as open as sending a
transaction.

What a lot of apps ship today looks quite different: you sign in with Google, a wallet gets
created for you, and your transactions are sponsored, all by one provider and usually only
inside one app. It works, and it's smooth, but it isn't what any of us signed up for. If that's
where we end up, we might as well have used Firebase and saved ourselves the trouble.

<!-- more -->

None of this happened through bad intent. It happened because of a problem that's easy to
state and hard to solve without someone in the middle: who pays for the gas before anyone has
paid for it?

Say you've got some USDT in a wallet but no ETH, and you want to use an app that needs your
approval to spend it. USDT doesn't support permit or EIP-3009, so you can't just sign something
and be done; the approval has to be a transaction of its own, which needs gas, which you don't
have. So before you can do anything at all, someone has to either give you ETH or pay for you,
and whichever way an app gets you around that says a lot about who you end up depending on.

## How we got here

I waited years for account abstraction to arrive as a native feature of Ethereum, and it was
frustrating to watch. [EIP-3074](https://eips.ethereum.org/EIPS/eip-3074) was proposed in late
2020 and would have let a key hand control to a contract, but it spent years in deliberation
before finally being scheduled for Pectra in early 2024. Then in May 2024 Vitalik proposed
[EIP-7702](https://eips.ethereum.org/EIPS/eip-7702), and within weeks support had shifted. The
core developers
[swapped it in](https://galaxy.com/insights/research/ethereum-all-core-developers-execution-call-187)
and [confirmed it](https://paragraph.xyz/@timbeiko.eth/acde-190-recap) a few calls later, and it
[went live with Pectra](https://blog.ethereum.org/2025/04/23/pectra-mainnet) the following May.
It showed that we can move quickly when we want to, and it's why a key today can hand its
account over to smart account code with a single signature, while keeping its address.

In the meantime, [ERC-4337](https://eips.ethereum.org/EIPS/eip-4337) had arrived in September
2021 and given us smart accounts without waiting for a fork, by adding a mempool of its own, a
singleton EntryPoint contract, and bundlers to carry operations on chain. It worked, and a
whole ecosystem grew up around it, but I still think it's overengineered, because its mempool
carries far more restrictions than Ethereum's own, with
[validation rules](https://eips.ethereum.org/EIPS/eip-7562) on which opcodes an account may use
and which storage it may touch, plus staking and reputation for the contracts involved.

I see the bundler economy as a symptom, because the protocol didn't offer what people needed,
so a shadow economy formed to supply it and entire companies were built to do something that
probably didn't need doing. Once a company exists to fill a gap, its business depends on the
gap, and the way to grow is to own more of the path around it, so what happened next was
predictable.

ERC-4337's answer to the first-transaction problem is the paymaster, a contract that pays for
an operation from its own deposit. Whoever runs it carries the risk, so it needs to know who
it's paying for. That means an account, a key to tie requests to the account, limits on what
it will spend, and a bill at the end of the month. Once the paymaster needs an account, there's
little reason for the bundler not to need one too, and once you have the developer's account,
the SDK, the wallet and the login can come from the same place. The developer, not the user,
becomes the customer.

## What the easy route costs

The easy routes come in a few shapes, with varying degrees of lock-in. There's the vendor's
paymaster, which sponsors your users' gas on your account. There's the embedded wallet, where
your users sign in with an email or a social login and the key is held by the provider, or
split between the provider and the user. And there are accounts that only make sense inside the
app that created them. Most stacks combine all three, from one vendor, and each is a sensible
choice when you're trying to ship. Together they're vertical integration, where Ethereum's
strength has always been composability, any wallet with any app through any provider.

The direct cost is easy to see. Much of what's paid isn't for gas, it's for an account with a
vendor whose service could in principle be open to anyone.

| Provider | What it charges on top of gas |
| --- | --- |
| [Pimlico](https://pimlico.io/pricing) | 10% on sponsored gas on mainnet |
| [Alchemy](https://www.alchemy.com/pricing) | An 8% admin fee on sponsored gas, its APIs billed by compute unit, larger plans through sales |
| [ZeroDev](https://zerodev.app/pricing) | 8% on sponsored gas, on top of a monthly plan |

The indirect cost is harder to see until it happens. Every one of those services is an
intermediary paying for something on your users' behalf, and that payment can stop. The vendor
finds the plan isn't commercially viable, or the company card on the account expires, or the
vendor simply stops the service, as [Biconomy did with its bundler](https://blog.biconomy.io/upgrade-path-from-biconomy-v2-to-nexus-post-feb-28-26).
Then every transaction in the app comes to a halt. If the app is open source, someone can point
it at another provider and it's a hiccup. If it's closed source, and its users' keys and
accounts live with that provider, it's permanently dead.

Teams choose this for good reasons: a name they trust, and not having to run infrastructure.
But a bundler at a public URL asks for no infrastructure either, and in the age of LLM coding
agents, adding a second one as an option is an afternoon's work.

## An operation that pays for itself

There's another answer to the first-transaction problem. If the operation pays its own fee as
it runs, nobody has to pay anything up front.

An ERC-4337 operation can already do this in ETH, because its gas fields pay the bundler without
any paymaster involved, and it can do it in a token too if one of the account's own calls
transfers the fee to the bundler as part of the same operation. The bundler simulates it,
checks that it pays enough, and only sends it if it does. That means a bundler working this way
doesn't need to know anything about who sent the operation, so it doesn't need accounts, keys
or spending limits, because it never spends anything it isn't paid back in the same
transaction, and its URL can simply be public.

On Ethereum it can go a step further, because builders accept bundles and will drop any
transaction in one that would revert. A bundler that sends this way never gets a failing
operation included, so a failed operation costs its sender nothing, and doesn't cost the
bundler anything either.

So back to you, with your USDT and no ETH. With EIP-7702 you can delegate your account to a
smart account implementation just by signing an authorization, which is a signature rather than
a transaction, and then your very first operation can do everything in one go. It swaps a
little of the USDT into a token the bundler accepts, makes the app's calls (the approval, with
USDT's allowance zeroed first, then a swap through whichever router the app uses, a deposit or
a transfer), and pays the bundler's fee out of that first swap. All you needed was a signature
and your tokens, and all the app needed was a bundler URL, and because nobody had to pay for you
up front, nobody needed to know who you were.

## What we'd like to see

None of this is absolute. There's a scale between the cypherpunk ideal, where anyone can serve
anyone and no company sits in the path of every transaction, and the realities of running a
business, and most good products sit somewhere along it. What worries me is how far the default
has drifted toward one end, mostly by accident, one easy choice at a time.

Moving it back doesn't take much. A bundler URL should be a setting, like an RPC URL. Most
developers already treat their RPC provider this way: they pick one, keep a fallback, and switch
when the price or the service changes. Nobody expects an RPC provider's SDK to work only with
its own nodes.

Bundlers could work the same way. [ERC-7769](https://eips.ethereum.org/EIPS/eip-7769) gives
them a common JSON-RPC interface, and the account SDKs already accept any URL;
[ZeroDev's docs](https://docs.zerodev.app/api-and-toolings/infrastructure/choose-an-infra-provider)
say bundlers are "perfectly interoperable". What's missing is the habit. Examples and
quickstarts embed a vendor's endpoint with a key, so the first bundler an app uses is the one it
keeps.

So we'd like to see SDK examples that take the bundler URL as configuration, with docs that
show how to use another, or several with a fallback. We'd like developers to choose their
bundler the way they choose their RPC provider, so that changing it is a one-line change and not
a migration. And we'd like bundlers that take their payment from the operation itself, so their
URLs can be public, with no account needed to try one.

None of this asks anyone to give anything up. A vendor whose bundler is good keeps its users
because they choose it.

---

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
SDKs. For an operation paying in ETH, the integration is the bundler URL. Paying in a token
takes a few lines more, to add the payment call.

```ts
const bundlerClient = createBundlerClient({
  client: publicClient,
  transport: http("https://bruno.mailam.app/ethereum"),
});
```

Agents can pay it over x402 too, holding nothing but USDC. The documentation is at
[docs.mailam.app/bruno](https://docs.mailam.app/bruno/), and the code at
[github.com/mai-lam-labs/bruno](https://github.com/mai-lam-labs/bruno).
