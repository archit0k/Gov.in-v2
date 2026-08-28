"use client";

import Link from "next/link";
import { ArrowRight, Clock3, ShieldCheck, Users } from "lucide-react";
import { Badge, Button, Card } from "@/components/ui/primitives";
import { PanelTitle } from "@/components/platform/PlatformShell";
import { JOURNEY_MAP } from "@/lib/data/journeys";
import { POPULAR_ROUTES } from "@/lib/data/domains";

export default function BookPage() {
  const j = JOURNEY_MAP["irctc-book"];

  return (
    <div className="grid gap-6 lg:grid-cols-[1.3fr_1fr]">
      <div className="grid content-start gap-6">
        <Card className="p-5">
          <PanelTitle>Book a train</PanelTitle>
          <p className="mb-4 max-w-[70ch] text-[13.5px] leading-relaxed text-[var(--muted)]">
            Five steps, and three of them are decisions rather than data entry. The old flow asked for{" "}
            {j.legacyFields} fields, most of which were the same passenger details typed again.
          </p>
          <div className="mb-4 grid gap-2">
            {j.steps.slice(0, -1).map((s, i) => (
              <div key={s.id} className="flex items-start gap-3 rounded-[3px] border border-[var(--line)] px-4 py-3">
                <span className="tnum mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-full bg-[var(--line-2)] text-[11px] text-[var(--muted)]">
                  {i + 1}
                </span>
                <div className="min-w-0">
                  <p className="text-[14px] font-medium">{s.title}</p>
                  <p className="mt-0.5 text-[12.5px] leading-relaxed text-[var(--muted)]">{s.intent}</p>
                </div>
              </div>
            ))}
          </div>
          <div className="flex flex-wrap items-center gap-3 border-t border-[var(--line-2)] pt-4">
            <Button href="/journeys/irctc-book" size="lg">
              Start booking <ArrowRight size={15} />
            </Button>
            <span className="flex items-center gap-1.5 text-[12.5px] text-[var(--muted)]">
              <Clock3 size={13} /> About {j.estMinutes} minutes
            </span>
          </div>
        </Card>

        <Card className="p-5">
          <PanelTitle>From Pune Jn</PanelTitle>
          <div className="grid gap-2">
            {POPULAR_ROUTES.map((r) => (
              <Link
                key={r.to}
                href="/journeys/irctc-book"
                className="flex flex-wrap items-center gap-3 rounded-[3px] border border-[var(--line)] px-4 py-3 transition-colors hover:border-[var(--accent-line)] hover:bg-[var(--accent-soft)]"
              >
                <span className="min-w-0 flex-1 text-[14px]">
                  {r.from} <span className="text-[var(--faint)]">→</span> {r.to}
                </span>
                <span className="tnum text-[12.5px] text-[var(--muted)]">{r.trains} trains</span>
                <span className="tnum text-[12.5px] text-[var(--muted)]">{r.fastest}</span>
              </Link>
            ))}
          </div>
        </Card>
      </div>

      <aside className="grid content-start gap-6">
        <Card className="p-5">
          <PanelTitle>Why it asks so little</PanelTitle>
          <div className="grid gap-3">
            {[
              [Users, "Passengers come from your citizen graph, already verified, with concessions applied by default."],
              [ShieldCheck, "A verified co-passenger needs no ID check at boarding — Railways receives an assertion, not their records."],
              [Clock3, "Cancellation rules appear before payment, so a refund is never a surprise."],
            ].map(([Icon, text], i) => {
              const I = Icon as typeof Users;
              return (
                <p key={i} className="flex gap-2.5 text-[13px] leading-relaxed text-[var(--muted)]">
                  <I size={15} className="mt-0.5 shrink-0" />
                  {text as string}
                </p>
              );
            })}
          </div>
          <Badge tone="neutral" className="mt-3">Seat inventory stays with Indian Railways</Badge>
        </Card>
      </aside>
    </div>
  );
}
