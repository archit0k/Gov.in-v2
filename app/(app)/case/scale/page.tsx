"use client";

import { Page, PageHead } from "@/components/shell/AppShell";
import { Badge, Card, SectionTitle } from "@/components/ui/primitives";

/* Scale, cost and governance. The parts people ask about second, after they
   have stopped arguing about whether it should exist. */

const LOAD = [
  {
    k: "What the layer actually does per request",
    v: "Verify an assertion, check a consent grant, route to a registry entry, write a case event.",
    note: "All of it small, cacheable and mostly stateless. None of it involves a department's records.",
  },
  {
    k: "What it does not do",
    v: "Compute tax, allocate a seat, decide a passport, hold a return.",
    note: "Domain load stays with the department that owns the domain, which is where the capacity already exists.",
  },
  {
    k: "The number that matters",
    v: "Peak concurrency, not population.",
    note: "A country of 1.4 billion does not renew passports simultaneously. The hard peaks are known and seasonal: tax filing deadlines, Tatkal opening at 11:00, results days.",
  },
  {
    k: "Where it would break first",
    v: "The consent ledger and the case index, because they are the only writes on the hot path.",
    note: "Both partition cleanly by citizen, which is the easiest sharding problem there is.",
  },
];

const ORG = [
  {
    t: "A central team that owns primitives",
    d: "Identity, consent, the case model, the event bus, the component library, the accessibility floor. Roughly the size of a team that maintains a design system, not one that maintains eleven products.",
    guard: "It cannot ship a citizen service. If it could, it would become another department and the model collapses.",
  },
  {
    t: "Departments own journeys",
    d: "A department writes its own business logic and publishes journeys into the registry. It keeps its officers, its rules and its register, which is everything that was ever genuinely its own.",
    guard: "A department cannot opt out of the accessibility, consent or audit floor. Those are inherited, not optional.",
  },
  {
    t: "An approvals body for the registry",
    d: "Someone has to decide that a proposed journey is legitimate, that a requested attribute is proportionate to its purpose, and that a department is entitled to the data it is asking for.",
    guard: "This is the function most likely to be skipped, and the one whose absence would turn purpose limitation into a slogan.",
  },
];

const COST = [
  { k: "Central cost", v: "Primitives, the platform team, and running the rail like payments infrastructure." },
  { k: "Department cost", v: "Their own journeys. Lower than today, because the eight duplicated things are provided." },
  { k: "Where the saving is", v: "Eleven auth stacks, eleven notification systems, eleven status pages, eleven accessibility audits, eleven security reviews." },
  { k: "Where the saving is not", v: "The systems of record. Those stay, and they should. Nobody saves money by rewriting a working register." },
];

export default function ScalePage() {
  return (
    <Page>
      <PageHead
        eyebrow={<Badge tone="accent">Scale</Badge>}
        title="At the scale of a country"
        sub="What the layer carries, what it deliberately does not, who staffs it, and who is allowed to approve what."
      />

      <section className="mb-10">
        <SectionTitle sub="The architecture is only scalable because most of the work stays where it already is.">
          Load
        </SectionTitle>
        <Card className="divide-y divide-[var(--line)] overflow-hidden">
          {LOAD.map((l) => (
            <div key={l.k} className="grid gap-1 p-4 sm:grid-cols-[220px_minmax(0,1fr)] sm:gap-5">
              <p className="text-[13px] font-medium text-[var(--ink-2)]">{l.k}</p>
              <div>
                <p className="text-[14px] leading-relaxed">{l.v}</p>
                <p className="mt-1 text-[13px] leading-relaxed text-[var(--muted)]">{l.note}</p>
              </div>
            </div>
          ))}
        </Card>
        <p className="mt-3 max-w-[80ch] text-[13.5px] leading-relaxed text-[var(--muted)]">
          The reason this is tractable is that it refuses to be the system of record. A layer that held every
          citizen&apos;s tax, health and employment data would have both an impossible scaling problem and an
          unacceptable breach radius. Holding almost nothing is a scaling decision as much as a privacy one.
        </p>
      </section>

      <section className="mb-10">
        <SectionTitle sub="Every one of these has an accompanying constraint, because the failure mode of a central platform team is that it slowly becomes a department.">
          Who runs it
        </SectionTitle>
        <div className="grid gap-3">
          {ORG.map((o) => (
            <Card key={o.t} className="p-5">
              <p className="text-[15px] font-semibold">{o.t}</p>
              <p className="mt-1.5 max-w-[78ch] text-[13.5px] leading-relaxed text-[var(--muted)]">{o.d}</p>
              <p className="mt-3 border-l-2 border-[var(--warn)] pl-3.5 text-[13px] leading-relaxed text-[var(--ink-2)]">
                <span className="font-medium">Constraint. </span>
                {o.guard}
              </p>
            </Card>
          ))}
        </div>
      </section>

      <section className="mb-10">
        <SectionTitle>Cost, honestly</SectionTitle>
        <Card className="divide-y divide-[var(--line)] overflow-hidden">
          {COST.map((c) => (
            <div key={c.k} className="flex flex-wrap gap-x-6 gap-y-1 p-4">
              <p className="min-w-[160px] text-[13px] font-medium text-[var(--ink-2)]">{c.k}</p>
              <p className="min-w-0 flex-1 text-[13.5px] leading-relaxed text-[var(--muted)]">{c.v}</p>
            </div>
          ))}
        </Card>
        <p className="mt-3 max-w-[80ch] text-[13.5px] leading-relaxed text-[var(--muted)]">
          No figures are given here, and any that were would be invented. What can be said without inventing
          anything is the shape: the recurring saving is in duplicated plumbing across departments, and the
          recurring cost is a small central team plus running the rail to a payments-grade standard.
        </p>
      </section>

      <section>
        <SectionTitle>Extending it</SectionTitle>
        <div className="grid gap-2.5 sm:grid-cols-3">
          {[
            { t: "A new department", d: "A registry entry. It inherits identity, consent, cases, notifications, accessibility and the component set on day one." },
            { t: "A new journey", d: "A configuration object. One engine renders every journey, which is why the eleventh costs what the second did." },
            { t: "A new life event", d: "Composed from capabilities that already exist. The AI layer may compose government; it may not invent it." },
          ].map((x) => (
            <Card key={x.t} className="p-4">
              <p className="text-[14.5px] font-medium">{x.t}</p>
              <p className="mt-1.5 text-[13px] leading-relaxed text-[var(--muted)]">{x.d}</p>
            </Card>
          ))}
        </div>
      </section>
    </Page>
  );
}
