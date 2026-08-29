"use client";

import Link from "next/link";
import { ArrowRight, Clock3, Layers } from "lucide-react";
import { Page, PageHead } from "@/components/shell/AppShell";
import { Badge, Card, EmptyState, ProgressRail, SectionTitle, ServiceMark } from "@/components/ui/primitives";
import { JOURNEYS } from "@/lib/data/journeys";
import { service } from "@/lib/data/services";
import { allComposable } from "@/lib/ai/engine";
import { useSession } from "@/lib/state/store";

export default function JourneysPage() {
  const { state, journey, ready } = useSession();
  const drafts = Object.values(state.drafts);
  const composable = allComposable();

  return (
    <Page wide>
      <PageHead
        title="Journeys"
        sub="A journey is a citizen goal, not a departmental form. Every one below is a configuration entry rendered by the same engine."
      />

      {ready && drafts.length > 0 && (
        <section className="mb-9">
          <SectionTitle>In progress</SectionTitle>
          <div className="grid gap-2.5 sm:grid-cols-2">
            {drafts.map((d) => {
              const j = journey(d.journeyId);
              if (!j) return null;
              return (
                <Card key={d.journeyId} as={Link} href={`/journeys/${j.id}`} interactive className="p-4">
                  <div className="mb-3 flex items-center gap-2.5">
                    <ServiceMark id={j.serviceId} size={30} />
                    <p className="min-w-0 flex-1 truncate text-[14.5px] font-medium">{j.title}</p>
                    <span className="tnum shrink-0 text-[12px] text-[var(--muted)]">
                      {d.stepIndex + 1}/{j.steps.length}
                    </span>
                  </div>
                  <ProgressRail steps={j.steps.map((s) => s.title)} current={d.stepIndex} />
                </Card>
              );
            })}
          </div>
        </section>
      )}

      <section className="mb-9">
        <SectionTitle>Published journeys</SectionTitle>
        <div className="grid gap-2.5 sm:grid-cols-2">
          {JOURNEYS.filter((j) => j.id !== "scheme-apply").map((j, i) => (
            <Card
              key={j.id}
              as={Link}
              href={`/journeys/${j.id}`}
              interactive
              className="rise flex items-start gap-3.5 p-4"
              style={{ animationDelay: `${i * 30}ms` }}
            >
              <ServiceMark id={j.serviceId} size={34} />
              <div className="min-w-0 flex-1">
                <p className="text-[14.5px] font-medium leading-snug">{j.title}</p>
                <p className="mt-1 text-[12.5px] leading-relaxed text-[var(--muted)]">{j.goal}</p>
                <div className="mt-2 flex flex-wrap items-center gap-2">
                  <Badge tone="neutral"><Clock3 size={11} /> ~{j.estMinutes} min</Badge>
                  <span className="text-[11.5px] text-[var(--faint)]">{service(j.serviceId).shortName}</span>
                </div>
              </div>
              <ArrowRight size={16} className="mt-1 shrink-0 text-[var(--faint)]" />
            </Card>
          ))}
        </div>
      </section>

      <section>
        <SectionTitle>Life events - composed on demand</SectionTitle>
        <p className="mb-3 max-w-[76ch] text-[13.5px] leading-relaxed text-[var(--muted)]">
          No department owns these. They are assembled from capabilities that already exist, for one citizen, when
          asked for. The AI layer may compose existing government capabilities. It may not invent one.
        </p>
        <div className="grid gap-2.5 sm:grid-cols-2">
          {composable.map((c) => (
            <Card key={c.id} as={Link} href={`/journeys/${c.id}`} interactive className="p-4">
              <div className="mb-2 flex items-center gap-2">
                <Badge tone="accent"><Layers size={11} /> Composed</Badge>
                <span className="text-[11.5px] text-[var(--faint)]">{c.steps.length} capabilities</span>
              </div>
              <p className="text-[14.5px] font-medium leading-snug">{c.title}</p>
              <p className="mt-1 text-[12.5px] leading-relaxed text-[var(--muted)]">{c.goal}</p>
              <div className="mt-2.5 flex -space-x-1.5">
                {c.composes?.map((s) => <ServiceMark key={s} id={s} size={24} className="ring-2 ring-[var(--panel)]" />)}
              </div>
            </Card>
          ))}
        </div>
      </section>

      {ready && state.cases.length === 0 && (
        <div className="mt-9">
          <EmptyState title="No completed journeys yet" body="Anything you submit becomes a case you can track from anywhere." />
        </div>
      )}
    </Page>
  );
}
