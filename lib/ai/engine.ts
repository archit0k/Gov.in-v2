import { JOURNEYS, JOURNEY_MAP } from "@/lib/data/journeys";
import { SERVICES, service, serviceHref } from "@/lib/data/services";
import type { JourneyDef, NavResult, ServiceId } from "@/lib/types";

/* ============================================================
   NAVIGATION ENGINE
   Deterministic first. If the citizen named a known service or
   journey, we open it — no model call, no latency, no chatbot.
   The model is only reached for genuine ambiguity, and even then
   it may only choose from the registries below. It cannot invent
   a government service.
   ============================================================ */

const STOP = new Set([
  "i","my","me","the","a","an","to","for","of","is","do","need","want","how","can","get","please",
  "in","on","with","and","it","this","that","have","has","am","are","new","help","government","govt",
]);

function tokens(q: string) {
  return q
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .split(/\s+/)
    .filter((t) => t.length > 1 && !STOP.has(t));
}

/* ---------- Life events: composition, not invention ---------- */

interface LifeEvent {
  id: string;
  match: RegExp;
  title: string;
  goal: string;
  reading: string;
  parts: { serviceId: ServiceId; title: string; intent: string; journeyId?: string; note: string }[];
}

const LIFE_EVENTS: LifeEvent[] = [
  {
    id: "moving-city",
    match: /\b(mov(e|ing)|relocat|shift(ing|ed)?|new city|changing city|new address|changed address)\b/i,
    title: "Moving to a new city",
    goal: "Change your address once, everywhere it legally matters.",
    reading:
      "This is not one service. Six departments hold your address, and each has its own form. Composed a single journey across the four that legally require an update.",
    parts: [
      { serviceId: "gov-core", title: "Update your verified address", intent: "The shared profile is the source. Everything downstream reads from it.", note: "Infrastructure primitive · Profile" },
      { serviceId: "transport", title: "Licence and vehicle registration", intent: "Statutory: within 30 days of moving, under the Motor Vehicles Act.", journeyId: "dl-address-change", note: "Existing journey · Parivahan" },
      { serviceId: "gst", title: "Principal place of business", intent: "Required if you operate the business from the new address.", journeyId: "gst-address-amend", note: "Existing journey · GSTN" },
      { serviceId: "income-tax", title: "Communication address for notices", intent: "So assessment notices reach you, not your old landlord.", note: "Existing capability · CBDT" },
      { serviceId: "epfo", title: "Member record address", intent: "Not statutory, but claims are rejected on address mismatch.", note: "Existing capability · EPFO" },
    ],
  },
  {
    id: "got-married",
    match: /\b(married|marriage|wedding|got hitched|spouse name|name change after)\b/i,
    title: "Recently married",
    goal: "Record a spouse once, and update only what actually needs it.",
    reading:
      "Marriage does not trigger a single government service. It changes your citizen graph, and four departments read from it.",
    parts: [
      { serviceId: "gov-core", title: "Add spouse to your citizen graph", intent: "One verified relationship, reusable with consent.", note: "Infrastructure primitive · Citizen Graph" },
      { serviceId: "passport", title: "Reissue passport with spouse name", intent: "Optional, but needed for spouse visas in several countries.", journeyId: "passport-renewal", note: "Existing journey · Passport Seva" },
      { serviceId: "epfo", title: "Update nominee", intent: "The single most common cause of contested PF claims.", note: "Existing capability · EPFO" },
      { serviceId: "income-tax", title: "Review joint-ownership declarations", intent: "Only if you now co-own property.", note: "Existing capability · CBDT" },
    ],
  },
  {
    id: "bereavement",
    match: /\b(died|passed away|death|deceased|late father|late mother|my parent)\b/i,
    title: "Handling a family member's affairs",
    goal: "Do what the law requires, in the order that actually works.",
    reading:
      "There is no government service called this. There are eleven, in four ministries, and the order matters. Composed the sequence that will not deadlock.",
    parts: [
      { serviceId: "gov-core", title: "Register the relationship and authority", intent: "Nothing else can proceed without proof you may act.", note: "Infrastructure primitive · Citizen Graph" },
      { serviceId: "epfo", title: "Pension and PF nominee claim", intent: "Time-sensitive. Family pension starts from the date of claim, not the date of death.", note: "Existing capability · EPFO" },
      { serviceId: "income-tax", title: "File the final return as legal heir", intent: "Legally required for the year of death.", note: "Existing capability · CBDT" },
      { serviceId: "transport", title: "Transfer vehicle ownership", intent: "Within 30 days, or the registration lapses.", note: "Existing capability · Parivahan" },
      { serviceId: "mca", title: "Resign or transmit directorships", intent: "Only if the person was a company director.", note: "Existing capability · MCA" },
    ],
  },
  {
    id: "starting-business",
    match: /\b(start(ing)? a (company|business)|incorporat|register (a )?(company|business)|new venture|startup)\b/i,
    title: "Starting a business",
    goal: "Get from idea to legally operating, in the right order.",
    reading:
      "Four departments, and three of them will reject you if you approach them out of order. Composed the correct sequence.",
    parts: [
      { serviceId: "mca", title: "Incorporate the company", intent: "Name reservation, DIN and incorporation in one filing.", journeyId: "mca-dir3-kyc", note: "Existing journey · MCA" },
      { serviceId: "income-tax", title: "PAN and TAN for the company", intent: "Issued from the incorporation filing — you should never apply separately.", note: "Existing capability · CBDT" },
      { serviceId: "gst", title: "GST registration", intent: "Required past the turnover threshold, or immediately for inter-state supply.", journeyId: "gst-address-amend", note: "Existing journey · GSTN" },
      { serviceId: "epfo", title: "Employer registration", intent: "Triggered at 20 employees. We will tell you when.", note: "Existing capability · EPFO" },
    ],
  },
  {
    id: "job-change",
    match: /\b(new job|changed jobs|switch(ed|ing)? (jobs|company)|resign|left my job|joining)\b/i,
    title: "Changing jobs",
    goal: "Carry your money and your record to the new employer.",
    reading: "Two departments care when you change jobs, and one of them will silently lose money for you if you do nothing.",
    parts: [
      { serviceId: "epfo", title: "Transfer your provident fund", intent: "Otherwise you hold two accounts and one stops earning interest.", journeyId: "epfo-transfer", note: "Existing journey · EPFO" },
      { serviceId: "income-tax", title: "Declare previous employer income", intent: "Two Form 16s in one year is the top cause of demand notices.", note: "Existing capability · CBDT" },
      { serviceId: "gov-core", title: "Update employment on your profile", intent: "Keeps loan, visa and verification requests accurate.", note: "Infrastructure primitive · Profile" },
    ],
  },
];

