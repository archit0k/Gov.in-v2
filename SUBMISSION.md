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

**0:00–0:14 — the problem, shown not stated**
Landing page. Ten department tiles, each labelled *Separate login*, then the single Gov.in mark below them.
> "India has ten excellent public services. It has ten of them. Ten logins, ten interfaces, ten places to be
> told your application is pending. Why should a citizen have to understand government to use it?"

**0:14–0:26 — one identity**
Click **Continue as demo citizen**. Land on home.
> "One identity. Government already knows this person — so it opens by telling them what needs attention,
> instead of waiting to be searched."

**0:26–0:52 — the journey**
Click *Your passport expires in 46 days*. Move fast through the steps.
> "Nobody typed any of this. Every value shows where it came from and which department owns it."
Pause on the consent card.
> "Passport Seva asks for one thing, for one stated reason. Signing in didn't grant it."
Appointment slot → review → **Submit** → case page.

**0:52–1:04 — the comparison** *(the frame to hold on)*
Cut to `/before`, annotations on.
> "This is what it replaced. Seventy-eight fields, forty-one of which government already held about him. The
> Ministry receives exactly what it received before. What changed is who does the work of assembling it."

**1:04–1:26 — no single service answers this**
Home, type *I am moving to Bangalore next month*.
> "There is no government service called moving house. There are five, in four ministries. So the system
> composes one — out of capabilities that already exist. It may compose government. It may not invent it."
Point at the badge.
> "And when you just say 'renew my passport', no model runs at all. The interface tells you which happened,
> every time."

**1:26–1:42 — proactive, not autonomous**
Open `/schemes/medcs`.
> "Government noticed a scheme exists. It has *not* checked whether he qualifies — that's his data, so it asks
> first, then shows all five conditions it judged him on. Rejections stop being mysterious."

**1:42–1:52 — a department is its own site, on the same floor**
Open `/passport`. Point at the strip along the top.
> "Different domain, different colour, its own navigation and its own search. No second login — it already
> knows who he is. That is the whole proposal in one screen."

**1:52–2:00 — the argument**
`/architecture`, on the stack diagram.
> "We didn't redesign ten portals. We redesigned what they sit on. One government. One citizen experience."

### Shooting notes

- Record at 1440×900 or wider. The rail collapses under 1024px and the two-column `/before` stacks.
- Light theme reads better on compressed video; the toggle is the labelled row in the rail, above the profile card.
- **Reset demo** in the sidebar before each take — the passport action card must be unread and the counts fresh.
- The intent bar shows what it matched and waits. Read the badge aloud — it says whether the engine or the
  model resolved it — then click through.
- `/before` needs one scroll on the left column to show the *asked again, a page later* annotations in section D.

---

## Judge quick-path (if they explore unguided)

1. `/` → Continue as demo citizen
2. Home → passport action card → complete the journey → submit
3. `/before` → toggle the annotations
4. Intent bar → type *I am moving to Bangalore next month*
5. `/schemes/medcs` → Allow this check
6. `/architecture`
7. Sidebar → **Reset demo** to hand it to the next judge clean

---

## Honest boundary (worth saying out loud if asked)

Real in this build: the service registry, the journey engine, deterministic intent routing with a
registry-grounded model behind it, the consent ledger, and genuine state across cases, inbox and timeline.

Simulated: all citizen data is fictional, department processing is a triggered event rather than a real
officer, payments and appointment inventory are mocked, and identity assurance is asserted rather than
established. No live government system is touched, and none of their code or branding is used.

Accessibility is claimed on the architecture page, so it is checked rather than asserted: every text element
on the home, journey and comparison screens was measured against its composited background in both themes,
and all of them meet WCAG AA. Department colours are derived from one hue per department against the current
surface, so no department can ship an unreadable combination.
