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

## Run it

```bash
npm install
npm run dev
```

Open `http://localhost:3000` and press **Continue as demo citizen** — no account, no OTP.

### Optional: the AI layer

```bash
cp .env.example .env.local   # then paste your OpenAI key
```

Without a key the deterministic engine handles everything and the product works end to end. With a key,
ambiguous intents and in-journey questions are answered by the model, grounded in the registry
(`lib/ai/model.ts`, `app/api/navigate/route.ts`, `app/api/assist/route.ts`).

## Demo path (about 90 seconds)

1. **`/`** — ten portals, ten logins. Continue as demo citizen.
2. **Home** — "Your passport expires in 46 days." Proactive, from the credential the profile already holds.
3. **Renew passport** — four minutes instead of 68 fields. Watch the source labels under every prefilled value,
   and the consent card that asks for exactly one thing.
4. **Type "I am moving to Bangalore next month"** — no single service answers this. It composes one.
5. **`/schemes/medcs`** — government knows a scheme exists but has *not* checked your eligibility. It asks first,
   and shows all five conditions it judged you on.
6. **`/architecture`** — the stack, the migration path, and an honest line between what is real here and what is simulated.

## Stack

Next.js 16 (App Router) · TypeScript · Tailwind v4 with CSS-variable design tokens · OpenAI (optional, behind one
gateway) · per-visitor persisted session state.

No database on purpose: every judge gets their own clean, fully stateful demo, reset is instant, and there is no
shared mutable state to corrupt mid-judging. The boundaries in `lib/` are drawn where the real service
boundaries would be.
