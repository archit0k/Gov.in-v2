"use client";

import Link from "next/link";
import { Card, cn } from "@/components/ui/primitives";
import { PanelTitle } from "@/components/platform/PlatformShell";
import { fmtDateTime } from "@/components/ui/primitives";
import { REFUND_RULES, TRIPS } from "@/lib/data/domains";

export default function RefundsPage() {
  const refunded = TRIPS.filter((t) => t.refund);

  return (
    <div className="grid gap-6 lg:grid-cols-[1.3fr_1fr]">
      <div className="grid content-start gap-6">
        <Card className="p-5">
          <PanelTitle>What you get back, and when</PanelTitle>
          <p className="mb-4 max-w-[70ch] text-[13.5px] leading-relaxed text-[var(--muted)]">
            These rules are shown before you pay inside the booking journey, not found afterwards when you need
            them. A rule a citizen only discovers at the point of loss is not really a published rule.
          </p>
          <div className="grid gap-2">
            {REFUND_RULES.map((r) => (
              <div key={r.window} className="rounded-[var(--r-md)] border border-[var(--line)] p-3.5">
                <div className="mb-2 flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
                  <p className="text-[13.5px] font-medium">{r.window}</p>
                  <p className={cn("text-[13px]", r.pct === 0 ? "text-[var(--ok)]" : "text-[var(--ink-2)]")}>
                    {r.retained}
                  </p>
                </div>
                <div className="h-1.5 overflow-hidden rounded-full bg-[var(--line-2)]">
                  <div
                    className="h-full rounded-full transition-all"
                    style={{
                      width: `${100 - r.pct}%`,
                      background: r.pct === 0 ? "var(--ok)" : r.pct >= 100 ? "var(--danger)" : "var(--accent)",
                    }}
                  />
                </div>
                <p className="mt-1.5 text-[11.5px] text-[var(--muted)]">
                  {r.pct === 0 ? "Full fare returned" : `${100 - r.pct}% of the fare returned`}
                </p>
              </div>
            ))}
          </div>
        </Card>
      </div>

      <aside className="grid content-start gap-6">
        <Card className="p-5">
          <PanelTitle>Your refunds</PanelTitle>
          {refunded.length === 0 ? (
            <p className="text-[13.5px] leading-relaxed text-[var(--muted)]">No refunds on record.</p>
          ) : (
            <div className="grid gap-3">
              {refunded.map((t) => (
                <div key={t.pnr} className="rounded-[var(--r-md)] border border-[var(--line)] p-3.5">
                  <div className="mb-1 flex flex-wrap items-baseline justify-between gap-x-3">
                    <p className="text-[13.5px] font-medium">₹{t.refund!.amount.toLocaleString("en-IN")}</p>
                    <span className="mono text-[11.5px] text-[var(--faint)]">{t.pnr}</span>
                  </div>
                  <p className="text-[12.5px] leading-relaxed text-[var(--muted)]">{t.refund!.note}</p>
                  <p className="mt-1 text-[11.5px] text-[var(--faint)]">Credited {fmtDateTime(t.refund!.at)}</p>
                </div>
              ))}
            </div>
          )}
          <p className="mt-3 border-t border-[var(--line-2)] pt-3 text-[12.5px] leading-relaxed text-[var(--muted)]">
            You did not apply for either of these. Money owed to a citizen should not require a form.{" "}
            <Link href="/timeline" className="text-[var(--accent)] hover:underline">
              See it in your timeline
            </Link>
          </p>
        </Card>
      </aside>
    </div>
  );
}
