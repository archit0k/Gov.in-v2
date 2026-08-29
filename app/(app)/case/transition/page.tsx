"use client";

import { Page, PageHead } from "@/components/shell/AppShell";
import { Badge, Card, SectionTitle, ServiceMark } from "@/components/ui/primitives";
import { SERVICES } from "@/lib/data/services";

/* The migration. Written so that each phase can be read as a standalone
   deliverable, because that is the only version anyone would fund. */

const PHASES = [
  {
    n: 1,
    name: "Registry and identity",
    duration: "About 4 months",
    asks: "Nothing from any department",
    body:
      "Stand up the service registry, the identity federation and the consent ledger. Departments are described in the registry; none of them changes any code. Citizens can sign in once and see a directory that knows what each service is for.",
    delivers: [
      "One sign-in that departments can accept assertions from",
      "A published registry of services and what data each owns",
      "The consent ledger, with nothing yet flowing through it",
    ],
    stopHere: "You have a better directory and a working identity rail. Modest, but not nothing.",
  },
  {
    n: 2,
    name: "One department, one journey, through an adapter",
    duration: "About 3 months",
    asks: "An API contract, and an officer who answers questions",
    body:
      "Pick the highest-volume journey in the country and build it end to end against an adapter over the department's existing system. Nothing is rewritten. The department's database, rules and staff are untouched.",
    delivers: [
      "One complete citizen journey, live",
      "The case record, the inbox and the timeline, proven on real traffic",
      "A measured before and after on completion rate and time to complete",
    ],
    stopHere:
      "This is the phase that decides everything. If the numbers do not move, the idea is wrong and you have spent seven months finding out rather than seven years.",
  },
  {
    n: 3,
    name: "Native journeys",
    duration: "Rolling, per department",
    asks: "That new services are built on the primitives rather than from scratch",
    body:
      "New citizen-facing work is authored on shared identity, consent, cases and notifications. The legacy system becomes a system of record rather than a website. Departments still own their logic; they stop owning their plumbing.",
    delivers: [
      "Each new journey ships faster than the last",
      "Accessibility and language support arrive by inheritance, not per project",
      "Cross-department journeys become possible for the first time",
    ],
    stopHere: "A department that stops here has a modern citizen surface and a legacy core, which is a fine place to sit for years.",
  },
  {
    n: 4,
    name: "Primitive migration",
    duration: "Rolling, per department",
    asks: "Retiring duplicated auth, notification and status code",
    body:
      "Departments switch off their own login, their own form engine, their own status page and their own notification stack. They keep the register, the rules and the officers, which is everything that was ever actually theirs.",
    delivers: [
      "Large reductions in code each department maintains",
      "One consistent security and accessibility posture instead of eleven",
      "A single audit surface for who read what, and why",
    ],
    stopHere: "The saving is real here, and it is the phase a finance ministry cares about.",
  },
  {
    n: 5,
    name: "Portal retirement",
    duration: "Only when the numbers justify it",
    asks: "A political decision, not a technical one",
    body:
      "The old citizen-facing portal is switched off and its traffic redirected. The department has not disappeared. Its front door has.",
    delivers: [
      "One place a citizen learns, instead of eleven",
      "The end of parallel maintenance",
    ],
    stopHere: "This is the destination, and it is also the phase most likely to be deferred indefinitely. Plan for that.",
  },
];

const RULES = [
  {
    t: "Every phase is independently valuable",
    d: "No phase requires the next one to have been funded. If the programme stops after phase two, the country still has one working journey and a rail that other departments can join later.",
  },
  {
    t: "Every phase is reversible",
    d: "Until phase five, the department's own surface is still running. Rolling back means routing traffic to it again, not restoring a database.",
  },
  {
    t: "No department is forced in",
    d: "Departments join because the primitives are cheaper than building their own. If the layer is not good enough to be worth adopting voluntarily, mandating it produces compliance and not adoption.",
  },
  {
    t: "URLs and form field names are never changed silently",
    d: "Route slugs, nav labels and field names carry search ranking, muscle memory and downstream analytics. Breaking them quietly is how modernisation programmes lose the trust of the departments they are trying to help.",
  },
];

