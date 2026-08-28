"use client";

import { useParams } from "next/navigation";
import { useState } from "react";
import { Check, Eye, Lock, ShieldCheck, X } from "lucide-react";
import { Page, PageHead } from "@/components/shell/AppShell";
import { Badge, Button, Card, EmptyState, SectionTitle } from "@/components/ui/primitives";
import { SCHEME_MAP } from "@/lib/data/seed";

/* Notification, eligibility and enrolment are kept as three separate
   things. Government may tell you a scheme exists. It may not quietly
   run your data through it. */

export default function SchemePage() {
  const { id } = useParams<{ id: string }>();
  const s = SCHEME_MAP[id];
  const [phase, setPhase] = useState<"idle" | "checking" | "done">("idle");

  if (!s) {
    return (
      <Page>
        <EmptyState title="Scheme not found" body="This scheme is not in the registry." action={<Button href="/home">Go home</Button>} />
      </Page>
    );
  }

  function check() {
    setPhase("checking");
    setTimeout(() => setPhase("done"), 1600);
  }

  return (
    <Page>
      <PageHead
        eyebrow={<Badge tone="accent">{s.authority}</Badge>}
        title={s.name}
        sub={s.summary}
      />

      <Card className="mb-6 flex flex-wrap items-center gap-4 p-5">
        <div className="min-w-0 flex-1">
          <p className="text-[12px] font-semibold uppercase tracking-[0.08em] text-[var(--muted)]">Benefit</p>
          <p className="mt-1 text-[16px] font-medium">{s.benefit}</p>
        </div>
      </Card>

      {phase === "idle" && (
        <Card className="p-5">
          <div className="mb-3 flex items-center gap-2">
            <Lock size={15} className="text-[var(--muted)]" />
            <p className="text-[15px] font-medium">We have not checked whether you qualify</p>
          </div>
          <p className="mb-4 max-w-[74ch] text-[13.5px] leading-relaxed text-[var(--muted)]">
            Running an eligibility check means reading data from four departments. That is your data, so it needs your
            permission — not a checkbox you agreed to when you signed in. Here is exactly what would be read:
          </p>
          <ul className="mb-5 grid gap-2">
            {s.requires.map((r) => (
              <li key={r.attribute} className="flex flex-wrap items-center gap-2 rounded-[3px] border border-[var(--line)] px-3.5 py-2.5">
                <Eye size={14} className="shrink-0 text-[var(--muted)]" />
                <span className="min-w-0 flex-1 text-[13.5px]">{r.attribute}</span>
                <Badge tone="neutral">{r.source}</Badge>
              </li>
            ))}
          </ul>
          <div className="flex flex-wrap items-center gap-3">
            <Button size="lg" onClick={check}>
              <ShieldCheck size={16} /> Allow this check
            </Button>
            <Button size="lg" variant="secondary" href="/home">
              Not now
            </Button>
          </div>
          <p className="mt-3 text-[12.5px] text-[var(--muted)]">
            Declining changes nothing else. The scheme stays visible; you simply have not been assessed.
          </p>
        </Card>
      )}

      {phase === "checking" && (
        <Card className="p-8">
          <div className="mb-4 flex items-center gap-2.5 text-[14px] text-[var(--ink-2)]">
            <span className="h-1.5 w-1.5 animate-[pulse-soft_0.9s_infinite] rounded-full bg-[var(--accent)]" />
            Reading four department records with your permission
          </div>
          <div className="grid gap-2.5">
            {s.requires.map((r, i) => (
              <div key={r.attribute} className="rise flex items-center gap-3" style={{ animationDelay: `${i * 260}ms` }}>
                <Check size={14} className="text-[var(--ok)]" />
                <span className="text-[13px] text-[var(--muted)]">{r.source} — {r.attribute}</span>
              </div>
            ))}
          </div>
        </Card>
      )}

      {phase === "done" && (
        <div className="rise grid gap-4">
          <Card className="p-5">
            <div className="mb-3 flex flex-wrap items-center gap-2">
              <Badge tone={s.verdict === "eligible" ? "ok" : s.verdict === "partial" ? "warn" : "danger"}>
                {s.verdict === "partial" ? "Almost eligible" : s.verdict === "eligible" ? "Eligible" : "Not eligible"}
              </Badge>
              <span className="text-[12.5px] text-[var(--muted)]">Checked against 5 published conditions</span>
            </div>
            <p className="max-w-[74ch] text-[15px] leading-relaxed text-[var(--ink-2)]">{s.verdictLine}</p>
          </Card>

          <section>
            <SectionTitle>Every condition, and how you were judged</SectionTitle>
            <Card className="divide-y divide-[var(--line-2)] overflow-hidden">
              {s.rules.map((r) => (
                <div key={r.label} className="flex gap-3 p-4">
                  <span
                    className="mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-full"
                    style={{
                      background: r.pass ? "var(--ok-soft)" : "var(--warn-soft)",
                      color: r.pass ? "var(--ok)" : "var(--warn)",
                    }}
                  >
                    {r.pass ? <Check size={12} strokeWidth={3} /> : <X size={12} strokeWidth={3} />}
                  </span>
                  <div className="min-w-0">
                    <p className="text-[14px] font-medium leading-snug">{r.label}</p>
                    <p className="mt-0.5 text-[13px] leading-relaxed text-[var(--muted)]">{r.detail}</p>
                  </div>
                </div>
              ))}
            </Card>
            <p className="mt-3 text-[12.5px] leading-relaxed text-[var(--muted)]">
              A rejection you cannot see the reason for is the single most common complaint about government schemes.
              Eligibility rules are published data here, so the answer is always explainable.
            </p>
          </section>

          <div className="flex flex-wrap gap-3">
            <Button size="lg" href="/journeys/scheme-apply">Apply for this scheme</Button>
            <Button size="lg" variant="secondary" href="/home">Back to home</Button>
          </div>
        </div>
      )}
    </Page>
  );
}
