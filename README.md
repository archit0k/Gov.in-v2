# Gov.in

**Shared citizen infrastructure for Indian public services.**
One verified identity, one front door, one case history — while every department keeps owning its data, rules and brand.

Built for *Build What Moves India*. All citizen data is fictional; no government system is touched.

---

## The argument

India's public services are not badly built. They are **separately** built. Ten departments each independently
solved identity, forms, status tracking, notifications and support — so the citizen is left to solve integration
by hand, ten times over.

Gov.in is not an eleventh portal. It is the layer underneath:

| | Aggregation (today) | Shared infrastructure (this) |
|---|---|---|
| Identity | Each service authenticates you separately | Authenticate once; departments get scoped assertions |
| Data | Each department keeps its own copy of you | Departments own their domain; the profile is *requested*, not duplicated |
| Navigation | You browse the government's org chart | You state a goal; the engine finds the journey |
| Composition | Services cannot be combined | One journey can span four departments |
| Tracking | Status lives inside each service | Every submission is a case in one history |

## What is actually built

- **Service registry** — 10 departments as configuration. Drives navigation, search, theming and the architecture page.
- **Journey registry + one journey engine** — every journey is a config object rendered by a single runner
  (`components/journey/JourneyRunner.tsx`). Adding a government service is a registry entry, not a codebase.
- **Navigation engine** — deterministic matching first. The model is only consulted for genuine ambiguity, and it
  may only return identifiers that already exist in the registry; anything else is discarded.
- **Consent ledger** — per-attribute, per-purpose, written by journeys, readable and revocable in the profile.
- **Cases, inbox, timeline** — one event model. Submitting anything updates all three.
- **Composed life-event journeys** — "I'm moving to Bangalore" assembles existing capabilities across four
  departments. The AI may compose government capabilities; it may not invent one.
- **AI mode** (`/ai`) — the front door becomes a conversation for needs that will not fit a search box. It
  opens knowing a first name and nothing else, and asks for each bundle of context separately, with a reason
  and a decline option (`lib/ai/context.ts`). Permission is per conversation and never inherited. It routes
  into journeys; it never submits, pays or cancels.
- **Two departments built out as their own platforms** — `/passport` and `/irctc` have their own domain,
  colour, navigation, sections and scoped search, on one shared shell. Same identity, no second login, and
  deliberately no AI mode: conversation belongs to the layer that can see across departments.
- **Drafting where it earns its place** — an RTI request is rewritten into statutory wording, showing both
  versions, changing how you asked and never what you asked (`app/api/draft/route.ts`).
- **`/before`** — the field burden of the existing passport application beside the same outcome here, with the
  counts computed from one list (`lib/data/legacy.ts`) rather than typed into prose.

## Run it

```bash
npm install
npm run dev
```

Open `http://localhost:3000` and press **Continue as demo citizen** — no account, no OTP.

### Optional: the AI layer

```bash
cp .env.example .env.local
```

Set `OPENAI_API_KEY`. Any OpenAI-compatible endpoint works — set `OPENAI_BASE_URL` and name the model the
way that endpoint names it (`OPENAI_MODEL`). All three routes go through one gateway in `lib/ai/model.ts`,
so the provider is a config line rather than something threaded through the UI.

Without a key the deterministic engine handles every request and the product still works end to end. With a
key, three things get better: ambiguous intents route properly (`app/api/navigate/route.ts`), in-journey
questions are answered in context (`app/api/assist/route.ts`), and RTI requests are redrafted into statutory
wording (`app/api/draft/route.ts`). Every model response is validated against the registry before it is
shown; anything outside it is discarded and the engine answers instead.

## Demo path (about 90 seconds)

1. **`/`** — ten portals, ten logins. Continue as demo citizen.
2. **Home** — "Your passport expires in 46 days." Proactive, from the credential the profile already holds.
3. **Renew passport** — four minutes. Watch the source label under every prefilled value, and the consent card
   that asks for exactly one thing.
4. **`/before`** — the same application today: 78 fields, 41 of which government already holds. Toggle the
   annotations on.
5. **Type "I am moving to Bangalore next month"** — no single service answers this. It composes one.
6. **`/schemes/medcs`** — government knows a scheme exists but has *not* checked your eligibility. It asks first,
   and shows all five conditions it judged you on.
7. **`/architecture`** — the stack, the migration path, and an honest line between what is real here and what is simulated.

## Stack

Next.js 16 (App Router) · TypeScript · Tailwind v4 with CSS-variable design tokens · OpenAI (optional, behind one
gateway) · per-visitor persisted session state.

No database on purpose: every judge gets their own clean, fully stateful demo, reset is instant, and there is no
shared mutable state to corrupt mid-judging. The boundaries in `lib/` are drawn where the real service
boundaries would be.
