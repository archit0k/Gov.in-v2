"use client";

import { useState } from "react";
import Link from "next/link";
import { CalendarClock, Check, MapPin } from "lucide-react";
import { Badge, Button, Card, cn } from "@/components/ui/primitives";
import { PanelTitle } from "@/components/platform/PlatformShell";
import { PSK_CENTRES } from "@/lib/data/domains";
import { useSession } from "@/lib/state/store";

export default function AppointmentsPage() {
  const { state } = useSession();
  const [picked, setPicked] = useState<string | null>(null);
  const booked = state.cases.find((c) => c.serviceId === "passport");

  return (
    <div className="grid gap-6 lg:grid-cols-[1.3fr_1fr]">
      <div className="grid content-start gap-6">
        <Card className="p-5">
          <PanelTitle>Passport Seva Kendras near you</PanelTitle>
          <p className="mb-4 max-w-[70ch] text-[13.5px] leading-relaxed text-[var(--muted)]">
            Ordered by distance from your verified current address. Slot counts come from this department&apos;s
            own inventory - the one thing on this page that could never live anywhere else.
          </p>
          <div className="grid gap-2">
            {PSK_CENTRES.map((c) => (
              <button
                key={c.name}
                onClick={() => setPicked(c.name)}
                className={cn(
                  "flex flex-wrap items-center gap-3 rounded-[var(--r-md)] border p-4 text-left transition-colors",
                  picked === c.name
                    ? "border-[var(--accent)] bg-[var(--accent-soft)]"
                    : "border-[var(--line)] hover:border-[var(--accent-line)]",
                )}
              >
                <MapPin size={16} className="shrink-0 text-[var(--muted)]" />
                <div className="min-w-0 flex-1">
                  <p className="text-[14px] font-medium leading-snug">{c.name}</p>
                  <p className="mt-0.5 text-[12.5px] text-[var(--muted)]">
                    {c.type} · {c.distance}
                  </p>
                </div>
                <div className="text-right">
                  <p className="tnum text-[13px] text-[var(--ink)]">{c.earliest}</p>
                  <p className="tnum text-[11.5px] text-[var(--muted)]">{c.slots} slots this week</p>
                </div>
                {picked === c.name && <Check size={16} className="shrink-0 text-[var(--accent)]" />}
              </button>
            ))}
          </div>
          {picked && (
            <div className="fade mt-4 flex flex-wrap items-center gap-3 border-t border-[var(--line-2)] pt-4">
              <Button href="/journeys/passport-renewal">Continue to the renewal</Button>
              <span className="text-[12.5px] text-[var(--muted)]">
                Slots are chosen inside the journey, so the hold and the application stay together.
              </span>
            </div>
          )}
        </Card>
      </div>

      <aside className="grid content-start gap-6">
        <Card className="p-5">
          <PanelTitle>Your appointment</PanelTitle>
          {booked ? (
            <div className="grid gap-2.5">
              <Badge tone="ok">Held</Badge>
              <p className="text-[13.5px] leading-relaxed text-[var(--ink-2)]">
                Attached to case{" "}
                <Link href={`/cases/${booked.id}`} className="mono text-[var(--accent)] hover:underline">
                  {booked.id}
                </Link>
                . Rescheduling moves the case with it - you are never asked to withdraw and reapply.
              </p>
            </div>
          ) : (
            <p className="text-[13.5px] leading-relaxed text-[var(--muted)]">
              You have no appointment yet. One is held the moment you pick a slot inside the renewal journey -
              before payment clears, rather than after it.
            </p>
          )}
        </Card>

        <Card className="p-5">
          <PanelTitle>On the day</PanelTitle>
          <div className="grid gap-2.5 text-[13px] leading-relaxed text-[var(--muted)]">
            <p className="flex gap-2.5">
              <CalendarClock size={14} className="mt-0.5 shrink-0" />
              Arrive 15 minutes early. The appointment is a time band, not a queue token.
            </p>
            <p className="flex gap-2.5">
              <Check size={14} className="mt-0.5 shrink-0 text-[var(--ok)]" />
              Bring your existing passport booklet. For a reissue, that is the only physical item required.
            </p>
          </div>
          <Link href="/passport/documents" className="mt-3 inline-block text-[13px] text-[var(--accent)] hover:underline">
            Full checklist
          </Link>
        </Card>
      </aside>
    </div>
  );
}
