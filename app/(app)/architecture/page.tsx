"use client";

import { Page, PageHead } from "@/components/shell/AppShell";
import { Badge, Button, Card, SectionTitle, ServiceMark } from "@/components/ui/primitives";
import { SERVICES } from "@/lib/data/services";
import { LEGACY_DECISIONS, LEGACY_KNOWN, LEGACY_TOTAL } from "@/lib/data/legacy";

const COMPARE: { axis: string; umang: string; govin: string }[] = [
  { axis: "Relationship", umang: "One app that links out to many services", govin: "One identity that every service is built on" },
  { axis: "Identity", umang: "Each service still authenticates you separately", govin: "Authenticate once; departments receive scoped assertions" },
  { axis: "Data", umang: "Each department keeps its own copy of you", govin: "Departments own their domain; the profile is requested, not duplicated" },
  { axis: "Navigation", umang: "You browse the government's org chart", govin: "You state a goal; the engine finds the journey" },
  { axis: "Composition", umang: "Services cannot be combined", govin: "A journey can span four departments and stay one experience" },
  { axis: "Tracking", umang: "Status lives inside each service", govin: "Every submission is a case in one history" },
  { axis: "Posture", umang: "Waits to be opened", govin: "Surfaces what is expiring, then asks before acting" },
];

const PHASES = [
  { n: 1, title: "Adapters", body: "Legacy portals stay running. Gov.in reads and writes through adapters, so citizens get one front door before any department rewrites anything.", state: "Where every service starts" },
  { n: 2, title: "Native journeys", body: "New citizen journeys are authored on shared primitives - identity, consent, cases, notifications. The legacy system becomes a data store, not a website.", state: "Passport, Transport, RTI, Cyber Crime here" },
  { n: 3, title: "Primitive migration", body: "Departments retire their own auth, their own form engine, their own status page. They keep their register, their rules and their officers.", state: "Income Tax, GST, EPFO, MCA in progress" },
  { n: 4, title: "Portal retirement", body: "The old citizen-facing portal is switched off. The department did not disappear - its front door did.", state: "The point of the exercise" },
];

