"use client";

import Link from "next/link";
import { ArrowRight, ArrowUpRight, Check, Clock3, Sparkles } from "lucide-react";
import { Page } from "@/components/shell/AppShell";
import { IntentBar } from "@/components/shell/IntentBar";
import { Badge, Button, Card, EmptyState, ProgressRail, SectionTitle, ServiceMark, timeAgo } from "@/components/ui/primitives";
import { CITIZEN, daysUntil } from "@/lib/data/citizen";
import { SERVICES, service } from "@/lib/data/services";
import { useSession } from "@/lib/state/store";

export default function HomePage() {
  const { state, journey, ready } = useSession();
  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";

  const actions = state.inbox.filter((n) => n.category === "action" && !n.read);
  const drafts = Object.values(state.drafts);
  const openCases = state.cases.filter((c) => c.status !== "closed").slice(0, 3);
  const updates = state.inbox.filter((n) => n.category !== "action").slice(0, 4);

  return (
    <Page wide>
      <header className="mb-7">
        <h1 className="text-[28px] font-semibold tracking-[-0.025em] text-[var(--ink)]">
          {greeting}, {CITIZEN.shortName}.
        </h1>
        <p className="mt-1.5 text-[14.5px] text-[var(--muted)]">
          {actions.length > 0
            ? `${actions.length} ${actions.length === 1 ? "thing needs" : "things need"} your attention. Everything else is on track.`
            : "Nothing needs your attention right now."}
        </p>
      </header>

      <div className="mb-10">
        <IntentBar autoFocus />
      </div>

      {/* Needs your attention — actions, not a notification count */}
      {actions.length > 0 && (
        <section className="mb-10">
          <SectionTitle>Needs your attention</SectionTitle>
          <div className="grid gap-2.5">
            {actions.map((n, i) => (
              <Card key={n.id} interactive className="rise p-4" as="div">
                <div className="flex flex-wrap items-start gap-3.5" style={{ animationDelay: `${i * 60}ms` }}>
                  <ServiceMark id={n.serviceId} size={38} />
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="text-[15px] font-medium leading-snug">{n.title}</h3>
                      {n.dueLabel && (
                        <Badge tone={n.dueLabel === "Overdue" ? "danger" : "warn"}>
                          <Clock3 size={11} /> {n.dueLabel}
                        </Badge>
                      )}
                    </div>
                    <p className="mt-1 max-w-[70ch] text-[13.5px] leading-relaxed text-[var(--muted)]">{n.body}</p>
                  </div>
                  {n.action && (
                    <Button href={n.action.href} size="md" className="shrink-0">
                      {n.action.label} <ArrowRight size={15} />
                    </Button>
                  )}
                </div>
              </Card>
            ))}
          </div>
        </section>
      )}

      {/* Continue where you left off */}
      {ready && drafts.length > 0 && (
        <section className="mb-10">
          <SectionTitle>Continue where you left off</SectionTitle>
          <div className="grid gap-2.5 sm:grid-cols-2">
            {drafts.map((d) => {
              const j = journey(d.journeyId);
              if (!j) return null;
              return (
                <Card key={d.journeyId} interactive as={Link} className="block p-4" href={`/journeys/${j.id}`}>
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

      <div className="grid gap-10 lg:grid-cols-[1.15fr_1fr]">
        {/* Cases */}
        <section>
          <SectionTitle action={<Link href="/journeys" className="text-[12.5px] text-[var(--accent)] hover:underline">All journeys</Link>}>
            Your open cases
          </SectionTitle>
          {openCases.length === 0 ? (
            <EmptyState title="No open cases" body="When you submit anything to any department, it appears here as one trackable case." />
          ) : (
            <div className="grid gap-2.5">
              {openCases.map((c) => (
                <Card key={c.id} interactive as={Link} className="block p-4" href={`/cases/${c.id}`}>
                  <div className="mb-3 flex items-start gap-3">
                    <ServiceMark id={c.serviceId} size={32} />
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-[14.5px] font-medium leading-snug">{c.title}</p>
                      <p className="mono mt-0.5 text-[11.5px] text-[var(--faint)]">{c.id}</p>
                    </div>
                    <Badge tone={c.status === "action-needed" ? "danger" : c.status === "approved" ? "ok" : "info"}>
                      {c.states[c.stateIndex]}
                    </Badge>
                  </div>
                  <ProgressRail steps={c.states} current={c.stateIndex} />
                  <p className="mt-3 text-[13px] leading-relaxed text-[var(--muted)]">{c.statusLine}</p>
                </Card>
              ))}
            </div>
          )}
        </section>

        {/* Updates */}
        <section>
          <SectionTitle action={<Link href="/inbox" className="text-[12.5px] text-[var(--accent)] hover:underline">Inbox</Link>}>
            Government updates
          </SectionTitle>
          <Card className="divide-y divide-[var(--line-2)]">
            {updates.map((n) => (
              <Link key={n.id} href={n.action?.href ?? "/inbox"} className="flex gap-3 p-3.5 transition-colors hover:bg-[var(--panel-2)]">
                <ServiceMark id={n.serviceId} size={28} />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-[13.5px] font-medium leading-snug">{n.title}</p>
                  <p className="mt-0.5 line-clamp-2 text-[12.5px] leading-relaxed text-[var(--muted)]">{n.body}</p>
                  <p className="mt-1 text-[11px] text-[var(--faint)]">{timeAgo(n.at)}</p>
                </div>
              </Link>
            ))}
          </Card>
        </section>
      </div>

      {/* Services */}
      <section className="mt-10">
        <SectionTitle action={<Link href="/services" className="text-[12.5px] text-[var(--accent)] hover:underline">All services</Link>}>
          Departments on this infrastructure
        </SectionTitle>
        <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-3 lg:grid-cols-5">
          {SERVICES.slice(0, 10).map((s) => (
            <Card key={s.id} interactive as={Link} className="block p-3.5" href={`/services/${s.id}`}>
              <ServiceMark id={s.id} size={30} />
              <p className="mt-2.5 truncate text-[13.5px] font-medium leading-tight">{s.shortName}</p>
              <p className="mt-1 line-clamp-2 text-[11.5px] leading-snug text-[var(--muted)]">{s.citizenPurpose}</p>
            </Card>
          ))}
        </div>
      </section>

      {/* Proactive but not autonomous */}
      <section className="mt-10">
        <Card className="flex flex-wrap items-center gap-4 border-[var(--accent-line)] bg-[var(--accent-soft)] p-5">
          <Sparkles size={20} className="shrink-0 text-[var(--accent)]" />
          <div className="min-w-0 flex-1">
            <p className="text-[15px] font-medium">A new scheme may apply to your business</p>
            <p className="mt-1 max-w-[68ch] text-[13.5px] leading-relaxed text-[var(--ink-2)]">
              We noticed it exists. We have <span className="font-medium">not</span> checked whether you qualify — that
              needs your data and therefore your permission.
            </p>
          </div>
          <Button href="/schemes/medcs" className="shrink-0">
            Check eligibility <ArrowUpRight size={15} />
          </Button>
        </Card>
      </section>

      <p className="mt-8 flex items-center gap-1.5 text-[12px] text-[var(--faint)]">
        <Check size={12} /> Passport expires in {daysUntil(CITIZEN.credentials[0].expiresOn!)} days ·{" "}
        {service("gov-core").department}
      </p>
    </Page>
  );
}
