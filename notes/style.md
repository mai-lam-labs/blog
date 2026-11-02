# Style

How the posts should read. The aim is a practitioner thinking out loud with peers: someone who has
done the work, ran into something, and wants to talk it through. In the terms below, the posts are
personal essays in classic style, with reflective passages, not reports in practical style. They
sit on the technical side, but lighter, because the lightness comes from the narrator, the
momentum and the scenes, not from leaving the technical detail out.

## Voice

- **We and I.** "We" usually means developers as a whole, people like us, rather than only the team
  ("we keep reaching for API keys"). "I" is for specific things from the author's own experience,
  where the claim rests on what happened to me and not on a generalisation about everyone else ("I
  waited years for account abstraction").
- **A narrator who was there.** Say what bugged us, what surprised us, what we tried. The reader
  should be able to tell the post came from doing the work, not from reading the spec.
- **A stance, carried through.** Every post needs the author's actual view of its subject, in a
  sentence or two ("I still think it's overengineered"), and the stance should last to the end,
  not fade into impersonal explanation after the opening. Words like "frustrating", "I still
  think" and "embarrassingly ordinary" do this work. Don't put feelings or opinions in the
  author's mouth that they haven't expressed.
- **Talk to the reader.** "You" in a scenario ("say you've got some USDT…") is more natural than
  "a user", and brings the reader into the problem.
- **Generous first.** Say what the thing does well, and why people use it, before what's wrong with
  it. The criticism lands harder from someone who wants it to work.
- **Pointed, not hostile.** It's fine to name the elephant in the room and say a problem was
  predictable. Be fair to the people involved: point at patterns and incentives, not at named
  products or their teams.
- **Conversational words are fine** ("bugging", "an arm and a leg"). Slogans and sweeping claims
  about what everyone does are not.

## Shape

- **The question before the answer.** Open with the situation, then the thing that doesn't fit, and
  let the reader arrive at the question with us. Then why it happens, what would fix it, and an
  invitation.
- **A narrative spine, not a list.** Tell problems in the order they were met, each leading to the
  next ("the first was…", "the second was…", "once we'd dealt with that…"), rather than as
  parallel numbered findings. A list tells the reader what's coming, and nothing pulls them on.
- **Stories before mechanisms.** If something happened (a client times out, signs again and pays
  twice), tell it as it happened, then explain the mechanism behind it.
- **A scene can bookend.** Introduce a concrete case early as the problem (a user holding USDT and
  no ETH) and come back to it near the end as the payoff, rather than opening with the solution.
- **Few headings.** Three or four in a 1,500-word post, each marking a turn in the argument, not a
  new topic. Inside a section, topic sentences do the signposting. No numbered headings, and no
  headings that state the conclusion before the reasoning.
- **End with a direction, then our part.** The close is a call to action, the way we think things
  should go and what readers can do now, flowing into how we're doing our small part with our own
  project. Don't commit us to anything we haven't decided to do, such as opening issues upstream.
- **Titles.** Usually a question. It doesn't have to be one the post fully answers; it condenses the
  line of thinking down to what's interesting about it. This is a judgement call, not a rule.

## Sentences

- **Let sentences connect.** Join ideas with "so", "but", "which means", "because". A run of short
  declarative sentences, each a verdict, reads like a list of facts with no one behind them.
- **Write it as you'd say it.** A chain of cause and effect is one thought, so it reads best as
  one or two sentences held together by "so", "which" and "because", the way you'd explain it
  out loud, not as five sentences each stating one step. Main clause first, with the detail
  building up after it.
- **Pick up where the last sentence left off.** Start each sentence with something the reader
  already has, and end it with something new, so that one sentence's end becomes the next one's
  start. A paragraph whose every sentence opens on a fresh subject reads as disconnected.
- **People and things do things.** Make the actors the subjects and their actions the verbs ("the
  client signs", "the bundler simulates it"), rather than turning actions into nouns ("a
  request-bound payment", "a settlement receipt"). Keep code spans to what the reader needs.
- **Keep the subject and its verb together.** "EIP-3074 was proposed in late 2020 and would
  have let a key hand control to a contract, but…", not "EIP-3074, which let a key hand control
  to a contract, was proposed in October 2020".
- **No orphaned conclusions.** A sentence like "Today a key can delegate with a signature" left
  at the end of a paragraph should be tied to what led to it ("…and it's why a key today can…").
- **Vary the rhythm.** Mostly flowing sentences, with a short one now and then for emphasis.
- **Say the thing, not a metaphor for it.** "The payment doesn't say which request it's for", not
  "the shape stops fitting".
- **Links on the words.** Put a link on the name or phrase it supports ("[EIP-3074](…) was
  proposed"), not in brackets after it ("EIP-3074 ([EIP-3074](…))").
- **No em dashes.** Use a comma, a full stop, brackets or a new sentence.
- **No rhetorical colons.** No "Not because of X: because of Y", no "A, B, C: nothing needed", no
  slogans to close a section.
- **Normal word order.** No inversions.

## Terms

Names for what goes wrong, so feedback can be short ("too paratactic here").

- **Practical style** (Thomas and Turner, *Clear and Simple as the Truth*): the style of memos and
  manuals, impersonal and enumerated, organised for someone who needs to act. Right for the docs,
  wrong for the posts.
- **Classic style** (the same, and Pinker's *The Sense of Style*): the writer has seen something
  and points it out to an intelligent equal, as if in conversation. What the posts aim for, with
  **contemplative** passages where the writer reflects on what it means.
- **Parataxis:** clauses set side by side with nothing saying how they relate. **Asyndeton:** the
  same without even "and" ("a 402 names the price, the client signs, the server settles"). Fine
  once for effect; throughout, it's the "fact. fact. fact." problem.
- **Gnomic or aphoristic sentences:** bare verdicts ("that is the right shape").
- **Hypotaxis:** clauses joined by subordination ("because", "so", "which"), saying how claims
  relate. What the posts should mostly use.
- **Cumulative sentence** (Francis Christensen): the main clause first, modifiers building up after
  it ("It worked, and a whole ecosystem grew up around it, but I still think it's
  overengineered, because…"). The shape of speech.
- **Centre-embedding:** a clause stuck between the subject and its verb, making the reader hold the
  subject in mind. **End focus:** putting the new or weighty information at the end of the
  sentence instead.
- **Given–new** (Joseph Williams, *Style: Lessons in Clarity and Grace*, after Halliday): old
  information first, new information last, so sentences chain.
- **Nominalisation** (also Williams): an action turned into a noun. Williams' rule is characters as
  subjects, actions as verbs.
- **Stance and engagement markers** (Ken Hyland, on metadiscourse): words that show where the
  writer stands ("I still think", "frustrating") and that bring the reader in ("you", "say
  you've got").
- **Narrative versus enumerative structure:** a spine the reader follows forward, versus parallel
  items of equal weight.

## Example

Before, a run of verdicts:

> x402 makes a payment one HTTP round trip: a 402 names the price, the client signs, the server
> settles and answers. For a fraction of a cent of API access, settled by a facilitator on a fast
> L2, that is the right shape. Pay for something on chain with it, something worth more than the
> request it rides on, and the shape stops fitting. Not because of a bug: because of where x402
> puts the payment.

After, the situation, a narrator and a question:

> x402 has made it easy to pay a fraction of a cent for API access on fast L2 chains, and it's
> quickly growing in the agentic and machine-to-machine spaces as an alternative to
> advertising-subsidised services, individual API keys, and pre- or post-paid billing
> relationships. But something has been bugging us the more we integrate, develop and provide
> x402-paid services: what binds the payment to the service?

And a story told as it happened:

> The first thing we ran into was embarrassingly ordinary. A client sends a paid request, the
> response takes a little too long, and the client does what clients do: it gives up and tries
> again. That means a fresh signature, and a fresh payment. Nothing in either payment says they're
> for the same thing, because the EIP-3009 authorization only commits to who pays whom, how much,
> and when. So if the server settles both, it's been paid twice for one request.

A scenario as a list of steps, then as speech:

> Take someone who holds USDT and no ETH. They want to use an app, and the app needs them to
> approve it to spend their USDT. USDT has no permit and no EIP-3009, so the approval has to be a
> transaction of its own, and the transaction needs gas, which they don't have. Before they can
> do anything at all, someone has to give them ETH or pay for them.

> Say you've got some USDT in a wallet but no ETH, and you want to use an app that needs your
> approval to spend it. USDT doesn't support permit or EIP-3009, so you can't just sign something
> and be done; the approval has to be a transaction of its own, which needs gas, which you don't
> have. So before you can do anything at all, someone has to either give you ETH or pay for you.

A centre-embedded sentence and an orphaned conclusion, then joined up:

> EIP-3074, which let a key hand control to a contract, was proposed in October 2020 and finally
> scheduled for Pectra in early 2024. […] Today a key can delegate to smart account code with a
> signature, and keep its address.

> EIP-3074 was proposed in late 2020 and would have let a key hand control to a contract, but it
> spent years in deliberation before finally being scheduled for Pectra in early 2024. […] It
> showed that we can move quickly when we want to, and it's why a key today can hand its account
> over to smart account code with a single signature, while keeping its address.

## Sources

Every claim links to a public source that we've actually read. Don't cite internal docs, plans or
files, and drop any claim whose source can't be retrieved.