export default function ArchitecturePage() {
  return (
    <Page wide>
      <PageHead
        eyebrow={<Badge tone="accent">For anyone asking how this would actually work</Badge>}
        title="Gov.in is a layer, not a portal"
        sub="India's public services are not badly built. They are separately built. Every department independently solved identity, forms, status tracking, notifications and support - so a citizen has to solve integration by hand, eleven times."
      />

      <Card className="mb-8 flex flex-wrap items-center gap-4 border-[var(--accent-line)] bg-[var(--accent-soft)] p-5">
        <div className="min-w-0 flex-1">
          <p className="text-[15px] font-medium">The argument in one screen</p>
          <p className="mt-1 max-w-[74ch] text-[13.5px] leading-relaxed text-[var(--ink-2)]">
            One passport renewal, side by side: {LEGACY_TOTAL} fields today, {LEGACY_KNOWN} of which government
            already holds, against the {LEGACY_DECISIONS} decisions only the citizen can actually make.
          </p>
        </div>
        <Button href="/before" className="shrink-0">
          See the comparison
        </Button>
      </Card>

      <section className="mb-12">
        <SectionTitle>The stack</SectionTitle>
        <Card className="overflow-x-auto p-5 sm:p-7">
          <Diagram />
        </Card>
        <p className="mt-3 max-w-[80ch] text-[13.5px] leading-relaxed text-[var(--muted)]">
          Reading downward: the citizen meets one surface. Intent resolves deterministically when possible and through
          the AI layer only when genuinely ambiguous. Journeys are configuration, executed by one engine, which calls
          into department domains that keep owning their data. Everything a department does emits an event, and events
          become cases, inbox items and timeline entries - automatically, for every department, without any of them
          building a notification system.
        </p>
      </section>

      <section className="mb-12 grid gap-3 lg:grid-cols-3">
        {[
          {
            t: "Deterministic first",
            b: "If you name a service, no model is involved. The AI layer exists for ambiguity, composition and explanation - not as a toll booth in front of navigation. The interface tells you which one happened, every time.",
          },
          {
            t: "Grounded, never generative about government",
            b: "The model may only return identifiers that already exist in the service and journey registries. Anything else is discarded and the deterministic engine answers instead. It can compose capabilities; it cannot invent one.",
          },
          {
            t: "Consent is per-attribute, per-purpose",
            b: "Signing in grants nothing. Each department asks for one attribute, states why, and it lands in a ledger you can read and revoke. Purpose limitation is enforced by infrastructure rather than trusted to each department.",
          },
        ].map((x) => (
          <Card key={x.t} className="p-5">
            <p className="mb-2 text-[15px] font-medium">{x.t}</p>
            <p className="text-[13.5px] leading-relaxed text-[var(--muted)]">{x.b}</p>
          </Card>
        ))}
      </section>

      <section className="mb-12">
        <SectionTitle>Why this is not UMANG</SectionTitle>
        <p className="mb-4 max-w-[80ch] text-[13.5px] leading-relaxed text-[var(--muted)]">
          UMANG proved citizens want one front door, and it is genuinely useful. But aggregation puts a shared surface
          on top of unshared systems. The fragmentation is still there, one layer down, and the citizen still pays for
          it. The difference is architectural, not visual.
        </p>
        <Card className="overflow-x-auto">
          <table className="w-full min-w-[640px] border-collapse text-left">
            <thead>
              <tr className="border-b border-[var(--line)]">
                <th className="w-[130px] px-4 py-3 text-[12px] font-semibold uppercase tracking-[0.08em] text-[var(--muted)]"> </th>
                <th className="px-4 py-3 text-[12px] font-semibold uppercase tracking-[0.08em] text-[var(--muted)]">Aggregation</th>
                <th className="px-4 py-3 text-[12px] font-semibold uppercase tracking-[0.08em] text-[var(--accent)]">Shared infrastructure</th>
              </tr>
            </thead>
            <tbody>
              {COMPARE.map((r) => (
                <tr key={r.axis} className="border-b border-[var(--line-2)] last:border-0">
                  <td className="px-4 py-3 text-[13px] font-medium text-[var(--ink-2)]">{r.axis}</td>
                  <td className="px-4 py-3 text-[13.5px] leading-relaxed text-[var(--muted)]">{r.umang}</td>
                  <td className="px-4 py-3 text-[13.5px] leading-relaxed text-[var(--ink)]">{r.govin}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      </section>

      <section className="mb-12">
        <SectionTitle>How you get there without switching anything off</SectionTitle>
        <div className="grid gap-2.5 sm:grid-cols-2 lg:grid-cols-4">
          {PHASES.map((p) => (
            <Card key={p.n} className="flex flex-col p-4">
              <span className="mb-2.5 grid h-7 w-7 place-items-center rounded-full bg-[var(--accent-soft)] text-[12.5px] font-semibold text-[var(--accent)]">
                {p.n}
              </span>
              <p className="text-[14.5px] font-medium">{p.title}</p>
              <p className="mt-1.5 flex-1 text-[13px] leading-relaxed text-[var(--muted)]">{p.body}</p>
              <p className="mt-3 border-t border-[var(--line-2)] pt-2.5 text-[11.5px] text-[var(--faint)]">{p.state}</p>
            </Card>
          ))}
        </div>
        <p className="mt-3 max-w-[80ch] text-[13.5px] leading-relaxed text-[var(--muted)]">
          Adapters are the migration mechanism, not the destination. A design that stops at adapters permanently
          preserves the fragmentation it was meant to hide.
        </p>
      </section>

      <section className="mb-12">
        <SectionTitle>Where the ten sit today</SectionTitle>
        <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
          {SERVICES.map((s) => (
            <Card key={s.id} className="flex items-center gap-3 p-3.5">
              <ServiceMark id={s.id} size={30} />
              <div className="min-w-0 flex-1">
                <p className="truncate text-[13.5px] font-medium">{s.shortName}</p>
                <p className="truncate text-[11.5px] text-[var(--muted)]">{s.owns[0]}</p>
              </div>
              <Badge tone={s.integration === "native" ? "ok" : s.integration === "adapter" ? "info" : "warn"}>
                {s.integration === "native" ? "Phase 2" : s.integration === "adapter" ? "Phase 1–3" : "Phase 1"}
              </Badge>
            </Card>
          ))}
        </div>
      </section>

      <section>
        <SectionTitle>What this prototype actually is</SectionTitle>
        <Card className="p-5">
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <p className="mb-2 text-[13px] font-semibold text-[var(--ok)]">Real in this build</p>
              <ul className="grid gap-1.5 text-[13.5px] leading-relaxed text-[var(--muted)]">
                <li>One journey engine rendering every journey from configuration</li>
                <li>A service registry that drives navigation, search and theming</li>
                <li>Deterministic intent routing, with a grounded model layer behind it</li>
                <li>Real state - submit something and the case, inbox and timeline all change</li>
                <li>A consent ledger written to by journeys and readable in the profile</li>
              </ul>
            </div>
            <div>
              <p className="mb-2 text-[13px] font-semibold text-[var(--muted)]">Deliberately simulated</p>
              <ul className="grid gap-1.5 text-[13.5px] leading-relaxed text-[var(--muted)]">
                <li>All citizen data is fictional. No real government system is touched.</li>
                <li>Department processing is a simulated event, not a real officer</li>
                <li>Payments and appointment inventory are mocked</li>
                <li>Identity assurance is asserted, not established</li>
              </ul>
              <p className="mt-3 text-[12.5px] leading-relaxed text-[var(--faint)]">
                The boundary matters. Everything above the department line is genuinely built; everything below it is
                the part that already exists in government and would be integrated, not rebuilt.
              </p>
            </div>
          </div>
        </Card>
      </section>
    </Page>
  );
}

/* The diagram is hand-drawn SVG so it stays legible in both themes
   and does not ship a charting library for one picture. */
function Diagram() {
  const box = (x: number, y: number, w: number, h: number, label: string, sub?: string, tone: "core" | "dept" | "sub" = "core") => (
    <g key={label + x + y}>
      <rect
        x={x} y={y} width={w} height={h} rx={9}
        fill={tone === "core" ? "var(--accent-soft)" : tone === "dept" ? "var(--panel-2)" : "transparent"}
        stroke={tone === "core" ? "var(--accent-line)" : "var(--line)"}
        strokeWidth={1.2}
        strokeDasharray={tone === "sub" ? "4 3" : undefined}
      />
      <text x={x + w / 2} y={sub ? y + h / 2 - 3 : y + h / 2 + 4} textAnchor="middle"
        fontSize="12" fontWeight="500" fill="var(--ink)">{label}</text>
      {sub && (
        <text x={x + w / 2} y={y + h / 2 + 13} textAnchor="middle" fontSize="10" fill="var(--muted)">{sub}</text>
      )}
    </g>
  );

  const arrow = (x: number, y1: number, y2: number) => (
    <line key={`a${x}${y1}`} x1={x} y1={y1} x2={x} y2={y2} stroke="var(--line)" strokeWidth={1.4} markerEnd="url(#ar)" />
  );

  return (
    <svg viewBox="0 0 900 470" className="h-auto w-full min-w-[720px]" role="img" aria-label="Gov.in architecture: citizen, one surface, navigation engine, journey engine, department domains, event and case layer.">
      <defs>
        <marker id="ar" viewBox="0 0 8 8" refX="7" refY="4" markerWidth="6" markerHeight="6" orient="auto">
          <path d="M0 0 L8 4 L0 8 z" fill="var(--faint)" />
        </marker>
      </defs>

      {box(370, 8, 160, 34, "Citizen", undefined, "core")}
      {arrow(450, 42, 62)}

      {box(250, 62, 400, 44, "One surface", "intent, search, inbox, timeline, profile", "core")}
      {arrow(450, 106, 126)}

      {box(250, 126, 400, 44, "Navigation engine", "deterministic match first, AI layer only for ambiguity", "core")}
      {arrow(450, 170, 190)}

      {box(250, 190, 400, 44, "Journey engine", "journeys are configuration, not code", "core")}

      <line x1="450" y1="234" x2="450" y2="248" stroke="var(--line)" strokeWidth={1.4} />
      <line x1="110" y1="248" x2="790" y2="248" stroke="var(--line)" strokeWidth={1.4} />
      {[110, 246, 382, 518, 654, 790].map((x) => arrow(x, 248, 266))}

      <text x="30" y="252" fontSize="10" fill="var(--faint)">department line</text>

      {[
        ["Passport", "MEA"], ["Income Tax", "CBDT"], ["GST", "GSTN"],
        ["EPFO", "Labour"], ["Transport", "MoRTH"], ["+ 5 more", "one registry"],
      ].map(([n, d], i) => box(60 + i * 136, 266, 100, 44, n, d, "dept"))}

      {[110, 246, 382, 518, 654, 790].map((x) => arrow(x, 310, 330))}
      <line x1="110" y1="330" x2="790" y2="330" stroke="var(--line)" strokeWidth={1.4} />
      <line x1="450" y1="330" x2="450" y2="344" stroke="var(--line)" strokeWidth={1.4} markerEnd="url(#ar)" />

      {box(250, 348, 400, 44, "Events → cases → inbox → timeline", "no department builds this twice", "core")}

      {box(60, 408, 780, 46, "", undefined, "sub")}
      <text x="450" y="428" textAnchor="middle" fontSize="11" fontWeight="500" fill="var(--ink-2)">
        Identity, Authorization, Consent ledger, Policy, Audit, Service registry, Journey registry, AI gateway
      </text>
      <text x="450" y="444" textAnchor="middle" fontSize="10" fill="var(--muted)">
        Built once, at the infrastructure level. Accessibility and language live here too.
      </text>
    </svg>
  );
}
