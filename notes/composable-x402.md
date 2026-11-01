# x402 critique article

## Brief (as handed over)

```markdown
# Brief: x402 critique article — positioning, structure, and launch plan

## Context
- Product: permissionless gasless relay on Ethereum mainnet, the first module of a
  "modular glue" suite that fills gaps between existing blockchain tools.
- Relay settles via builder/bundler infrastructure: private orderflow (no public
  mempool exposure) and reverted transactions cost the operator nothing.
  This is why only mainnet is supported today.
- The relay settles the x402 payment atomically with the user's requested
  transaction.
- Goal of the article: a high-signal technical critique of x402 that doubles as
  the product's positioning and the top of an adoption funnel.
- The author is deeply expert in the engineering. Do not add advice on fee
  recovery, griefing, or relay correctness. Focus on argument, positioning,
  structure, and growth.

## Core thesis
x402 treats payment as a side channel to work rather than part of it. Its design
assumes low-value, facilitator-mediated, fast-finality payments, and those
assumptions break as value rises and when settlement must be atomic with
on-chain execution.

## Objections (from the author's implementation experience)
1. **No nonce binding between request and payment.** The server can't tie a
   payment to a specific request. To detect double-spend attempts (a client
   settling several of the same payment concurrently), the server must track all
   in-flight client nonces itself, or it can't tell which one settled.
   -> Symptom: payment not bound to the request.
2. **Synchronous settlement assumptions.** Atomic payment + transaction means the
   tx ID isn't known in advance, and waiting for inclusion exceeds the default
   timeout of most x402 clients.
   -> Symptom: payment not bound to the transaction's outcome.
3. **transferWithAuthorization only; no receiveWithAuthorization.** The receiving
   contract can't pull funds within its own call, so payment and on-chain
   execution are separate events: one processing doesn't imply the other ran.
   Breaks composability with the contract ecosystem; makes atomic fee splitting
   hard.
   -> Symptom: payment not bound to on-chain execution.
4. **Discovery coupled to facilitator settlement.** Bazaar listing requires
   settling through a facilitator. There are no facilitators on Ethereum
   mainnet, and using one would break the atomic settlement model.
   -> Distribution problem: the main passive discovery channel is closed.
5. Further practical awkwardness, especially at higher values: see the author's
   notes. Candidate for an appendix or follow-up post.

Objections 1–3 are three symptoms of the core thesis; 4 is the growth cost.
VERIFY each claim against the current x402 spec version before publishing.

## Tone and stance
- A technical essay, not a takedown. State each problem, its practical
  consequence, and what correct design looks like.
- Stay wire-compatible with x402; never make adoption contingent on agreeing.
- Position the product as "x402-compatible, with these guarantees."
- Positioning line: "Composable x402."
- Mainnet-only framed as rigor: "we ship only where we can guarantee private
  orderflow and revert protection," with chain expansion conditional on that.

## Constructive proposals (to open upstream as spec issues/PRs)
- Request-bound payment identifier (fixes 1).
- Async settlement / receipt pattern (fixes 2).
- New payment scheme built on receiveWithAuthorization (fixes 3), using x402's
  existing scheme extensibility.
- Decouple discovery from settlement (fixes 4).

## Suggested structure
1. Hook: where x402 breaks once payments carry real value.
2. Thesis: payment as a side channel.
3. Three symptoms, each with a concrete failure scenario.
4. The growth cost: discovery tied to facilitators; none on mainnet.
5. What correct design looks like (proposals above).
6. How the relay delivers it today, staying x402-compatible.
7. Appendix: further practical issues.

## Launch sequence
1. Publish the essay.
2. Same week: open the upstream spec issues and link them from the essay.
3. Immediately after: tutorials that give agreeing readers somewhere to go:
   - "Atomic revenue splits for paid MCP tools" (lead hook; payment, split, and
     execution in one tx)
   - "MEV-protected gasless stablecoin transfers on mainnet"
   - A client wrapper/config that handles async settlement against the relay
4. Build discovery independent of Bazaar: MCP registries, agent tool
   directories, llms.txt.

## Open items for the receiving agent
- Pull the additional objections from the author's notes.
- Align proposals and tutorials with the project roadmap and the next modules.
- Identify which composability use cases (escrow, conditional payments,
  refunds) are planned, for a follow-up post.
- Confirm current status of x402 spec versions, Bazaar requirements, and any
  mainnet facilitators.
```

## Verification against x402 (coinbase/x402 at `0e6e8c5`, 2026-10-23)

Spec copies in `scratchpad/x402spec/`. Each objection as the spec stands:

