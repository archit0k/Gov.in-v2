"use client";

import Link from "next/link";
import { useParams, useSearchParams } from "next/navigation";
import { Suspense } from "react";
import { CheckCircle2, FastForward, LifeBuoy, MessageSquareWarning } from "lucide-react";
import { Page } from "@/components/shell/AppShell";
import { Badge, Button, Card, EmptyState, ProgressRail, SectionTitle, ServiceMark, ServiceTheme, fmtDateTime } from "@/components/ui/primitives";
import { service } from "@/lib/data/services";
import { useSession } from "@/lib/state/store";

const ACTOR: Record<string, { label: string; tone: "accent" | "neutral" | "info" }> = {
  citizen: { label: "You", tone: "accent" },
  department: { label: "Department", tone: "info" },
  system: { label: "Infrastructure", tone: "neutral" },
};

function CaseView() {
  const { id } = useParams<{ id: string }>();
  const params = useSearchParams();
  const isNew = params.get("new") === "1";
  const { state, dispatch, journey, ready } = useSession();

  const c = state.cases.find((x) => x.id === id);
  if (!ready) return null;

  if (!c) {
    return (
      <Page>
        <EmptyState title="Case not found" body="This case is not in your record." action={<Button href="/home">Go home</Button>} />
      </Page>
    );
  }

  const svc = service(c.serviceId);
  const j = journey(c.journeyId);
  const done = c.stateIndex >= c.states.length - 1;

  return (
    <ServiceTheme id={c.serviceId}>
      <Page wide>
        {isNew && (
          <Card className="rise mb-6 flex flex-wrap items-center gap-3.5 border-[var(--ok)] bg-[var(--ok-soft)] p-4">
            <CheckCircle2 size={20} className="shrink-0 text-[var(--ok)]" />
            <div className="min-w-0 flex-1">
              <p className="text-[15px] font-medium text-[var(--ink)]">Submitted to {svc.department}.</p>
              <p className="mt-0.5 text-[13.5px] leading-relaxed text-[var(--ink-2)]">
                You will not have to log in anywhere else to find out what happens next. Every update lands in your
                inbox with this case attached.
              </p>
            </div>
          </Card>
        )}

        <header className="mb-7 flex flex-wrap items-start gap-4">
          <ServiceMark id={c.serviceId} size={46} />
          <div className="min-w-0 flex-1">
            <h1 className="text-[24px] font-semibold leading-tight tracking-[-0.02em]">{c.title}</h1>
            <p className="mono mt-1 text-[12.5px] text-[var(--muted)]">
              {c.id} · {svc.name}
            </p>
            <p className="mt-0.5 text-[12.5px] text-[var(--muted)]">
              Opened {fmtDateTime(c.openedAt)}
            </p>
          </div>
          <Badge tone={c.status === "action-needed" ? "danger" : done ? "ok" : "info"} className="mt-1.5">
            {c.states[c.stateIndex]}
          </Badge>
        </header>

        <Card className="mb-6 p-5">
          <ProgressRail steps={c.states} current={c.stateIndex} />
          <p className="mt-4 text-[14.5px] leading-relaxed text-[var(--ink-2)]">{c.statusLine}</p>
          {!done && (
            <div className="mt-4 flex flex-wrap items-center gap-2.5 border-t border-[var(--line-2)] pt-4">
              <Button size="sm" variant="secondary" onClick={() => dispatch({ type: "advanceCase", caseId: c.id })}>
                <FastForward size={14} /> Simulate department update
              </Button>
              <span className="text-[12px] text-[var(--muted)]">
                Demo control - in production this is a department event arriving on the event bus.
              </span>
            </div>
          )}
        </Card>

        <div className="grid gap-8 lg:grid-cols-[1.2fr_1fr]">
          <section>
            <SectionTitle>History</SectionTitle>
            <ol className="relative border-l border-[var(--line)] pl-5">
              {[...c.events].reverse().map((e, i) => (
                <li key={e.at + i} className="relative pb-5 last:pb-0">
                  <span
                    className="absolute -left-[27px] top-1 h-2.5 w-2.5 rounded-full border-2 border-[var(--panel)]"
                    style={{ background: i === 0 ? "var(--accent)" : "var(--line)" }}
                  />
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="text-[14px] font-medium">{e.label}</p>
                    <Badge tone={ACTOR[e.actor].tone}>{ACTOR[e.actor].label}</Badge>
                  </div>
                  {e.detail && <p className="mt-1 text-[13px] leading-relaxed text-[var(--muted)]">{e.detail}</p>}
                  <p className="mt-1 text-[11.5px] text-[var(--faint)]">{fmtDateTime(e.at)}</p>
                </li>
              ))}
            </ol>
          </section>

          <aside className="grid content-start gap-3">
            <Card className="p-4">
              <p className="mb-3 text-[13.5px] font-semibold text-[var(--ink)]">
                What was submitted
              </p>
              <dl className="grid gap-2.5">
                {Object.entries(c.data).length === 0 ? (
                  <p className="text-[13px] text-[var(--muted)]">Nothing beyond your verified profile.</p>
                ) : (
                  Object.entries(c.data)
                    .slice(0, 8)
                    .map(([k, v]) => (
                      <div key={k} className="flex flex-wrap items-baseline justify-between gap-x-4">
                        <dt className="text-[12.5px] capitalize text-[var(--muted)]">{k.replace(/-/g, " ")}</dt>
                        <dd className="text-[13px] text-[var(--ink)]">{String(v)}</dd>
                      </div>
                    ))
                )}
              </dl>
            </Card>

            {j && (
              <Card className="p-4">
                <p className="mb-2 text-[13.5px] font-semibold text-[var(--ink)]">Journey</p>
                <Link href={`/journeys/${j.id}`} className="text-[14px] text-[var(--accent)] hover:underline">
                  {j.title}
                </Link>
                <p className="mt-1.5 text-[12.5px] leading-relaxed text-[var(--muted)]">
                  Replaced {j.legacyEquivalent}.
                </p>
              </Card>
            )}

            <Card className="p-4">
              <p className="mb-2 flex items-center gap-1.5 text-[13.5px] font-semibold text-[var(--ink)]">
                <LifeBuoy size={13} /> If this stalls
              </p>
              <p className="mb-3 text-[13px] leading-relaxed text-[var(--muted)]">
                A grievance filed from here carries the case, the department, the officer and the whole history with
                it. You will not have to explain any of it again.
              </p>
              <Button href="/journeys/cpgrams-grievance" variant="secondary" size="sm">
                <MessageSquareWarning size={14} /> Raise a grievance about this case
              </Button>
            </Card>
          </aside>
        </div>
      </Page>
    </ServiceTheme>
  );
}

export default function CasePage() {
  return (
    <Suspense fallback={null}>
      <CaseView />
    </Suspense>
  );
}
