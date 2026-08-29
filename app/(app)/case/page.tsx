"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Page, PageHead } from "@/components/shell/AppShell";
import { Badge, Card, SectionTitle } from "@/components/ui/primitives";
import { LEGACY_KNOWN, LEGACY_TOTAL } from "@/lib/data/legacy";
import { SERVICES } from "@/lib/data/services";

/* The case, for anyone who wants to argue with it. Written to be read by
   someone sceptical rather than someone already convinced. */

const CHAIN = [
  {
    n: "Observation",
    body: "Renewing one passport asks 78 questions. Government already knows the answer to 41 of them.",
    detail:
      "Not because the form is badly written. Because the eleven systems that hold those answers cannot be asked by the twelfth.",
  },
  {
    n: "Diagnosis",
    body: "India's public services are not badly built. They are separately built.",
    detail:
      "Every department independently solved identity, forms, status tracking, notifications and support. Each solution is reasonable alone. Together they push the integration work onto the citizen.",
  },
  {
    n: "Consequence",
    body: "The citizen becomes the integration layer.",
    detail:
      "You carry facts between departments by hand, prove the same thing repeatedly, and hold the mental model of which ministry owns your problem. That work is real, unpaid, and falls hardest on the people least equipped to do it.",
  },
  {
    n: "Proposal",
    body: "Build the layer underneath, once, and let departments keep everything else.",
    detail:
      "One verified identity, one front door, one case history, one consent ledger. Departments keep their data, their rules, their officers and their brand. What they stop doing is rebuilding the same eight things.",
  },
];

export default function CasePage() {
  return (
    <Page>
      <PageHead
        eyebrow={<Badge tone="accent">For anyone who wants to argue with it</Badge>}
        title="The case"
        sub="The reasoning, the objections, the migration path and the parts that are not solved. Written for someone sceptical rather than someone already convinced."
      />

      <section className="mb-10">
        <div className="grid gap-3">
          {CHAIN.map((c, i) => (
            <Card key={c.n} className="flex gap-4 p-5">
              <span className="tnum mt-0.5 grid h-7 w-7 shrink-0 place-items-center rounded-full bg-[var(--accent-soft)] text-[12.5px] font-semibold text-[var(--accent)]">
                {i + 1}
              </span>
              <div className="min-w-0">
                <p className="text-[12px] font-medium text-[var(--accent)]">{c.n}</p>
                <p className="mt-1 text-[17px] font-semibold leading-snug">{c.body}</p>
                <p className="mt-1.5 max-w-[74ch] text-[13.5px] leading-relaxed text-[var(--muted)]">{c.detail}</p>
              </div>
            </Card>
          ))}
        </div>
      </section>

      <section className="mb-10">
        <SectionTitle sub="The same three numbers, on one application, are the whole argument in miniature.">
          Why one passport renewal is enough to show it
        </SectionTitle>
        <div className="grid gap-3 sm:grid-cols-3">
          {[
            { v: LEGACY_TOTAL, l: "questions on the existing application", tone: "ink" as const },
            { v: LEGACY_KNOWN, l: "of them government already holds about you", tone: "warn" as const },
            { v: 4, l: "decisions only the citizen can actually make", tone: "ok" as const },
          ].map((s) => (
            <Card key={s.l} className="p-5">
              <p
                className={`tnum text-[38px] font-semibold leading-none ${
                  s.tone === "warn" ? "text-[var(--warn)]" : s.tone === "ok" ? "text-[var(--ok)]" : "text-[var(--ink)]"
                }`}
              >
                {s.v}
              </p>
              <p className="mt-2 text-[13px] leading-snug text-[var(--muted)]">{s.l}</p>
            </Card>
          ))}
        </div>
        <p className="mt-3 max-w-[80ch] text-[13.5px] leading-relaxed text-[var(--muted)]">
          The gap between 41 and 4 is not a design problem. No amount of redesigning that form closes it, because
          the form is not where the information is missing. That is why this proposal is architectural.{" "}
          <Link href="/before" className="text-[var(--accent)] hover:underline">
            See the two side by side
          </Link>
          .
        </p>
      </section>

      <section className="mb-10">
        <SectionTitle>What is different from an aggregator</SectionTitle>
        <Card className="overflow-x-auto">
          <table className="w-full min-w-[620px] border-collapse text-left">
            <thead>
              <tr className="border-b border-[var(--line)]">
                <th className="w-[150px] px-4 py-3 text-[12.5px] font-semibold text-[var(--muted)]"> </th>
                <th className="px-4 py-3 text-[12.5px] font-semibold text-[var(--muted)]">An app that links out</th>
                <th className="px-4 py-3 text-[12.5px] font-semibold text-[var(--accent)]">Shared infrastructure</th>
              </tr>
            </thead>
            <tbody>
              {[
                ["Identity", "Each service authenticates you again", "Authenticate once, departments get scoped assertions"],
                ["Your data", "Every department keeps its own copy", "Departments own their domain, the profile is requested"],
                ["Finding things", "You browse the government's org chart", "You state a goal, the engine finds the journey"],
                ["Composition", "Services cannot be combined", "One journey can span four departments"],
                ["Tracking", "Status lives inside each service", "Every submission is a case in one history"],
              ].map(([a, b, c]) => (
                <tr key={a} className="border-b border-[var(--line-2)] last:border-0">
                  <td className="px-4 py-3 text-[13px] font-medium text-[var(--ink-2)]">{a}</td>
                  <td className="px-4 py-3 text-[13.5px] leading-relaxed text-[var(--muted)]">{b}</td>
                  <td className="px-4 py-3 text-[13.5px] leading-relaxed text-[var(--ink)]">{c}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
        <p className="mt-3 max-w-[80ch] text-[13.5px] leading-relaxed text-[var(--muted)]">
          Aggregation puts a shared surface on unshared systems. The fragmentation is still there, one layer down,
          and the citizen still pays for it.
        </p>
      </section>

      <section>
        <SectionTitle>Where to go next</SectionTitle>
        <div className="grid gap-2.5 sm:grid-cols-2">
          {[
            { href: "/case/practical", t: "Would it actually work?", d: "The eight objections a sceptical official would raise, answered." },
            { href: "/case/transition", t: "How you get there", d: "Five phases, each reversible, each delivering something on its own." },
            { href: "/case/scale", t: "At the scale of a country", d: "Load, cost, who staffs it, and who is allowed to approve what." },
            { href: "/case/limits", t: "What it does not solve", d: "Exclusion, identity at the margins, and what this prototype does not prove." },
            { href: "/architecture", t: "The technical stack", d: `The layer diagram and where each of the ${SERVICES.length} departments sits today.` },
            { href: "/before", t: "The comparison", d: "One passport application, today and here, annotated." },
          ].map((x) => (
            <Card key={x.href} as={Link} href={x.href} interactive className="flex items-start gap-3 p-4">
              <div className="min-w-0 flex-1">
                <p className="text-[14.5px] font-medium">{x.t}</p>
                <p className="mt-1 text-[13px] leading-relaxed text-[var(--muted)]">{x.d}</p>
              </div>
              <ArrowRight size={16} className="mt-1 shrink-0 text-[var(--faint)]" />
            </Card>
          ))}
        </div>
      </section>
    </Page>
  );
}
