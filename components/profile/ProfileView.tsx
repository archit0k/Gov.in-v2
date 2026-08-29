"use client";

import Link from "next/link";
import { useState } from "react";
import { Fingerprint, IdCard, KeyRound, Languages, Users } from "lucide-react";
import { Page, PageHead } from "@/components/shell/AppShell";
import { Badge, Card, Kv, SectionTitle, ServiceMark, SourceTag, cn, fmtDateTime } from "@/components/ui/primitives";
import { CITIZEN, daysUntil, formatDate } from "@/lib/data/citizen";
import { service } from "@/lib/data/services";
import { useSession } from "@/lib/state/store";

type Tab = "identity" | "credentials" | "relationships" | "permissions";

const TABS: { id: Tab; label: string; href: string }[] = [
  { id: "identity", label: "Identity", href: "/profile" },
  { id: "credentials", label: "Credentials", href: "/profile/credentials" },
  { id: "relationships", label: "Relationships", href: "/profile/relationships" },
  { id: "permissions", label: "Permissions", href: "/profile/permissions" },
];

export function ProfileView({ initial = "identity" }: { initial?: Tab }) {
  const [tab, setTab] = useState<Tab>(initial);
  const { state } = useSession();
  const c = CITIZEN;

  return (
    <Page>
      <PageHead
        eyebrow={
          <div className="flex items-center gap-3">
            <span className="grid h-11 w-11 place-items-center rounded-full bg-[var(--accent)] text-[15px] font-semibold text-[var(--accent-ink)]">
              {c.photoInitials}
            </span>
            <div>
              <p className="text-[15px] font-medium leading-tight">{c.name}</p>
              <p className="text-[12.5px] text-[var(--muted)]">Gov.in identity · {c.id}</p>
            </div>
          </div>
        }
        title="Your government identity"
        sub="One profile. Departments read from it with your permission instead of each keeping their own stale copy."
      />

      <nav className="mb-6 flex flex-wrap gap-1.5">
        {TABS.map((t) => (
          <Link
            key={t.id}
            href={t.href}
            onClick={(e) => {
              e.preventDefault();
              setTab(t.id);
              window.history.replaceState(null, "", t.href);
            }}
            className={cn(
              "rounded-full border px-3.5 py-1.5 text-[13px] transition-colors",
              tab === t.id
                ? "border-[var(--accent)] bg-[var(--accent-soft)] text-[var(--accent)]"
                : "border-[var(--line)] text-[var(--ink-2)] hover:border-[var(--faint)]",
            )}
          >
            {t.label}
          </Link>
        ))}
      </nav>

      {tab === "identity" && (
        <div className="grid gap-3">
          <Card className="p-5">
            <p className="mb-1 flex items-center gap-2 text-[13.5px] font-semibold text-[var(--ink)]">
              <Fingerprint size={13} /> Verified identity
            </p>
            <dl className="grid gap-x-8 divide-y divide-[var(--line-2)] sm:grid-cols-2 sm:divide-y-0">
              <Kv k="Full name" v={c.name} source="Verified in person, 2021" />
              <Kv k="Date of birth" v={formatDate(c.dob)} source="Verified government profile" />
              <Kv k="Phone" v={c.phone} source="Verified by OTP" />
              <Kv k="Email" v={c.email} source="Verified by link" />
            </dl>
            <div className="mt-3 flex flex-wrap items-center gap-2 border-t border-[var(--line-2)] pt-3">
              <Badge tone="ok">High assurance</Badge>
              <span className="text-[12.5px] text-[var(--muted)]">
                Established {formatDate(c.verifiedOn)}. This is why journeys can skip document uploads.
              </span>
            </div>
          </Card>

          <Card className="p-5">
            <SectionTitle>Addresses</SectionTitle>
            <div className="grid gap-3 sm:grid-cols-2">
              {c.addresses.map((a) => (
                <div key={a.id} className="rounded-[var(--r-md)] border border-[var(--line)] p-3.5">
                  <div className="mb-1.5 flex items-center gap-2">
                    <p className="text-[13px] font-medium capitalize">{a.label} address</p>
                    <Badge tone="ok">verified</Badge>
                  </div>
                  <p className="text-[13.5px] leading-relaxed text-[var(--ink-2)]">
                    {a.line1}
                    {a.line2 ? `, ${a.line2}` : ""}
                    <br />
                    {a.city}, {a.state} {a.pin}
                  </p>
                  <SourceTag label={`${a.source} · updated ${formatDate(a.updatedAt)}`} className="mt-2" />
                </div>
              ))}
            </div>
          </Card>

          <Card className="p-5">
            <p className="mb-2 flex items-center gap-2 text-[13.5px] font-semibold text-[var(--ink)]">
              <Languages size={13} /> Preferences
            </p>
            <div className="flex flex-wrap items-center gap-2">
              {c.languages.map((l) => (
                <Badge key={l} tone={l === "English" ? "accent" : "neutral"}>{l}</Badge>
              ))}
              <span className="text-[12.5px] text-[var(--muted)]">
                Language is an infrastructure setting, so every department inherits it. No department opts out of it.
              </span>
            </div>
          </Card>
        </div>
      )}

      {tab === "credentials" && (
        <div className="grid gap-2.5">
          <p className="mb-1 max-w-[76ch] text-[13.5px] leading-relaxed text-[var(--muted)]">
            Each credential is owned by the department that issued it. Gov.in holds a reference and the expiry, which
            is how it can warn you before something lapses.
          </p>
          {c.credentials.map((k) => {
            const days = k.expiresOn ? daysUntil(k.expiresOn) : null;
            return (
              <Card key={k.id} className="flex flex-wrap items-start gap-3.5 p-4">
                <ServiceMark id={k.serviceId} size={36} />
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="text-[14.5px] font-medium">{k.title}</p>
                    {k.status === "expiring" && <Badge tone="warn">expires in {days} days</Badge>}
                    {k.status === "active" && <Badge tone="ok">active</Badge>}
                  </div>
                  <p className="mono mt-0.5 text-[12.5px] text-[var(--muted)]">{k.number}</p>
                  <p className="mt-1 text-[12px] text-[var(--faint)]">
                    {k.issuer}
                    {k.expiresOn ? ` · valid to ${formatDate(k.expiresOn)}` : ""}
                  </p>
                  {k.meta && (
                    <div className="mt-2 flex flex-wrap gap-x-5 gap-y-1">
                      {Object.entries(k.meta).map(([mk, mv]) => (
                        <span key={mk} className="text-[12px] text-[var(--muted)]">
                          {mk}: <span className="text-[var(--ink-2)]">{mv}</span>
                        </span>
                      ))}
                    </div>
                  )}
                </div>
                <Link href={`/services/${k.serviceId}`} className="shrink-0 text-[12.5px] text-[var(--accent)] hover:underline">
                  {service(k.serviceId).shortName}
                </Link>
              </Card>
            );
          })}
        </div>
      )}

      {tab === "relationships" && (
        <div className="grid gap-3">
          <p className="max-w-[76ch] text-[13.5px] leading-relaxed text-[var(--muted)]">
            The citizen graph is why a passport application does not ask for your father&apos;s place of birth again.
            Existence of a relationship, access to its data, and consent to share it are three separate things.
          </p>
          <div className="grid gap-2.5 sm:grid-cols-2">
            {c.relationships.map((r) => (
              <Card key={r.id} className="p-4">
                <div className="mb-2 flex items-center gap-2.5">
                  <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-[var(--line-2)] text-[var(--muted)]">
                    <Users size={16} />
                  </span>
                  <div className="min-w-0">
                    <p className="truncate text-[14.5px] font-medium leading-tight">{r.name}</p>
                    <p className="text-[12px] capitalize text-[var(--muted)]">{r.relation}</p>
                  </div>
                  <Badge tone="ok" className="ml-auto">verified</Badge>
                </div>
                <dl className="grid gap-1 border-t border-[var(--line-2)] pt-2.5">
                  {Object.entries(r.attributes).map(([k2, v]) => (
                    <div key={k2} className="flex flex-wrap items-baseline justify-between gap-x-4">
                      <dt className="text-[12px] text-[var(--muted)]">{k2}</dt>
                      <dd className="text-[12.5px] text-[var(--ink-2)]">{v}</dd>
                    </div>
                  ))}
                </dl>
                <div className="mt-2.5 flex flex-wrap items-center gap-1.5 border-t border-[var(--line-2)] pt-2.5">
                  <span className="text-[11.5px] text-[var(--muted)]">Visible to</span>
                  {r.sharesWith.map((s) => (
                    <Badge key={s} tone="neutral">{service(s).shortName}</Badge>
                  ))}
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}

      {tab === "permissions" && (
        <div className="grid gap-3">
          <Card className="p-5">
            <p className="mb-1.5 flex items-center gap-2 text-[13.5px] font-semibold text-[var(--ink)]">
              <KeyRound size={13} /> Consent ledger
            </p>
            <p className="max-w-[76ch] text-[13.5px] leading-relaxed text-[var(--muted)]">
              Being signed in does not give any department access to anything. Each grant below is one attribute, for
              one stated purpose, and you can withdraw it.
            </p>
          </Card>
          {state.consents.map((g) => (
            <Card key={g.id} className="flex flex-wrap items-start gap-3.5 p-4">
              <ServiceMark id={g.requestedBy as never} size={34} />
              <div className="min-w-0 flex-1">
                <p className="text-[14px] font-medium leading-snug">{g.attribute}</p>
                <p className="mt-1 text-[13px] leading-relaxed text-[var(--muted)]">{g.purpose}</p>
                <p className="mt-1.5 text-[11.5px] text-[var(--faint)]">
                  {service(g.requestedBy as never).name}, granted {fmtDateTime(g.grantedAt)}. {g.retention}
                </p>
              </div>
              <button className="shrink-0 rounded-[var(--r-sm)] border border-[var(--line)] px-2.5 py-1.5 text-[12px] text-[var(--muted)] transition-colors hover:border-[var(--danger)] hover:text-[var(--danger)]">
                Withdraw
              </button>
            </Card>
          ))}
          <Card className="p-4">
            <p className="flex items-center gap-2 text-[13px] text-[var(--muted)]">
              <IdCard size={14} /> Every access is logged, including the ones you never approved because they were
              never requested.
            </p>
          </Card>
        </div>
      )}
    </Page>
  );
}
