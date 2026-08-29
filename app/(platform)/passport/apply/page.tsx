"use client";

import Link from "next/link";
import { ArrowRight, Check } from "lucide-react";
import { Badge, Button, Card, ServiceMark } from "@/components/ui/primitives";
import { PanelTitle } from "@/components/platform/PlatformShell";
import { JOURNEY_MAP } from "@/lib/data/journeys";
import { LEGACY_KNOWN, LEGACY_TOTAL } from "@/lib/data/legacy";
import { PASSPORT_FEES } from "@/lib/data/domains";

const PATHS = [
  {
    t: "Reissue on expiry",
    d: "Your passport is expiring or has expired. This is the common case, and the one you need.",
    href: "/journeys/passport-renewal",
    primary: true,
  },
  { t: "Pages exhausted", d: "Booklet full but still valid. Same journey, different reason.", href: "/journeys/passport-renewal" },
  { t: "Lost or damaged", d: "Adds a police report step and a higher fee.", href: "/journeys/passport-renewal" },
  { t: "First passport", d: "No existing passport on file. Requires birth and address proof.", href: "/journeys/passport-renewal" },
];

export default function ApplyPage() {
  const j = JOURNEY_MAP["passport-renewal"];
  return (
    <div className="grid gap-6 lg:grid-cols-[1.3fr_1fr]">
      <div className="grid content-start gap-6">
        <Card className="p-5">
          <PanelTitle>Which applies to you?</PanelTitle>
          <div className="grid gap-2">
            {PATHS.map((p) => (
              <Link
                key={p.t}
                href={p.href}
                className={
                  "flex items-center gap-3.5 rounded-[var(--r-md)] border p-4 transition-colors " +
                  (p.primary
                    ? "border-[var(--accent-line)] bg-[var(--accent-soft)]"
                    : "border-[var(--line)] hover:border-[var(--accent-line)]")
                }
              >
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="text-[14.5px] font-medium">{p.t}</p>
                    {p.primary && <Badge tone="accent">Applies to you</Badge>}
                  </div>
                  <p className="mt-0.5 text-[12.5px] leading-relaxed text-[var(--muted)]">{p.d}</p>
                </div>
                <ArrowRight size={16} className="shrink-0 text-[var(--faint)]" />
              </Link>
            ))}
          </div>
        </Card>

        <Card className="p-5">
          <PanelTitle>What the application asks you</PanelTitle>
          <p className="mb-3 max-w-[70ch] text-[13.5px] leading-relaxed text-[var(--muted)]">
            Four questions. Everything else this Ministry needs, it already holds or can request from the
            department that does.
          </p>
          <div className="grid gap-2">
            {[
              ["Why are you reapplying?", "Expiry, pages, or damage - it changes the process"],
              ["36 or 60 pages?", "A preference, not a fact about you"],
              ["Which centre and when?", "Real slots, held the moment you pick"],
              ["Who is your emergency contact?", "Chosen from your citizen graph"],
            ].map(([q, d]) => (
              <div key={q} className="flex items-start gap-2.5 rounded-[var(--r-md)] border border-[var(--line)] px-3.5 py-2.5">
                <Check size={14} className="mt-0.5 shrink-0 text-[var(--ok)]" />
                <div>
                  <p className="text-[13.5px] font-medium">{q}</p>
                  <p className="text-[12px] text-[var(--muted)]">{d}</p>
                </div>
              </div>
            ))}
          </div>
          <div className="mt-4 flex flex-wrap items-center gap-3 border-t border-[var(--line-2)] pt-4">
            <Button href="/journeys/passport-renewal" size="lg">
              Start the renewal <ArrowRight size={15} />
            </Button>
            <span className="text-[12.5px] text-[var(--muted)]">About {j.estMinutes} minutes</span>
          </div>
        </Card>
      </div>

      <aside className="grid content-start gap-6">
        <Card className="p-5">
          <PanelTitle>What it replaced</PanelTitle>
          <div className="grid gap-2.5">
            <div className="flex items-baseline justify-between">
              <span className="text-[13px] text-[var(--muted)]">Fields on the old form</span>
              <span className="tnum text-[18px] font-semibold">{LEGACY_TOTAL}</span>
            </div>
            <div className="flex items-baseline justify-between">
              <span className="text-[13px] text-[var(--muted)]">Already held about you</span>
              <span className="tnum text-[18px] font-semibold text-[var(--warn)]">{LEGACY_KNOWN}</span>
            </div>
            <div className="flex items-baseline justify-between">
              <span className="text-[13px] text-[var(--muted)]">Asked here</span>
              <span className="tnum text-[18px] font-semibold text-[var(--ok)]">4</span>
            </div>
          </div>
          <Link href="/before" className="mt-3 inline-flex items-center gap-1.5 text-[13px] text-[var(--accent)] hover:underline">
            See them side by side <ArrowRight size={13} />
          </Link>
        </Card>

        <Card className="p-5">
          <PanelTitle>Fees</PanelTitle>
          <div className="grid gap-2">
            {PASSPORT_FEES.slice(0, 4).map((f) => (
              <div key={f.service} className="flex items-baseline justify-between gap-4 border-b border-[var(--line-2)] pb-2 last:border-0">
                <span className="text-[12.5px] text-[var(--ink-2)]">{f.service}</span>
                <span className="tnum shrink-0 text-[13px]">₹{f.fee.toLocaleString("en-IN")}</span>
              </div>
            ))}
          </div>
          <Link href="/passport/documents" className="mt-3 inline-flex items-center gap-1.5 text-[13px] text-[var(--accent)] hover:underline">
            All fees and documents <ArrowRight size={13} />
          </Link>
        </Card>

        <Card className="flex items-center gap-3 p-4">
          <ServiceMark id="passport" size={32} />
          <p className="text-[12.5px] leading-relaxed text-[var(--muted)]">
            Applications are decided by the Ministry of External Affairs. Gov.in carries the request and the
            case; it does not approve anything.
          </p>
        </Card>
      </aside>
    </div>
  );
}
