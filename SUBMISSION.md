# Submission material

## Project summary (238 words)

India's public services are not badly built. They are **separately** built.

IRCTC, Income Tax, GST, EPFO, MCA, Parivahan, RTI, CPGRAMS, Cyber Crime and UMANG each independently
solved identity, forms, status tracking, notifications and support. Each solution is reasonable on its own.
Together they push the integration work onto the citizen, who must know which department owns their
problem before they can begin, then re-enter the same verified facts ten times, then check ten different
places to be told "pending".

Gov.in is not an eleventh portal. It is the layer underneath.

One verified identity. One front door that takes a goal — "renew my passport", "I'm moving to Bangalore",
"someone took ₹48,000 from my UPI" — and resolves it. Deterministically when the intent is clear; through a
registry-grounded AI layer only when it genuinely isn't; by composing existing capabilities across four
departments when no single service answers. One case history, one inbox, one timeline. Departments keep
owning their data, their rules, their officers and their brand.

Everything is configuration. Ten departments are a service registry; every journey is a config object
rendered by one engine. The eleventh department is an entry, not a codebase. Consent is per-attribute and
per-purpose, written to a ledger you can read and revoke — signing in grants nothing.

Migration is explicit: adapters first, native journeys second, shared primitives third, portal retirement
last. Adapters are the mechanism, not the destination.

---

## 2-minute demo video script

**0:00–0:15 — the problem, shown not stated**
Landing page. Ten department tiles, each labelled *Separate login*, then the single Gov.in mark below them.
> "India has ten excellent public services. It has ten of them. Ten logins, ten interfaces, ten places to be
> told your application is pending. Why should a citizen have to understand government to use it?"

**0:15–0:30 — one identity**
Click **Continue as demo citizen**. Land on home.
> "One identity. Government already knows this person — so it opens by telling them what needs attention,
> instead of asking them to go and look."

**0:30–0:58 — the killer journey**
Click *Your passport expires in 46 days*.
> "Nobody typed this. Every field shows where it came from and which department owns it."
Show the consent card.
> "Passport Seva asks for one thing, for one stated reason. Signing in didn't grant it."
Appointment slot, review, **Submit** → case page.
> "Sixty-eight fields on Passport Seva. Nine reused, zero typed here."

**0:58–1:20 — no single service answers this**
Home, type *I am moving to Bangalore next month*.
> "There is no government service called moving house. There are five, in four ministries. So the system
> composes one — from capabilities that already exist. It may compose government. It may not invent it."
Point at the badge: *Composed journey · resolved by the AI layer*.
> "And when you just say 'renew my passport', no model runs at all. The interface tells you which happened."

**1:20–1:38 — proactive, not autonomous**
Open the scheme card → `/schemes/medcs`.
> "Government noticed a scheme exists. It has *not* checked whether you qualify — that's your data, so it
> asks first, and then shows all five conditions it judged you on. Rejections stop being mysterious."

**1:38–1:52 — it's one system**
Inbox → timeline → services grid.
> "Every department writes to one inbox, one history. Each keeps its own identity. None of them built a
> notification system."

**1:52–2:00 — the argument**
`/architecture`, on the stack diagram.
> "We didn't redesign ten portals. We redesigned what they sit on. One government. One citizen experience."

---

## Judge quick-path (if they explore unguided)

1. `/` → Continue as demo citizen
2. Home → passport action card → complete the journey → submit
3. Intent bar → type *I am moving to Bangalore next month*
4. `/schemes/medcs` → Allow this check
5. `/architecture`
6. Sidebar → **Reset demo** to hand it to the next judge clean