1. **Request binding: holds, sharpened.** The signed EIP-3009 authorization commits to `from`,
   `to`, `value`, the validity window and a 32-byte nonce: nothing of the request. x402 now has
   a `payment-identifier` extension (`extensions/payment_identifier.md`): a client-chosen id,
   16–128 characters, "an idempotency key", carried in `extensions`, outside the signature. It
   deduplicates retries of an honest client; it doesn't bind the payment, since anyone holding
   the payload can strip or change it. The article must name it, or a reader will.
   Our concrete case differs from the brief's wording: the same signed payment sent twice is
   one submission (same id); the case we handle is a client re-signing after a timeout, a
   different payment for the same request, which the relay matches by payer and exact call
   (`Relay.pending_like`) and holds for the first. The draft uses that.
   Constructive angle found: the 3009 nonce is the client's to choose, so a nonce derived from
   the request (`H(request, salt)`) binds them inside the existing signature, no new field.
2. **Outcome binding: holds, with x402's two provisions named.** `settlement_pending` exists
   (§9) but MUST carry a broadcast transaction hash, which atomic settlement doesn't have before
   inclusion (re-signed per block). The `upfront` flow (§6.1; `exact` MAY use it) gives a hash
   at once by settling first, giving up atomicity. `maxTimeoutSeconds` exists; x402's own MCP
   client sets its read timeout from it; HTTP clients mostly don't (httpx defaults to 5 s).
   "Most x402 clients" time out: true of HTTP clients as configured by default; say so
   precisely.
3. **Execution binding: holds; the framing to lead with.** `exact` on EVM has three methods:
   EIP-3009 (`transferWithAuthorization`), Permit2 (`permitWitnessTransferFrom` through
   `x402ExactPermit2Proxy`, which enforces the receiver: the proxy calls, not the payee), and
   ERC-7710 delegations. None is `receiveWithAuthorization`, whose `msg.sender == to` check
   lets the payee contract collect within its own call. The sharp consequence:
   `transferWithAuthorization` can be submitted by anyone who sees the signature, so the
   payment can land on its own, without the work it pays for. Bruno closes this by private
   orderflow and its runner, not by anything in x402.
4. **Discovery: holds for the Bazaar that matters; "no facilitators on mainnet" is unverified.**
   Bazaar cataloging is done by facilitators from the `PaymentPayload`s they process
   (`extensions/bazaar.md`, "Facilitator Behavior"); §8 lets any facilitator host discovery.
   CDP's facilitator (the one CDP's Bazaar indexes from) settles on Base, Polygon, Arbitrum,
   Monad, World, not Ethereum. docs.x402.org's facilitator list names none for Ethereum, but
   Corbits and Solvador claim multi-EVM coverage: check them before writing "none". Safe
   claim: "the Bazaar most clients search can't see a mainnet resource that settles itself".
   **Correction (2026-10-23): Daydreams' facilitator settles on Ethereum** (`/supported` lists
   `eip155:1`, `exact` and `upto`, keyless). "No facilitators on mainnet" is false; drop it.
   The niche is narrower and still true: **atomic** x402 on Ethereum (the payment can't land
   without the call), which a facilitator settling the transfer alone can't give.

## Consistency with where Bruno is going

- **The niche: atomic x402 on Ethereum mainnet, deployed, within the spec** (`exact`,
  EIP-3009, settled in the call's own transaction). Facilitators do settle on Ethereum
  (Daydreams lists `eip155:1`), but a facilitator settles the transfer alone: none can make
  the payment conditional on the call. Evidence to link: a mainnet x402 settlement through the
  live relay (not run yet; Sepolia's passed).
- **The relay runs on Ethereum and Sepolia,** not mainnet only; Sepolia is the test network.
  "Ship only where we can guarantee private orderflow and revert protection" holds for the
  chains being considered next: Unichain qualifies (public `eth_sendBundle`, revert-protected
  by default, one sequencer), Linea behind Infura's beta.
- **The relay holds x402 requests until mined** (the 200 carries the transaction). Objection 2
  is our own cost, paid deliberately; the article can say so.
- **`upfront` (settle first, any chain) is planned.** The essay argues for atomic; `upfront` is
  then x402's own provision, offered beside atomic where the guarantee is missing, never
  instead. The essay should not read as if Bruno rejects it.
- **"Atomic revenue splits for paid MCP tools"** isn't buildable over x402 yet: x402 over MCP
  can't settle atomically (there's no transaction hash before inclusion), and a split needs a
  forwarding contract. A plain MCP tool (a submission paid by a signed EIP-3009 transfer, with
  a batch from the client's own account) can do payment, split and execution in one
  transaction without x402: a tutorial for that can come sooner.
- **"MEV-protected gasless stablecoin transfers on mainnet"** works by design and is now tested
  locally: the call is the user's own `transferWithAuthorization` to the recipient, the
  payment a second one to the payee, both made by the runner in one transaction through
  builders (AgentKit's `send_usdc_gasless`, from keys and smart wallets). It hasn't run live
  on mainnet.
- **Discovery independent of Bazaar:** `/.well-known/x402`, `/openapi.json` with
  `x-payment-info`, and `llms.txt` exist; listings in the MCP Registry, Glama and Anthropic's
  directory are planned with MCP.
- **Composability follow-up** (escrow, conditional payments, refunds): `auth-capture` (Base
  only) is x402's escrow; conditional payment is what the runner already is.
