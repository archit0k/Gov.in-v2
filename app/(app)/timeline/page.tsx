"use client";

import { Page, PageHead } from "@/components/shell/AppShell";
import { Badge, Card, ServiceMark, fmtDateTime } from "@/components/ui/primitives";
import { service } from "@/lib/data/services";
import { useSession } from "@/lib/state/store";
import type { TimelineItem } from "@/lib/types";

const KIND: Record<TimelineItem["kind"], { label: string; tone: "accent" | "ok" | "info" | "warn" | "neutral" }> = {
  submitted: { label: "Submitted", tone: "accent" },
  approved: { label: "Approved", tone: "ok" },
  issued: { label: "Issued", tone: "ok" },
  notice: { label: "Notice", tone: "warn" },
  payment: { label: "Payment", tone: "info" },
  profile: { label: "Profile", tone: "neutral" },
};

function groupLabel(iso: string) {
  const d = new Date(iso);
  const today = new Date();
  const diff = Math.floor((today.getTime() - d.getTime()) / 86_400_000);
  if (diff <= 0) return "Today";
  if (diff === 1) return "Yesterday";
  if (diff < 30) return "This month";
  return d.toLocaleDateString("en-IN", { month: "long", year: "numeric" });
}

export default function TimelinePage() {
  const { state } = useSession();
  const items = [...state.timeline].sort((a, b) => +new Date(b.at) - +new Date(a.at));

  const groups: { label: string; items: TimelineItem[] }[] = [];
  for (const it of items) {
    const l = groupLabel(it.at);
    const g = groups.find((x) => x.label === l);
    if (g) g.items.push(it);
    else groups.push({ label: l, items: [it] });
  }

  return (
    <Page>
      <PageHead
        title="Your government timeline"
        sub="One chronological record of your relationship with the state, across every department. Not eleven activity logs behind eleven logins."
      />

      <div className="grid gap-8">
        {groups.map((g) => (
          <section key={g.label}>
            <h2 className="mb-3 text-[12px] font-semibold uppercase tracking-[0.09em] text-[var(--muted)]">{g.label}</h2>
            <Card className="divide-y divide-[var(--line-2)] overflow-hidden">
              {g.items.map((it) => (
                <div key={it.id} className="flex gap-3.5 p-4">
                  <ServiceMark id={it.serviceId} size={34} />
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="text-[14.5px] font-medium leading-snug">{it.title}</p>
                      <Badge tone={KIND[it.kind].tone}>{KIND[it.kind].label}</Badge>
                    </div>
                    <p className="mt-1 text-[13px] leading-relaxed text-[var(--muted)]">{it.detail}</p>
                    <p className="mt-1 text-[11.5px] text-[var(--faint)]">
                      {service(it.serviceId).name} · {fmtDateTime(it.at)}
                    </p>
                  </div>
                </div>
              ))}
            </Card>
          </section>
        ))}
      </div>
    </Page>
  );
}
