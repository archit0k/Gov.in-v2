"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Badge, Card } from "@/components/ui/primitives";
import { PanelTitle } from "@/components/platform/PlatformShell";
import { formatDate } from "@/lib/data/citizen";
import { TRIPS } from "@/lib/data/domains";

const TONE = {
  confirmed: "ok",
  completed: "neutral",
  cancelled: "danger",
} as const;

export default function TripsPage() {
  const upcoming = TRIPS.filter((t) => t.status === "confirmed");
  const past = TRIPS.filter((t) => t.status !== "confirmed");

  return (
    <div className="grid gap-6">
      <Card className="p-5">
        <PanelTitle action={<Link href="/journeys/irctc-book" className="text-[12.5px] text-[var(--accent)] hover:underline">Book another</Link>}>
          Upcoming
        </PanelTitle>
        <div className="grid gap-2">
          {upcoming.map((t) => (
            <Trip key={t.pnr} t={t} />
          ))}
        </div>
      </Card>

      <Card className="p-5">
        <PanelTitle>Past journeys</PanelTitle>
        <div className="grid gap-2">
          {past.map((t) => (
            <Trip key={t.pnr} t={t} />
          ))}
        </div>
        <p className="mt-3 text-[12px] leading-relaxed text-[var(--muted)]">
          Journeys stay in this department&apos;s records. The refunds and payments from them also appear in your
          Gov.in timeline, because money moving is a government event, not a railway one.
        </p>
      </Card>
    </div>
  );
}

function Trip({ t }: { t: (typeof TRIPS)[number] }) {
  return (
    <div className="rounded-[3px] border border-[var(--line)] p-4">
      <div className="mb-2.5 flex flex-wrap items-center gap-2">
        <p className="min-w-0 flex-1 truncate text-[14px] font-medium">{t.train}</p>
        <Badge tone={TONE[t.status]}>{t.status}</Badge>
        <span className="mono text-[11.5px] text-[var(--faint)]">{t.pnr}</span>
      </div>
      <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1 text-[13px]">
        <span className="tnum">{t.depart}</span>
        <span className="text-[var(--ink-2)]">{t.from}</span>
        <ArrowRight size={13} className="text-[var(--faint)]" />
        <span className="tnum">{t.arrive}</span>
        <span className="text-[var(--ink-2)]">{t.to}</span>
        <span className="text-[var(--muted)]">· {formatDate(t.date)}</span>
        <span className="text-[var(--muted)]">· {t.cls}</span>
        <span className="tnum ml-auto">₹{t.fare.toLocaleString("en-IN")}</span>
      </div>
      {t.pax.length > 0 && (
        <p className="mt-2 text-[12.5px] text-[var(--muted)]">{t.pax.join(", ")}</p>
      )}
      {t.refund && (
        <p className="mt-2 rounded-[3px] bg-[var(--ok-soft)] px-3 py-2 text-[12.5px] leading-relaxed text-[var(--ok)]">
          ₹{t.refund.amount.toLocaleString("en-IN")} refunded automatically. {t.refund.note}
        </p>
      )}
    </div>
  );
}
