"use client";

import Link from "next/link";
import { ArrowRight, ShieldCheck } from "lucide-react";
import { Badge, Button, Card, EmptyState, ProgressRail, fmtDateTime } from "@/components/ui/primitives";
import { PanelTitle } from "@/components/platform/PlatformShell";
import { useSession } from "@/lib/state/store";

const STAGES = [
  { s: "Submitted", d: "Received by the Regional Passport Office and queued for verification." },
  { s: "Documents verified", d: "Your held facts are checked against the issuing departments. Usually same day." },
  { s: "Appointment", d: "Biometrics and the physical booklet handover at your chosen centre." },
  { s: "Police verification", d: "Jurisdiction is derived from your verified address, so this is usually pre-approved." },
  { s: "Printed & dispatched", d: "Booklet printed and handed to Speed Post with a tracking number." },
];

export default function TrackPage() {
  const { state, ready } = useSession();
  const cases = state.cases.filter((c) => c.serviceId === "passport");

  return (
    <div className="grid gap-6 lg:grid-cols-[1.3fr_1fr]">
      <div className="grid content-start gap-6">
        <Card className="p-5">
          <PanelTitle>Your applications</PanelTitle>
          {ready && cases.length === 0 ? (
            <EmptyState
              title="Nothing in progress"
              body="There is no application number to remember and no reference to keep safe. When you apply, it appears here and in your Gov.in inbox as the same case."
              action={<Button href="/journeys/passport-renewal">Start a renewal</Button>}
            />
          ) : (
            <div className="grid gap-5">
              {cases.map((c) => (
                <div key={c.id}>
                  <div className="mb-2.5 flex flex-wrap items-center gap-2">
                    <p className="min-w-0 flex-1 truncate text-[14.5px] font-medium">{c.title}</p>
                    <Badge tone={c.status === "approved" ? "ok" : "info"}>{c.states[c.stateIndex]}</Badge>
                    <span className="mono text-[11.5px] text-[var(--faint)]">{c.id}</span>
                  </div>
                  <ProgressRail steps={c.states} current={c.stateIndex} />
                  <p className="mt-3 text-[13px] leading-relaxed text-[var(--muted)]">{c.statusLine}</p>
                  <p className="mt-1 text-[11.5px] text-[var(--faint)]">Updated {fmtDateTime(c.updatedAt)}</p>
                  <Link
                    href={`/cases/${c.id}`}
                    className="mt-2 inline-flex items-center gap-1.5 text-[13px] text-[var(--accent)] hover:underline"
                  >
                    Full history <ArrowRight size={13} />
                  </Link>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>

      <aside className="grid content-start gap-6">
        <Card className="p-5">
          <PanelTitle>What each stage means</PanelTitle>
          <ol className="grid gap-3">
            {STAGES.map((x, i) => (
              <li key={x.s} className="flex gap-3">
                <span className="tnum mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-full bg-[var(--line-2)] text-[11px] text-[var(--muted)]">
                  {i + 1}
                </span>
                <div>
                  <p className="text-[13.5px] font-medium">{x.s}</p>
                  <p className="mt-0.5 text-[12.5px] leading-relaxed text-[var(--muted)]">{x.d}</p>
                </div>
              </li>
            ))}
          </ol>
          <p className="mt-3 border-t border-[var(--line-2)] pt-3 text-[12px] leading-relaxed text-[var(--muted)]">
            No stage is called &ldquo;pending&rdquo;. If a citizen cannot tell what is happening from the status,
            the status is not doing its job.
          </p>
        </Card>

        <Card className="flex items-start gap-3 p-4">
          <ShieldCheck size={16} className="mt-0.5 shrink-0 text-[var(--ok)]" />
          <p className="text-[12.5px] leading-relaxed text-[var(--muted)]">
            Every update here is also delivered to your Gov.in inbox with this case attached. You are never told
            to log in somewhere to find out what happened.
          </p>
        </Card>
      </aside>
    </div>
  );
}