export function composeLifeEvent(ev: LifeEvent): JourneyDef {
  return {
    id: `composed-${ev.id}`,
    title: ev.title,
    goal: ev.goal,
    serviceId: "gov-core",
    composes: ev.parts.map((p) => p.serviceId),
    estMinutes: ev.parts.length * 2,
    legacyEquivalent: `${ev.parts.length} separate portals, each with its own login`,
    legacyFields: ev.parts.length * 28,
    outcome: "Each part is tracked as its own case, under one journey.",
    caseStates: ["Started", "In progress", "Complete"],
    tags: [ev.id],
    ephemeral: true,
    provenance: ev.reading,
    steps: [...ev.parts.map((p) => ({
      id: p.serviceId + "-" + p.title.toLowerCase().replace(/\W+/g, "-").slice(0, 24),
      title: p.title,
      intent: p.intent,
      fields: [
        { id: "note", kind: "note" as const, label: p.note },
        {
          id: "action",
          kind: "radio" as const,
          label: "Do you want to do this now?",
          required: true,
          options: [
            { value: "yes", label: "Yes, include it in this journey" },
            { value: "later", label: "Remind me later", hint: "Added to your actions" },
            { value: "na", label: "Does not apply to me" },
          ],
        },
      ],
    })),
    {
      id: "review",
      title: "Review and start",
      intent: "Each part you include becomes its own case with the owning department. One journey, several departments, one place to watch it.",
      fields: [{ id: "review", kind: "review" as const, label: "Review" }],
    },
    ],
  };
}

/* ---------- Deterministic matcher ---------- */

function scoreJourney(j: JourneyDef, ts: string[], raw: string) {
  const hay = `${j.title} ${j.goal} ${j.tags.join(" ")} ${service(j.serviceId).name}`.toLowerCase();
  let score = 0;
  for (const t of ts) {
    if (j.tags.includes(t)) score += 3;
    else if (hay.includes(t)) score += 2;
  }
  if (raw.length > 3 && j.title.toLowerCase().includes(raw)) score += 6;
  return score;
}

