"use client";

import { useState } from "react";
import Link from "next/link";
import { ChevronDown } from "lucide-react";
import { Page, PageHead } from "@/components/shell/AppShell";
import { Badge, Card, cn } from "@/components/ui/primitives";

/* The objections a sceptical official actually raises, answered without
   hand-waving. Where the honest answer is "this is genuinely hard", it says so,
   because an answer that admits nothing is not believed. */

interface Objection {
  q: string;
  short: string;
  body: string[];
  precedent?: string;
}

const OBJECTIONS: Objection[] = [
  {
    q: "Departments will never agree to share their data.",
    short: "They are not being asked to.",
    body: [
      "Nothing in this model moves a department's records anywhere. GSTN keeps the returns. The RTO keeps the licence register. Passport Seva keeps the appointment inventory and the passport file. There is no central database of citizens, and building one would be both a security disaster and a political non-starter.",
      "What departments consume is a set of primitives: an identity assertion, a consent grant, a case record, an event channel. The question is not \"will you hand over your data\" but \"will you stop building your own login\". That is a much easier conversation, and it is one where the department gains rather than concedes.",
      "Data is exchanged only per request, per purpose, with the citizen's grant, and the grant is logged where the citizen can see and revoke it.",
    ],
    precedent:
      "This is how UPI works between banks. No bank surrendered its ledger. They agreed on a common rail and kept their customers.",
  },
  {
    q: "This is just another portal on top of the existing ones.",
    short: "The difference is where the shared code lives.",
    body: [
      "An aggregator is a directory: it links out, and each destination still authenticates you, still holds its own copy of your address, still has its own idea of what a case is. The fragmentation survives one layer down.",
      "Here the shared thing is underneath, not on top. Identity, consent, cases and notifications are implemented once and inherited. A department writes its business logic and nothing else. You can see this in the build: the journey rail renders over a department's own screens, because it is handed down rather than reimplemented.",
      "The test is simple. On an aggregator, adding an eleventh service means building an eleventh integration. Here it means adding a registry entry.",
    ],
  },
  {
    q: "A single front door is a single point of failure.",
    short: "For navigation, yes. For the services themselves, no.",
    body: [
      "The layer is deliberately thin. It holds identity, consent, the case index and routing. It does not hold the systems of record, so if the layer is down, GSTN and the RTO are still up and still authoritative. Nothing is lost, and departments can keep serving through their own surfaces during a degraded period.",
      "That is the opposite of the situation today, where one department's outage takes out the only route to that department's service with no fallback and no visibility.",
      "It does mean the layer needs to be run like payments infrastructure rather than like a website: redundancy, published uptime, an incident process. That is a real operational commitment and it should be costed as one.",
    ],
  },
  {
    q: "One place that knows everything about a citizen is a privacy disaster.",
    short: "Which is exactly why it holds almost nothing.",
    body: [
      "The design constraint is that the infrastructure must not become the thing it would be dangerous to breach. It holds identity, a small set of primary attributes, the consent ledger and case metadata. It does not hold your tax returns, your medical history, your PF ledger or your passport file.",
      "Every access is purpose-bound and logged. Signing in grants nothing on its own. A department asks for one named attribute, states why, and the citizen can decline and still be served, or grant it and revoke it later.",
      "The honest version of this claim: today, eleven departments each hold a stale copy of your address with no visibility into who read it. Concentrating the consent ledger while decentralising the data is a better privacy position than the status quo, not a worse one. But it only holds if purpose limitation is enforced in the infrastructure rather than promised in a policy document.",
    ],
    precedent:
      "The DPDP Act 2023 already requires purpose limitation and consent for personal data processing. This is a way to implement that obligation rather than a new burden.",
  },
  {
    q: "Legacy systems cannot integrate. Some of these run on decades-old stacks.",
    short: "Which is why phase one asks nothing of them.",
    body: [
      "The first phase is adapters. A department's existing system stays exactly as it is and an adapter presents it through common interfaces. The department writes no new code and changes no schema. Citizens get one front door before anyone rewrites anything.",
      "That is also why the build labels every department honestly as native, adapter or legacy API rather than pretending they are all equally modernised. IRCTC's seat inventory sits in a reservation system that is not going to be replaced, and it does not need to be.",
      "Adapters are the migration mechanism, not the destination. A design that stops there permanently preserves the fragmentation it was meant to hide, which is the failure mode to watch for.",
    ],
  },
  {
    q: "This will take ten years and three governments.",
    short: "Only if it is sequenced as a big bang, which is the wrong sequencing.",
    body: [
      "The layer is thin enough that the first useful version is a registry, an identity federation and one journey. That is months, not years, and it delivers value on its own: one department's highest-volume journey, working end to end, is a complete deliverable.",
      "Every phase after that is independently valuable and independently reversible. No phase requires the next one to have been funded. A department that joins gets a working citizen surface whether or not the department beside it ever joins.",
      "The risk is not technical duration. It is that ownership changes and the thing is half-migrated forever. That is a governance problem and it should be planned for as one.",
    ],
  },
  {
    q: "Who builds it, who pays for it, and who owns it?",
    short: "A small central body that owns primitives, not services.",
    body: [
      "The shape that works is a central team of the size that maintains a design system, not one that maintains eleven products. It owns identity, consent, the case model, the event bus, the component library and the accessibility floor. It does not own any department's business logic and cannot ship a service on a department's behalf.",
      "India has repeatedly stood up exactly this kind of body. NPCI for payments rails, UIDAI for identity, GSTN for tax infrastructure, NIC for shared hosting. The institutional pattern is well understood here.",
      "Funding follows the same logic as shared hosting: the centre funds the primitives, departments fund their own journeys. A department's cost goes down, because the eight things it was rebuilding are now provided.",
    ],
  },
  {
    q: "Citizens will not trust an AI touching government services.",
    short: "Which is why it is bounded, visible and mostly not used.",
    body: [
      "Naming a service runs no model at all. The deterministic engine resolves it, and the interface says so on every result. The model is reached only for genuine ambiguity, and it can only return identifiers that already exist in the registry, so it can compose government capabilities but cannot invent one.",
      "It never performs a consequential action. It explains and routes; submission, payment and cancellation happen inside a journey where the citizen confirms.",
      "In conversation it opens knowing a first name and nothing else, and asks for each additional bundle of context with a stated reason and a decline option. Ask it for a provident fund balance cold and it refuses until permission is given.",
    ],
  },
];

