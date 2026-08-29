"use client";

import { Check, Info, X } from "lucide-react";
import { Badge, Card } from "@/components/ui/primitives";
import { PanelTitle } from "@/components/platform/PlatformShell";
import { PASSPORT_CHECKLIST, PASSPORT_FEES } from "@/lib/data/domains";

const MARK = {
  held: { icon: Check, tone: "ok" as const, label: "Already held", bg: "var(--ok-soft)", fg: "var(--ok)" },
  carry: { icon: Info, tone: "warn" as const, label: "Carry it", bg: "var(--warn-soft)", fg: "var(--warn)" },
  "not-needed": { icon: X, tone: "neutral" as const, label: "Not needed", bg: "var(--line-2)", fg: "var(--muted)" },
};

export default function DocumentsPage() {
  return (
    <div className="grid gap-6 lg:grid-cols-[1.25fr_1fr]">
      <Card className="p-5">
        <PanelTitle>What this application needs</PanelTitle>
        <p className="mb-4 max-w-[70ch] text-[13.5px] leading-relaxed text-[var(--muted)]">
          A checklist that tells you what you do <span className="text-[var(--ink)]">not</span> have to bring is
          more useful than one listing everything as though nothing were known about you.
        </p>
        <div className="grid gap-2">
          {PASSPORT_CHECKLIST.map((c) => {
            const m = MARK[c.status];
            const Icon = m.icon;
            return (
              <div key={c.item} className="flex gap-3 rounded-[var(--r-md)] border border-[var(--line)] p-3.5">
                <span
                  className="mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-full"
                  style={{ background: m.bg, color: m.fg }}
                >
                  <Icon size={12} strokeWidth={3} />
                </span>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="text-[14px] font-medium">{c.item}</p>
                    <Badge tone={m.tone}>{m.label}</Badge>
                  </div>
                  <p className="mt-0.5 text-[12.5px] leading-relaxed text-[var(--muted)]">{c.note}</p>
                </div>
              </div>
            );
          })}
        </div>
      </Card>

      <Card className="overflow-hidden p-0">
        <div className="p-5 pb-3">
          <PanelTitle>Fees and processing times</PanelTitle>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[420px] text-left">
            <thead>
              <tr className="border-y border-[var(--line-2)] bg-[var(--panel-2)]">
                <th className="px-5 py-2.5 text-[11.5px] font-semibold uppercase tracking-[0.07em] text-[var(--muted)]">
                  Service
                </th>
                <th className="px-3 py-2.5 text-right text-[11.5px] font-semibold uppercase tracking-[0.07em] text-[var(--muted)]">
                  Fee
                </th>
                <th className="px-5 py-2.5 text-right text-[11.5px] font-semibold uppercase tracking-[0.07em] text-[var(--muted)]">
                  Time
                </th>
              </tr>
            </thead>
            <tbody>
              {PASSPORT_FEES.map((f) => (
                <tr key={f.service} className="border-b border-[var(--line-2)] last:border-0">
                  <td className="px-5 py-2.5 text-[13px] text-[var(--ink-2)]">{f.service}</td>
                  <td className="tnum px-3 py-2.5 text-right text-[13px]">₹{f.fee.toLocaleString("en-IN")}</td>
                  <td className="px-5 py-2.5 text-right text-[12.5px] text-[var(--muted)]">{f.time}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="px-5 py-4 text-[12px] leading-relaxed text-[var(--muted)]">
          Fees are set by the Ministry of External Affairs, paid once inside the journey, with the receipt
          attached to your case. Figures here are illustrative for this prototype.
        </p>
      </Card>
    </div>
  );
}
