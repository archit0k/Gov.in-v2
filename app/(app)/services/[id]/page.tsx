"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useEffect } from "react";
import { ArrowRight, Clock3, Database, Layers, Puzzle } from "lucide-react";
import { Page } from "@/components/shell/AppShell";
import { Badge, Button, Card, EmptyState, ProgressRail, SectionTitle, ServiceMark, ServiceTheme } from "@/components/ui/primitives";
import { PLATFORMS, SERVICE_MAP } from "@/lib/data/services";
import { journeysForService } from "@/lib/data/journeys";
import { CITIZEN } from "@/lib/data/citizen";
import { useSession } from "@/lib/state/store";
import type { ServiceId } from "@/lib/types";

export default function ServicePage() {
  const { id } = useParams<{ id: string }>();
  const { state } = useSession();
  const router = useRouter();
  const s = SERVICE_MAP[id];
  const platform = PLATFORMS[id as keyof typeof PLATFORMS];

  // Departments built out as their own platform own their URL.
  useEffect(() => {
    if (platform) router.replace(platform);
  }, [platform, router]);

  if (!s) {
    return (
      <Page>
        <EmptyState
          title="No such service"
          body="That department is not in the service registry."
          action={<Button href="/services">Browse services</Button>}
        />
      </Page>
    );
  }

  const journeys = journeysForService(s.id);
  const cases = state.cases.filter((c) => c.serviceId === s.id);
  const creds = CITIZEN.credentials.filter((c) => c.serviceId === s.id);
  const notes = state.inbox.filter((n) => n.serviceId === s.id).slice(0, 3);

  return (
    <ServiceTheme id={s.id as ServiceId}>
      {/* Department-owned hero: their identity, our layout */}
      <div className="border-b border-[var(--line)]" style={{ background: "var(--accent-soft)" }}>
        <div className="mx-auto w-full max-w-[1180px] px-5 py-9 sm:px-8">
          <div className="flex flex-wrap items-start gap-4">
            <ServiceMark id={s.id as ServiceId} size={54} />
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-[27px] font-semibold leading-tight tracking-[-0.02em]">{s.name}</h1>
                <Badge tone="accent">{s.subdomain}</Badge>
              </div>
              <p className="mt-1 text-[14px] text-[var(--ink-2)]">{s.department}</p>
              <p className="mt-3 max-w-[68ch] text-[15px] leading-relaxed text-[var(--ink-2)]">{s.summary}</p>
            </div>
          </div>
        </div>
      </div>

      <Page wide>
        <div className="grid gap-9 lg:grid-cols-[1.25fr_1fr]">
          <div>
            <section className="mb-9">
              <SectionTitle>What you can do</SectionTitle>
              {journeys.length === 0 ? (
                <EmptyState
                  title="No journey published yet"
                  body={`${s.department} is on the registry and its data is reachable, but this department has not published a citizen journey in this prototype.`}
                  action={<Button href="/services" variant="secondary">Back to services</Button>}
                />
              ) : (
                <div className="grid gap-2.5">
                  {journeys.map((j) => (
                    <Card key={j.id} as={Link} href={`/journeys/${j.id}`} interactive className="flex items-center gap-3.5 p-4">
                      <div className="min-w-0 flex-1">
                        <p className="text-[15px] font-medium leading-snug">{j.title}</p>
                        <p className="mt-1 text-[13px] leading-relaxed text-[var(--muted)]">{j.goal}</p>
                        <div className="mt-2 flex flex-wrap items-center gap-2">
                          <Badge tone="neutral"><Clock3 size={11} /> ~{j.estMinutes} min</Badge>
                          <Badge tone="neutral">{j.steps.length} steps</Badge>
                          <span className="text-[11.5px] text-[var(--faint)]">replaces {j.legacyFields} fields</span>
                        </div>
                      </div>
                      <ArrowRight size={17} className="shrink-0 text-[var(--faint)]" />
                    </Card>
                  ))}
                </div>
              )}
            </section>

            {cases.length > 0 && (
              <section className="mb-9">
                <SectionTitle>Your cases with {s.shortName}</SectionTitle>
                <div className="grid gap-2.5">
                  {cases.map((c) => (
                    <Card key={c.id} as={Link} href={`/cases/${c.id}`} interactive className="p-4">
                      <div className="mb-3 flex items-center gap-3">
                        <p className="min-w-0 flex-1 truncate text-[14.5px] font-medium">{c.title}</p>
                        <span className="mono shrink-0 text-[11.5px] text-[var(--faint)]">{c.id}</span>
                      </div>
                      <ProgressRail steps={c.states} current={c.stateIndex} />
                    </Card>
                  ))}
                </div>
              </section>
            )}

            {notes.length > 0 && (
              <section>
                <SectionTitle>Recent from this department</SectionTitle>
                <Card className="divide-y divide-[var(--line-2)]">
                  {notes.map((n) => (
                    <div key={n.id} className="p-3.5">
                      <p className="text-[13.5px] font-medium">{n.title}</p>
                      <p className="mt-0.5 text-[12.5px] leading-relaxed text-[var(--muted)]">{n.body}</p>
                    </div>
                  ))}
                </Card>
              </section>
            )}
          </div>

          {/* The infrastructure argument, per department */}
          <aside className="grid content-start gap-3">
            <Card className="p-4">
              <p className="mb-2.5 flex items-center gap-1.5 text-[13.5px] font-semibold text-[var(--ink)]">
                <Database size={13} /> Owned by this department
              </p>
              <ul className="grid gap-1.5">
                {s.owns.map((o) => (
                  <li key={o} className="text-[13px] text-[var(--ink-2)]">{o}</li>
                ))}
              </ul>
              <p className="mt-3 border-t border-[var(--line-2)] pt-3 text-[12.5px] leading-relaxed text-[var(--muted)]">
                Gov.in does not copy this data. It requests it, with a purpose, when you allow it.
              </p>
            </Card>

            <Card className="p-4">
              <p className="mb-2.5 flex items-center gap-1.5 text-[13.5px] font-semibold text-[var(--ink)]">
                <Puzzle size={13} /> Shared infrastructure it uses
              </p>
              <div className="flex flex-wrap gap-1.5">
                {s.consumes.map((c) => (
                  <Badge key={c} tone="neutral">{c}</Badge>
                ))}
              </div>
            </Card>

            <Card className="p-4">
              <p className="mb-2 flex items-center gap-1.5 text-[13.5px] font-semibold text-[var(--ink)]">
                <Layers size={13} /> Migration position
              </p>
              <Badge tone={s.integration === "native" ? "ok" : s.integration === "adapter" ? "info" : "warn"}>
                {s.integration === "native" ? "Native on Gov.in" : s.integration === "adapter" ? "Adapter layer" : "Legacy API"}
              </Badge>
              <p className="mt-2.5 text-[12.5px] leading-relaxed text-[var(--muted)]">{s.migrationNote}</p>
            </Card>

            {creds.length > 0 && (
              <Card className="p-4">
                <p className="mb-2.5 text-[13.5px] font-semibold text-[var(--ink)]">
                  Your credentials here
                </p>
                <div className="grid gap-2.5">
                  {creds.map((c) => (
                    <div key={c.id} className="flex items-baseline justify-between gap-3">
                      <span className="text-[13px] text-[var(--ink-2)]">{c.title}</span>
                      <span className="mono text-[12px] text-[var(--muted)]">{c.number}</span>
                    </div>
                  ))}
                </div>
              </Card>
            )}
          </aside>
        </div>
      </Page>
    </ServiceTheme>
  );
}
