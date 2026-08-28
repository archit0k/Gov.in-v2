"use client";

import { useState } from "react";
import { ArrowRight, Search } from "lucide-react";
import { Badge, Button, Card, SourceTag } from "@/components/ui/primitives";
import { DataRow, PanelTitle } from "@/components/platform/PlatformShell";
import { formatDate } from "@/lib/data/citizen";
import { TRIPS } from "@/lib/data/domains";

/* PNR lookup is the one thing citizens do most on the existing site, and the
   one thing they should almost never need to do here: their own journeys are
   already listed. The box stays for looking up someone else's. */

export default function PnrPage() {
  const [pnr, setPnr] = useState("");
  const [result, setResult] = useState<(typeof TRIPS)[number] | null | "none">(null);

  function look() {
    const clean = pnr.replace(/\s+/g, "");
    if (clean.length < 4) return;
    const hit = TRIPS.find((t) => t.pnr.replace(/\s+/g, "").includes(clean));
    setResult(hit ?? "none");
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[1.3fr_1fr]">
      <div className="grid content-start gap-6">
        <Card className="p-5">
          <PanelTitle>Look up a PNR</PanelTitle>
          <p className="mb-3.5 max-w-[68ch] text-[13.5px] leading-relaxed text-[var(--muted)]">
            Your own journeys are already listed under My trips, with no number to remember. This is for
            looking up a ticket booked by someone else.
          </p>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              look();
            }}
            className="flex flex-wrap gap-2"
          >
            <div className="flex h-11 min-w-[220px] flex-1 items-center gap-2.5 rounded-[11px] border-2 border-[var(--line)] px-3.5 transition-colors focus-within:border-[var(--accent)]">
              <Search size={16} className="shrink-0 text-[var(--faint)]" />
              <input
                value={pnr}
                onChange={(e) => setPnr(e.target.value)}
                placeholder="10-digit PNR"
                aria-label="PNR number"
                inputMode="numeric"
                className="mono min-w-0 flex-1 border-0 bg-transparent text-[14.5px] outline-none focus:outline-none focus-visible:outline-none placeholder:font-sans placeholder:text-[var(--faint)]"
              />
            </div>
            <Button type="submit" size="lg" disabled={pnr.replace(/\s+/g, "").length < 4}>
              Check <ArrowRight size={15} />
            </Button>
          </form>
          <button
            onClick={() => {
              setPnr("4521887190");
              setTimeout(look, 0);
            }}
            className="mono mt-2.5 text-[12px] text-[var(--accent)] hover:underline"
          >
            Try 4521 887 190
          </button>

          {result === "none" && (
            <p className="fade mt-4 rounded-[10px] border border-[var(--line)] bg-[var(--panel-2)] p-3.5 text-[13.5px] leading-relaxed text-[var(--muted)]">
              No booking matches that number. Nothing was wrong with what you typed — this prototype only holds
              the fictional bookings for this demo citizen.
            </p>
          )}

          {result && result !== "none" && (
            <div className="fade mt-4 rounded-[12px] border border-[var(--accent-line)] bg-[var(--accent-soft)] p-4">
              <div className="mb-3 flex flex-wrap items-center gap-2">
                <p className="min-w-0 flex-1 truncate text-[14.5px] font-medium">{result.train}</p>
                <Badge tone={result.status === "confirmed" ? "ok" : result.status === "cancelled" ? "danger" : "neutral"}>
                  {result.status}
                </Badge>
              </div>
              <dl>
                <DataRow k="From" v={`${result.from} · ${result.depart}`} />
                <DataRow k="To" v={`${result.to} · ${result.arrive}`} />
                <DataRow k="Date" v={formatDate(result.date)} />
                <DataRow k="Class" v={result.cls} />
                {result.berths.length > 0 && <DataRow k="Berths" v={result.berths.join(" · ")} />}
                <DataRow k="Passengers" v={result.pax.join(", ")} />
              </dl>
              <SourceTag label="Passenger Reservation System — Indian Railways" className="mt-3" />
            </div>
          )}
        </Card>
      </div>

      <aside className="grid content-start gap-6">
        <Card className="p-5">
          <PanelTitle>Reading a status honestly</PanelTitle>
          <div className="grid gap-3 text-[13px] leading-relaxed text-[var(--muted)]">
            <p>
              <span className="text-[var(--ink)]">Confirmed</span> — you have a berth. Nothing else to do.
            </p>
            <p>
              <span className="text-[var(--ink)]">RAC</span> — you have a seat and share a berth until someone
              cancels. Under position 10 on most routes, this confirms more often than not.
            </p>
            <p>
              <span className="text-[var(--ink)]">Waitlisted</span> — no seat yet. If it is still waitlisted when
              the chart is prepared, the ticket is dropped and the fare returns automatically.
            </p>
          </div>
          <p className="mt-3 border-t border-[var(--line-2)] pt-3 text-[12px] leading-relaxed text-[var(--muted)]">
            Booking through Gov.in shows an estimated chance of confirmation before you pay, rather than a code
            you have to learn to interpret.
          </p>
        </Card>
      </aside>
    </div>
  );
}
