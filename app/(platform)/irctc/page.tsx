"use client";

import Link from "next/link";
import { ArrowRight, Clock3, TrainFront, Users } from "lucide-react";
import { Badge, Button, Card, SourceTag } from "@/components/ui/primitives";
import { DataRow, PanelTitle } from "@/components/platform/PlatformShell";
import { formatDate } from "@/lib/data/citizen";
import { POPULAR_ROUTES, TRIPS } from "@/lib/data/domains";

export default function IrctcOverview() {
  const upcoming = TRIPS.find((t) => t.status === "confirmed");

  return (
    <div className="grid gap-6 lg:grid-cols-[1.35fr_1fr]">
      <div className="grid content-start gap-6">
        {upcoming && (
          <Card className="overflow-hidden">
            <div className="flex flex-wrap items-center gap-3 border-b border-[var(--line-2)] bg-[var(--accent-soft)] px-5 py-3">
              <TrainFront size={16} className="shrink-0 text-[var(--accent)]" />
              <p className="min-w-0 flex-1 text-[13.5px] font-medium">
                Next journey · {formatDate(upcoming.date)}
              </p>
              <Badge tone="ok">Confirmed</Badge>
            </div>
            <div className="p-5">
              <div className="mb-4 flex flex-wrap items-center gap-x-4 gap-y-2">
                <div>
                  <p className="tnum text-[20px] font-semibold leading-none">{upcoming.depart}</p>
                  <p className="mt-1 text-[13px] text-[var(--muted)]">{upcoming.from}</p>
                </div>
                <div className="flex min-w-[70px] flex-1 items-center gap-2">
                  <span className="h-px flex-1 bg-[var(--line)]" />
                  <ArrowRight size={14} className="text-[var(--faint)]" />
                  <span className="h-px flex-1 bg-[var(--line)]" />
                </div>
                <div className="text-right">
                  <p className="tnum text-[20px] font-semibold leading-none">{upcoming.arrive}</p>
                  <p className="mt-1 text-[13px] text-[var(--muted)]">{upcoming.to}</p>
                </div>
              </div>
              <dl>
                <DataRow k="Train" v={upcoming.train} />
                <DataRow k="PNR" v={<span className="mono">{upcoming.pnr}</span>} />
                <DataRow k="Class" v={upcoming.cls} />
                <DataRow k="Berths" v={upcoming.berths.join(" · ")} />
                <DataRow k="Passengers" v={upcoming.pax.join(", ")} hint="Both verified — no ID check at boarding" />
              </dl>
              <SourceTag label="Seat inventory and PNR owned by Indian Railways" className="mt-3" />
            </div>
          </Card>
        )}

        <Card className="p-5">
          <PanelTitle action={<Link href="/irctc/book" className="text-[12.5px] text-[var(--accent)] hover:underline">Book</Link>}>
            Routes from your home station
          </PanelTitle>
          <p className="mb-3 text-[12.5px] text-[var(--muted)]">
            Pune Jn, inferred from your verified address. Not a preference you had to set.
          </p>
          <div className="grid gap-2">
            {POPULAR_ROUTES.map((r) => (
              <Link
                key={r.to}
                href="/journeys/irctc-book"
                className="flex flex-wrap items-center gap-3 rounded-[11px] border border-[var(--line)] px-4 py-3 transition-colors hover:border-[var(--accent-line)] hover:bg-[var(--accent-soft)]"
              >
                <span className="min-w-0 flex-1 text-[14px]">
                  {r.from} <span className="text-[var(--faint)]">→</span> {r.to}
                </span>
                <span className="tnum text-[12.5px] text-[var(--muted)]">{r.trains} trains</span>
                <span className="tnum flex items-center gap-1 text-[12.5px] text-[var(--muted)]">
                  <Clock3 size={12} /> {r.fastest}
                </span>
              </Link>
            ))}
          </div>
        </Card>
      </div>

      <aside className="grid content-start gap-6">
        <Card className="p-5">
          <PanelTitle>Book a train</PanelTitle>
          <p className="mb-3.5 text-[13.5px] leading-relaxed text-[var(--muted)]">
            Passengers come from your citizen graph, concessions are applied by default, and the cancellation
            rules are shown before you pay rather than discovered during a refund.
          </p>
          <Button href="/journeys/irctc-book" size="lg" className="w-full">
            Start booking <ArrowRight size={15} />
          </Button>
        </Card>

        <Card className="p-5">
          <PanelTitle>Who you travel with</PanelTitle>
          <div className="grid gap-2.5">
            {[
              ["Meera Deshmukh", "Spouse · own Gov.in identity"],
              ["Ramesh Deshmukh", "Father · senior citizen concession"],
              ["Sunanda Deshmukh", "Mother · senior citizen concession"],
            ].map(([n, d]) => (
              <div key={n} className="flex items-center gap-2.5">
                <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-[var(--line-2)] text-[var(--muted)]">
                  <Users size={14} />
                </span>
                <div className="min-w-0">
                  <p className="truncate text-[13.5px] leading-tight">{n}</p>
                  <p className="truncate text-[11.5px] text-[var(--muted)]">{d}</p>
                </div>
              </div>
            ))}
          </div>
          <p className="mt-3 border-t border-[var(--line-2)] pt-3 text-[12px] leading-relaxed text-[var(--muted)]">
            Railways sees that these people are verified and eligible. It does not receive their full records.
          </p>
        </Card>
      </aside>
    </div>
  );
}
