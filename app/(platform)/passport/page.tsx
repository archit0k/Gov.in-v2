"use client";

import Link from "next/link";
import { AlertTriangle, ArrowRight, CalendarClock, FileText, MapPin } from "lucide-react";
import { Badge, Button, Card, ProgressRail, SourceTag } from "@/components/ui/primitives";
import { DataRow, PanelTitle } from "@/components/platform/PlatformShell";
import { CITIZEN, daysUntil, formatDate } from "@/lib/data/citizen";
import { PSK_CENTRES } from "@/lib/data/domains";
import { useSession } from "@/lib/state/store";

export default function PassportOverview() {
  const { state } = useSession();
  const p = CITIZEN.credentials.find((c) => c.id === "cred-passport")!;
  const left = daysUntil(p.expiresOn!);
  const cases = state.cases.filter((c) => c.serviceId === "passport");

  return (
    <div className="grid gap-6 lg:grid-cols-[1.35fr_1fr]">
      <div className="grid content-start gap-6">
        {/* The one thing this department knows about you that matters today */}
        <Card className="overflow-hidden">
          <div className="flex flex-wrap items-center gap-3 border-b border-[var(--line-2)] bg-[var(--accent-soft)] px-5 py-3">
            <AlertTriangle size={16} className="shrink-0 text-[var(--accent)]" />
            <p className="min-w-0 flex-1 text-[13.5px] font-medium text-[var(--ink)]">
              Your passport expires in {left} days, on {formatDate(p.expiresOn!)}
            </p>
            <Button size="sm" href="/journeys/passport-renewal">
              Renew now <ArrowRight size={14} />
            </Button>
          </div>
          <div className="p-5">
            <PanelTitle>Your passport</PanelTitle>
            <dl>
              <DataRow k="Passport number" v={<span className="mono">{p.number}</span>} />
              <DataRow k="Type" v={p.meta?.Type ?? "Ordinary"} />
              <DataRow k="Pages" v={p.meta?.Pages ?? "36"} />
              <DataRow k="File number" v={<span className="mono">{p.meta?.["File number"]}</span>} />
              <DataRow k="Issued" v={formatDate(p.issuedOn!)} hint={p.issuer} />
              <DataRow
                k="Expires"
                v={formatDate(p.expiresOn!)}
                hint={`${left} days left · many countries require six months`}
              />
            </dl>
            <SourceTag label="Passport Seva record — owned by this department, not copied elsewhere" className="mt-3" />
          </div>
        </Card>

        {cases.length > 0 ? (
          <Card className="p-5">
            <PanelTitle action={<Link href="/passport/track" className="text-[12.5px] text-[var(--accent)] hover:underline">Track</Link>}>
              Your applications
            </PanelTitle>
            <div className="grid gap-4">
              {cases.map((c) => (
                <Link key={c.id} href={`/cases/${c.id}`} className="block">
                  <div className="mb-2 flex items-center gap-3">
                    <p className="min-w-0 flex-1 truncate text-[14px] font-medium">{c.title}</p>
                    <span className="mono shrink-0 text-[11.5px] text-[var(--faint)]">{c.id}</span>
                  </div>
                  <ProgressRail steps={c.states} current={c.stateIndex} />
                </Link>
              ))}
            </div>
          </Card>
        ) : (
          <Card className="p-5">
            <PanelTitle>Your applications</PanelTitle>
            <p className="text-[13.5px] leading-relaxed text-[var(--muted)]">
              Nothing in progress. When you apply, it becomes a case you can follow from here or from anywhere
              else in Gov.in — the same case, not a copy of it.
            </p>
          </Card>
        )}

        <Card className="p-5">
          <PanelTitle>What you can do here</PanelTitle>
          <div className="grid gap-2 sm:grid-cols-2">
            {[
              { href: "/journeys/passport-renewal", t: "Renew or reissue", d: "About 4 minutes. Nothing to upload." },
              { href: "/passport/appointments", t: "Book or move an appointment", d: "Four centres near Pune." },
              { href: "/passport/documents", t: "Fees and what to carry", d: "Six services, current fees." },
              { href: "/passport/track", t: "Track an application", d: "Including police verification." },
            ].map((x) => (
              <Link
                key={x.href}
                href={x.href}
                className="rounded-[11px] border border-[var(--line)] p-3.5 transition-colors hover:border-[var(--accent-line)] hover:bg-[var(--accent-soft)]"
              >
                <p className="text-[14px] font-medium">{x.t}</p>
                <p className="mt-0.5 text-[12.5px] text-[var(--muted)]">{x.d}</p>
              </Link>
            ))}
          </div>
        </Card>
      </div>

      <aside className="grid content-start gap-6">
        <Card className="p-5">
          <PanelTitle
            action={<Link href="/passport/appointments" className="text-[12.5px] text-[var(--accent)] hover:underline">All centres</Link>}
          >
            Nearest centres
          </PanelTitle>
          <div className="grid gap-3">
            {PSK_CENTRES.slice(0, 3).map((c) => (
              <div key={c.name} className="flex items-start gap-2.5">
                <MapPin size={14} className="mt-1 shrink-0 text-[var(--muted)]" />
                <div className="min-w-0 flex-1">
                  <p className="text-[13.5px] leading-snug">{c.name}</p>
                  <p className="text-[12px] text-[var(--muted)]">
                    {c.distance} · earliest {c.earliest}
                  </p>
                </div>
              </div>
            ))}
          </div>
          <p className="mt-3 border-t border-[var(--line-2)] pt-3 text-[12px] leading-relaxed text-[var(--muted)]">
            Distances are from your verified current address in Pune. This department never stored that address.
          </p>
        </Card>

        <Card className="p-5">
          <PanelTitle>Before you travel</PanelTitle>
          <div className="grid gap-3 text-[13px] leading-relaxed text-[var(--muted)]">
            <p className="flex gap-2.5">
              <CalendarClock size={14} className="mt-0.5 shrink-0" />
              Most countries require six months of validity on the date you arrive, not the date you book.
            </p>
            <p className="flex gap-2.5">
              <FileText size={14} className="mt-0.5 shrink-0" />
              A valid visa in an old booklet stays valid. Carry the cancelled booklet alongside the new one.
            </p>
          </div>
          <Badge tone="neutral" className="mt-3">Ministry of External Affairs</Badge>
        </Card>
      </aside>
    </div>
  );
}