export default function PracticalPage() {
  const [open, setOpen] = useState<string | null>(OBJECTIONS[0].q);

  return (
    <Page>
      <PageHead
        eyebrow={<Badge tone="accent">Objections</Badge>}
        title="Would this actually work?"
        sub="The eight things a sceptical official raises first. Where the honest answer is that something is genuinely hard, it says so, because an answer that concedes nothing does not get believed."
      />

      <div className="grid gap-2.5">
        {OBJECTIONS.map((o, i) => {
          const isOpen = open === o.q;
          return (
            <Card key={o.q} className="overflow-hidden">
              <button
                onClick={() => setOpen(isOpen ? null : o.q)}
                aria-expanded={isOpen}
                className="flex w-full items-start gap-4 p-5 text-left"
              >
                <span className="tnum mt-0.5 grid h-6 w-6 shrink-0 place-items-center rounded-full bg-[var(--line-2)] text-[11.5px] font-semibold text-[var(--muted)]">
                  {i + 1}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block text-[16px] font-semibold leading-snug">{o.q}</span>
                  <span className="mt-1 block text-[13.5px] text-[var(--accent)]">{o.short}</span>
                </span>
                <ChevronDown
                  size={17}
                  className={cn("mt-1 shrink-0 text-[var(--faint)] transition-transform", isOpen && "rotate-180")}
                />
              </button>

              {isOpen && (
                <div className="fade border-t border-[var(--line)] px-5 py-4 pl-[60px]">
                  {o.body.map((p) => (
                    <p key={p} className="mb-3 max-w-[78ch] text-[14px] leading-relaxed text-[var(--ink-2)] last:mb-0">
                      {p}
                    </p>
                  ))}
                  {o.precedent && (
                    <p className="mt-3.5 border-l-2 border-[var(--accent)] pl-3.5 text-[13px] leading-relaxed text-[var(--muted)]">
                      <span className="font-medium text-[var(--ink-2)]">Precedent. </span>
                      {o.precedent}
                    </p>
                  )}
                </div>
              )}
            </Card>
          );
        })}
      </div>

      <Card className="mt-8 p-5">
        <p className="text-[15px] font-medium">The objection with no good answer</p>
        <p className="mt-2 max-w-[78ch] text-[13.5px] leading-relaxed text-[var(--muted)]">
          Political ownership. Every argument above is answerable on technical or institutional grounds. None of
          them addresses what happens when the minister who sponsored it moves, and the successor has their own
          programme. Shared infrastructure is unglamorous, its benefits accrue to other departments, and it is
          easy to defund quietly. That is the real risk to this idea, and it is not one an architecture diagram
          can solve.{" "}
          <Link href="/case/limits" className="text-[var(--accent)] hover:underline">
            The rest of what is unsolved
          </Link>
          .
        </p>
      </Card>
    </Page>
  );
}