export function navigate(query: string, scope?: ServiceId): NavResult {
  const raw = query.trim().toLowerCase();
  const ts = tokens(query);

  if (!raw) {
    return { mode: "clarify", reading: "Tell us what you need in your own words.", confidence: 0, source: "engine" };
  }

  /* 1 — life event? These are the requests no single portal answers, so a
     department-scoped search never composes one. */
  const ev = scope ? undefined : LIFE_EVENTS.find((e) => e.match.test(query));
  if (ev) {
    const composed = composeLifeEvent(ev);
    return {
      mode: "composed",
      reading: ev.reading,
      confidence: 0.82,
      composed,
      primary: {
        journeyId: composed.id,
        href: `/journeys/${composed.id}`,
        label: composed.title,
        sublabel: `${composed.steps.length} government capabilities, composed into one journey`,
      },
      source: "engine",
    };
  }

  /* 2 — direct journey match. Deterministic wins, always. */
  // Inside a department, only that department's journeys are on offer.
  const pool = scope ? JOURNEYS.filter((j) => j.serviceId === scope) : JOURNEYS;
  const ranked = pool.map((j) => ({ j, s: scoreJourney(j, ts, raw) }))
    .filter((r) => r.s > 0)
    .sort((a, b) => b.s - a.s);

  // A question is not a request to start something. Let the model answer it.
  const isQuestion = /\?$/.test(raw) || /^(what|why|how|when|who|can|should|does|do i|is there|am i)\b/.test(raw);

  if (ranked.length && ranked[0].s >= 3 && !isQuestion) {
    const top = ranked[0].j;
    const close = ranked.filter((r) => r.j.id !== top.id && r.s >= 3 && r.s >= ranked[0].s * 0.7).slice(0, 3);
    return {
      mode: "deterministic",
      reading: `Matched to an existing government journey. No interpretation needed.`,
      confidence: Math.min(0.97, 0.6 + ranked[0].s / 20),
      primary: {
        journeyId: top.id,
        serviceId: top.serviceId,
        href: `/journeys/${top.id}`,
        label: top.title,
        sublabel: `${service(top.serviceId).name} · about ${top.estMinutes} min`,
      },
      alternatives: close.map((r) => ({
        href: `/journeys/${r.j.id}`,
        label: r.j.title,
        sublabel: service(r.j.serviceId).name,
        serviceId: r.j.serviceId,
      })),
      source: "engine",
    };
  }

  /* 3 — service-level match */
  const svc = scope ? undefined : SERVICES.find(
    (s) =>
      ts.some((t) => s.name.toLowerCase().includes(t) || s.shortName.toLowerCase() === t || s.id === t) ||
      s.name.toLowerCase().includes(raw),
  );
  if (svc) {
    return {
      mode: "deterministic",
      // Below the fast-path threshold on purpose: a department name alone is not a goal,
      // so the model gets a chance to read the sentence properly.
      reading: "Matched to a department. Here is everything you can do there.",
      confidence: 0.7,
      primary: {
        serviceId: svc.id,
        href: serviceHref(svc.id),
        label: svc.name,
        sublabel: svc.department,
      },
      source: "engine",
    };
  }

  /* 4 — genuine ambiguity */
  const guesses = ranked.slice(0, 3);
  if (guesses.length) {
    return {
      mode: "clarify",
      reading: "A few journeys could match this. Narrowing it down is faster than guessing wrong.",
      confidence: 0.35,
      clarify: {
        question: "Which is closest to what you need?",
        options: guesses.map((r) => ({ label: r.j.title, href: `/journeys/${r.j.id}` })),
      },
      source: "engine",
    };
  }

  // Inside a department, saying "not here" and pointing at the front door is
  // more honest than quietly routing the citizen to another ministry.
  if (scope) {
    return {
      mode: "clarify",
      reading: `${service(scope).name} has no journey for that. It may well be another department's — the Gov.in front door searches all of them at once.`,
      confidence: 0.1,
      clarify: {
        question: "Where would you like to go?",
        options: [
          { label: "Search across all of government", href: "/home" },
          { label: `Everything ${service(scope).shortName} can do`, href: serviceHref(scope) },
        ],
      },
      source: "engine",
    };
  }

  return {
    mode: "clarify",
    reading:
      "No existing journey matches that yet. Rather than guess, this is logged as an unmet intent — repeated unmet intents are what tell government a service is missing.",
    confidence: 0.1,
    clarify: {
      question: "Is it closest to any of these?",
      options: [
        { label: "Browse all government services", href: "/services" },
        { label: "Raise a grievance", href: "/journeys/cpgrams-grievance" },
        { label: "File an RTI request", href: "/journeys/rti-file" },
      ],
    },
    source: "engine",
  };
}

/** The registry summary the model is allowed to choose from. Nothing else. */
export function groundingCatalogue() {
  return {
    journeys: JOURNEYS.map((j) => ({
      id: j.id,
      title: j.title,
      goal: j.goal,
      department: service(j.serviceId).name,
      tags: j.tags,
    })),
    services: SERVICES.map((s) => ({ id: s.id, name: s.name, department: s.department, summary: s.summary })),
    lifeEvents: LIFE_EVENTS.map((e) => ({ id: e.id, title: e.title, goal: e.goal })),
  };
}

export function lifeEventById(id: string) {
  const ev = LIFE_EVENTS.find((e) => e.id === id);
  return ev ? composeLifeEvent(ev) : undefined;
}

export function allComposable() {
  return LIFE_EVENTS.map(composeLifeEvent);
}

export { JOURNEY_MAP };
