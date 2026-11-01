# ERC-4337's API key problem: outline

Audience: developers building apps on Ethereum, and the account-abstraction community. Name the
ERCs, don't restate them. The content is what the ecosystem looks like today, what it costs the
people building on it, and a bundler that works another way. Every figure and claim about
another project needs a public source before publishing.

## Working title

"ERC-4337's API key problem"

Alternatives: "The permissionless bundler that wasn't"; "Who pays for the first transaction?"

## Hook

An app for people who have never used a blockchain has one problem before any other: its users'
first transaction needs gas they don't have. The usual answer is a vertically integrated stack
from one vendor, Alchemy's for example, with embedded wallets, RPC, a bundler and a paymaster.
It's [expensive](https://www.alchemy.com/pricing), and teams choose it anyway: for the big name,
and because nobody wants to run their own infrastructure.

## Outline

1. **What ERC-4337 promised.** Account abstraction without a protocol change: anyone can run a
   bundler, and user operations travel through a shared mempool that any bundler can draw from,
   under ERC-7562's validation rules. No single operator decides what gets included.
   **How we got here.** ERC-4337 was the way to have smart accounts while the protocol change
   kept slipping. [EIP-3074](https://eips.ethereum.org/EIPS/eip-3074) was proposed in October
   2020, [ERC-4337](https://eips.ethereum.org/EIPS/eip-4337) in September 2021. 3074 was finally
   scheduled for Pectra in 2024; [EIP-7702](https://eips.ethereum.org/EIPS/eip-7702), proposed
   by Vitalik on 2024-05-07, replaced it within weeks
   ([ACDE #187](https://galaxy.com/insights/research/ethereum-all-core-developers-execution-call-187),
   [ACDE #190](https://paragraph.xyz/@timbeiko.eth/acde-190-recap)), and
   [Pectra](https://blog.ethereum.org/2025/04/23/pectra-mainnet) activated it in May 2025. The
   author's own part: waiting years for this.
2. **What happened.**
   - A bundler is, in practice, a hosted API behind a key. The SDKs ship with their own
     vendor's bundler as the default.
   - Two vendors send almost everything on Ethereum. In October 2026, of 971,221 user
     operations, Pimlico's bundlers sent 61.2% and Alchemy's 32.6%; Candide's sent 0.5% and
     Etherspot's 36 operations ([BundleBear](https://bundlebear-api.onrender.com/bundler?chain=ethereum&timeframe=month), our
     sums of its monthly chart; [bundlebear.com](https://www.bundlebear.com/overview/all)).
   - Across all chains it's 41.7 million operations, 56.3% from bundlers BundleBear can't name,
     then Pimlico 23.8%, Coinbase 10.2% and Alchemy 8.9%
     ([BundleBear](https://bundlebear-api.onrender.com/bundler?chain=all&timeframe=month)).
   - The shared mempool has been live on Ethereum, Arbitrum and Optimism since November 2024
     ([Etherspot](https://etherspot.io/blog/erc-4337-shared-mempool-official-launch-on-ethereum-mainnet-arbitrum-and-optimism/)),
     but at its first stage, where "only whitelisted bundlers propagate UserOps"; the stage where
     "any compliant bundler can join and relay" is still ahead
     ([erc4337.io](https://docs.erc4337.io/bundlers/censorship-resistance.html)). Its p2p
     specification was last changed in June 2024
     ([bundler-spec](https://github.com/eth-infinitism/bundler-spec/commits/main/p2p-specs)), one
     of the participants named, Silius, was last pushed in August 2025
     ([silius-rs/silius](https://github.com/silius-rs/silius)), and Alchemy's Rundler still
     lists the p2p mempool as [upcoming](https://github.com/alchemyplatform/rundler#readme).
     Nobody publishes the share of operations that travel through it.
   - A public bundler with no key exists: Etherspot's
     [free bundler](https://github.com/etherspot/free-bundler), endpoints on 7 mainnets and their
     Sepolias, which erc4337.io's [quick-start](https://docs.erc4337.io/userops/quick-start)
     features. It's free "within reasonable usage", funded by an
     [Ethereum Foundation grant](https://etherspot.io/blog/etherspot-receives-ethereum-foundation-grant-to-build-eip-7702-censorship-resistant-infrastructure/)
     (that the grant funds this package is our reading). It's free because someone pays. Others
     that started open now need a key: Candide's mainnet endpoint
     ([AbstractionKit](https://github.com/candidelabs/abstractionkit)) and Etherspot's own
     ([modular SDK](https://github.com/etherspot/etherspot-modular-sdk)).
   - Biconomy
     [shut its bundler down](https://blog.biconomy.io/upgrade-path-from-biconomy-v2-to-nexus-post-feb-28-26)
     on 2026-02-28 and recommended no other. An account tied to one vendor's bundler has to
     move when the vendor does.
3. **Why it went that way: the paymaster.** Most users have no ETH. Someone has to front the
   gas and carry the risk that it isn't repaid, so the paymaster became the product. A paymaster
   needs an account, a deposit, a key, spending limits and a bill. The bundler comes bundled
   with it, and stays as the default after. In October 2026, 40.4% of Ethereum's operations used
   no paymaster, yet nearly all of them still went through the same two vendors' bundlers
   ([BundleBear, paymasters](https://bundlebear-api.onrender.com/paymaster?chain=ethereum&timeframe=month): Pimlico 33.6%,
   Alchemy 13.7%).
4. **What it costs.** The developer is the customer, not the user. Early teams pay fixed
   monthly fees and sponsorship markups to let users take their first step.
   [Pimlico](https://pimlico.io/pricing) charges gas plus 10% for sponsorship on mainnet, with a
   card on file for pay-as-you-go. [Alchemy](https://www.alchemy.com/pricing) bills compute
   units and adds an 8% admin fee on sponsored gas, from prepaid funds.
   [ZeroDev](https://zerodev.app/pricing) charges $69 to $399 a month and an 8% premium on
   sponsored gas. [thirdweb](https://thirdweb.com/pricing) charges $99 to $1,499 a month, per
   transaction past 1,000, and a 2.5% gas surcharge on mainnet.
   [Privy](https://www.privy.io/pricing) charges $299 to $499 a month by active users, then a
   $2,000 base fee, with gas sponsorship at cost "plus a convenience fee"
   ([Privy's docs](https://docs.privy.io/wallets/gas-and-asset-management/gas/overview)). Teams pay it for the
   name and to avoid running infrastructure, though a bundler URL needs none, and with an LLM
   coding agent adding another bundler as an option is a small piece of work.
5. **The other way: an operation that pays for itself.** If an op pays its own fee, in ETH
   through its gas fields or in a token through one of its calls, nobody has to front anything.
   The bundler needs no account, no key and no limits: it checks that the op pays enough and
   sends it. On Ethereum, a bundle containing a transaction that reverts is invalid unless the
   sender allows it ([Flashbots](https://docs.flashbots.net/flashbots-auction/advanced/understanding-bundles)),
   so an op that would fail is never included and costs nothing. Builders have broken this
   before: in August 2023 a Flashbots builder included 722 reverting transactions, about 10.2
   ETH of gas
   ([disclosure](https://collective.flashbots.net/t/disclosure-flashbots-builder-included-reverting-transactions-in-blocks/2214)).
6. **The first transaction, from any token.** The worked example: a user holding USDT and no
   ETH. With EIP-7702, the delegation is a signature, so one operation can swap part of the
   token into one the bundler accepts, make the app's approvals and calls, and pay the fee.
7. **What we'd like to see.** Changing the bundler URL as standard practice: SDKs and their
   docs treating the bundler as configuration the developer chooses, with examples that take
   the URL rather than embedding a vendor's endpoint. Developers choose, and switching costs
   nothing, which matters when a vendor leaves, as Biconomy did. Bundlers that take payment
   from the op, so their URLs can be public.
8. **What we run.** An elevator pitch. A bundler on Ethereum and Sepolia with no key, priced from on-chain pools,
   paid only when the op lands, never a paymaster. Changing the bundler URL in viem,
   permissionless.js, ZeroDev, Alchemy's or MetaMask's SDK is the whole integration. Its
   specification is open, and heading for an ERC.
