"use client";

import Link from "next/link";
import { Page, PageHead } from "@/components/shell/AppShell";
import { Badge, Card, SectionTitle } from "@/components/ui/primitives";

/* The limits. This page exists because a proposal that claims to solve
   everything is not trusted, and should not be. */

const UNSOLVED = [
  {
    t: "People who cannot use it at all",
    d: "A shared layer does nothing for someone with no smartphone, no data, or no literacy in any language this is written in. Digital consolidation makes life better for people already online and can quietly make it worse for everyone else, if the offline route is allowed to wither because the online one is working.",
    partial:
      "The honest mitigation is that assisted access has to be a first-class channel, not a fallback: an operator at a Common Service Centre acting on a citizen's behalf, with the citizen's consent recorded the same way. That is designed for here and not built. It is the largest gap in this prototype.",
  },
  {
    t: "Identity at the margins",
    d: "The model assumes a high-assurance identity exists. For most people it does. For the people who most need government to work, it often does not: no fixed address, no birth record, documents in a name that no longer matches.",
    partial:
      "Nothing here solves that, and a system that quietly requires a clean identity to function will exclude precisely the people it should serve first. The design at least makes assurance visible as a level rather than a yes or no, so a lower-assurance citizen can be served differently instead of being turned away.",
  },
  {
    t: "Consent fatigue",
    d: "Per-purpose consent is the right model and it also produces more prompts. A citizen asked twelve times will start approving without reading, at which point the consent ledger records agreement that was never meaningfully given.",
    partial:
      "This build asks for context in bundles with a stated reason and a working decline, which helps. It does not solve the underlying tension between granularity and comprehension, and anyone claiming to have solved that is not being straight with you.",
  },
  {
    t: "The AI can still be wrong",
    d: "It is bounded to the registry and cannot invent a service, and it never performs a consequential action. It can still misread an ambiguous request and route someone to the wrong department.",
    partial:
      "The mitigation is that deterministic matching handles the common path with no model involved, the interface always shows which resolved the request, and the model says plainly when it is not sure. A wrong route costs a click. It cannot cost a submission.",
  },
  {
    t: "Political ownership",
    d: "Shared infrastructure is unglamorous. Its benefits accrue to departments other than the one funding it, its wins are invisible when it works, and it is easy to defund quietly between administrations.",
    partial:
      "This is the most likely way the idea fails, and no architecture answers it. The only structural hedge is that every phase delivers something standalone, so a half-finished programme still leaves working services behind rather than a stranded platform.",
  },
];

const REAL = [
  "The service registry, driving navigation, search and theming",
  "One journey engine rendering every journey from configuration",
  "Deterministic intent routing, with a registry-grounded model behind it",
  "The consent ledger, written by journeys and revocable in the profile",
  "Cases, inbox and timeline off one event model, with genuine state",
  "Two departments built as real applications: a reservation engine with availability, quotas, fares and allocation, and an appointment system with per-Kendra inventory",
  "The journey rail, handed down by both shells and rendering inside a department's own site",
];

const SIMULATED = [
  "Every citizen and every record is invented. No real personal data appears anywhere.",
  "No live government system is contacted, and none of their code or branding is used.",
  "Department processing is a triggered state change, not a real officer making a decision.",
  "Payments are mocked. Nothing charges anything.",
  "Identity assurance is asserted rather than established. There is no real verification behind it.",
  "Availability and inventory are generated deterministically from the date and service, not read from a real system.",
  "Eight of the ten departments are registry entries with a single page, not full applications.",
];

export default function LimitsPage() {
  return (
    <Page>
      <PageHead
        eyebrow={<Badge tone="warn">Limits</Badge>}
        title="What this does not solve"
        sub="A proposal that claims to solve everything should not be trusted. This is the list of things it does not, and the line between what is genuinely built here and what is staged."
      />

      <section className="mb-10">
        <SectionTitle>Problems the architecture does not fix</SectionTitle>
        <div className="grid gap-3">
          {UNSOLVED.map((u) => (
            <Card key={u.t} className="p-5">
              <p className="text-[16px] font-semibold">{u.t}</p>
              <p className="mt-1.5 max-w-[78ch] text-[13.5px] leading-relaxed text-[var(--ink-2)]">{u.d}</p>
              <p className="mt-3 border-l-2 border-[var(--line)] pl-3.5 text-[13px] leading-relaxed text-[var(--muted)]">
                {u.partial}
              </p>
            </Card>
          ))}
        </div>
      </section>

      <section className="mb-10">
        <SectionTitle sub="The boundary matters more than either list. Everything above the department line is genuinely built; everything below it is the part that already exists in government and would be integrated rather than rebuilt.">
          What is real in this build, and what is staged
        </SectionTitle>
        <div className="grid gap-3 lg:grid-cols-2">
          <Card className="p-5">
            <p className="text-[14px] font-semibold text-[var(--ok)]">Genuinely built and working</p>
            <ul className="mt-3 grid gap-2">
              {REAL.map((r) => (
                <li key={r} className="text-[13.5px] leading-relaxed text-[var(--ink-2)]">
                  {r}
                </li>
              ))}
            </ul>
          </Card>
          <Card className="p-5">
            <p className="text-[14px] font-semibold text-[var(--muted)]">Deliberately simulated</p>
            <ul className="mt-3 grid gap-2">
              {SIMULATED.map((s) => (
                <li key={s} className="text-[13.5px] leading-relaxed text-[var(--muted)]">
                  {s}
                </li>
              ))}
            </ul>
          </Card>
        </div>
      </section>

      <Card className="p-5">
        <p className="text-[15px] font-medium">What a prototype can and cannot demonstrate</p>
        <p className="mt-2 max-w-[80ch] text-[13.5px] leading-relaxed text-[var(--muted)]">
          This can show that the interaction model works and that the architecture is coherent: that a journey
          can cross departments, that a department can run its own application inside shared infrastructure, and
          that consent can be per-purpose without being unusable. It cannot show that eleven ministries would
          agree to it, that the identity assurance would hold at population scale, or that the migration would
          survive a change of government. Those are the real questions, and they are not questions a prototype
          gets to answer.{" "}
          <Link href="/case/practical" className="text-[var(--accent)] hover:underline">
            The objections, answered
          </Link>
          .
        </p>
      </Card>
    </Page>
  );
}