const INTEGRATION_LABEL = {
  native: { label: "Ready for phase 3", tone: "ok" as const },
  adapter: { label: "Phase 2, adapter", tone: "info" as const },
  "legacy-api": { label: "Phase 1, legacy API", tone: "warn" as const },
};

export default function TransitionPage() {
  return (
    <Page>
      <PageHead
        eyebrow={<Badge tone="accent">Migration</Badge>}
        title="How you get from today to this"
        sub="Five phases. Each one delivers something on its own, each one is reversible, and none of them starts with switching anything off."
      />

      <section className="mb-10">
        <div className="grid gap-3">
          {PHASES.map((p) => (
            <Card key={p.n} className="p-5">
              <div className="flex flex-wrap items-baseline gap-x-4 gap-y-1">
                <span className="tnum grid h-7 w-7 shrink-0 place-items-center rounded-full bg-[var(--accent)] text-[12.5px] font-semibold text-white">
                  {p.n}
                </span>
                <h2 className="text-[17px] font-semibold">{p.name}</h2>
                <span className="text-[12.5px] text-[var(--muted)]">{p.duration}</span>
              </div>

              <p className="mt-3 max-w-[78ch] text-[14px] leading-relaxed text-[var(--ink-2)]">{p.body}</p>

              <div className="mt-4 grid gap-4 sm:grid-cols-[1fr_1fr]">
                <div>
                  <p className="text-[12.5px] font-medium text-[var(--ink-2)]">What it delivers</p>
                  <ul className="mt-1.5 grid gap-1.5">
                    {p.delivers.map((d) => (
                      <li key={d} className="text-[13px] leading-relaxed text-[var(--muted)]">
                        {d}
                      </li>
                    ))}
                  </ul>
                </div>
                <div>
                  <p className="text-[12.5px] font-medium text-[var(--ink-2)]">What it asks of a department</p>
                  <p className="mt-1.5 text-[13px] leading-relaxed text-[var(--muted)]">{p.asks}</p>
                </div>
              </div>

              <p className="mt-4 border-t border-[var(--line)] pt-3 text-[13px] leading-relaxed text-[var(--muted)]">
                <span className="font-medium text-[var(--ink-2)]">If it stops here. </span>
                {p.stopHere}
              </p>
            </Card>
          ))}
        </div>
      </section>

      <section className="mb-10">
        <SectionTitle sub="The constraints that keep a migration from becoming a rewrite.">
          Rules the plan holds itself to
        </SectionTitle>
        <div className="grid gap-2.5 sm:grid-cols-2">
          {RULES.map((r) => (
            <Card key={r.t} className="p-4">
              <p className="text-[14.5px] font-medium">{r.t}</p>
              <p className="mt-1.5 text-[13px] leading-relaxed text-[var(--muted)]">{r.d}</p>
            </Card>
          ))}
        </div>
      </section>

      <section>
        <SectionTitle sub="Assessed on how their systems actually work, not on how modern they look.">
          Where each department would start
        </SectionTitle>
        <Card className="divide-y divide-[var(--line)] overflow-hidden">
          {SERVICES.map((s) => (
            <div key={s.id} className="flex flex-wrap items-center gap-3 p-3.5">
              <ServiceMark id={s.id} size={30} />
              <div className="min-w-[180px] flex-1">
                <p className="text-[14px] font-medium">{s.name}</p>
                <p className="text-[12px] text-[var(--muted)]">{s.migrationNote}</p>
              </div>
              <Badge tone={INTEGRATION_LABEL[s.integration].tone}>{INTEGRATION_LABEL[s.integration].label}</Badge>
            </div>
          ))}
        </Card>
      </section>
    </Page>
  );
}
