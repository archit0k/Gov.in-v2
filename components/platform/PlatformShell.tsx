"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ArrowLeft, ShieldCheck } from "lucide-react";
import { Badge, ServiceMark, ServiceTheme, cn } from "@/components/ui/primitives";
import { IntentBar } from "@/components/shell/IntentBar";
import { JourneyRail } from "@/components/journey/JourneyRail";
import { ThemeToggle } from "@/components/shell/AppShell";
import { CITIZEN } from "@/lib/data/citizen";
import { service } from "@/lib/data/services";
import type { ServiceId } from "@/lib/types";

/* ============================================================
   DEPARTMENT PLATFORM SHELL
   A department gets its own site: its own domain, its own
   colour, its own navigation, its own vocabulary. What it does
   not get is its own login, its own idea of a case, or its own
   search box built from scratch — the strip along the top is the
   proof, and it is deliberately impossible to miss.

   Note what is absent: no AI mode. A department inherits the
   navigation surface, scoped to its own journeys. Conversation
   belongs to the infrastructure, where it can see across
   departments; a chatbot per department is the fragmentation we
   are arguing against, wearing a friendlier face.
   ============================================================ */

export interface PlatformNavItem {
  href: string;
  label: string;
}

export function PlatformShell({
  id,
  nav,
  searchPlaceholder,
  searchExamples,
  children,
}: {
  id: ServiceId;
  nav: PlatformNavItem[];
  searchPlaceholder: string;
  searchExamples: string[];
  children: React.ReactNode;
}) {
  const s = service(id);
  const path = usePathname();

  return (
    <ServiceTheme id={id} className="min-h-dvh bg-[var(--surface)]">
      {/* Handed down by the infrastructure. A department does not implement
          this, restyle it, or opt out of it. */}
      <JourneyRail inService />

      {/* The infrastructure strip. Different site, same citizen. */}
      <div className="border-b border-[var(--line)] bg-[var(--panel-2)]">
        <div className="mx-auto flex max-w-[1180px] flex-wrap items-center gap-x-3 gap-y-1.5 px-5 py-2 sm:px-8">
          <Link
            href="/home"
            className="flex items-center gap-1.5 text-[12px] text-[var(--muted)] transition-colors hover:text-[var(--ink)]"
          >
            <ArrowLeft size={12} /> Gov.in
          </Link>
          <span className="text-[var(--line)]">|</span>
          <span className="mono text-[12px] text-[var(--muted)]">{s.subdomain}</span>
          <div className="ml-auto flex items-center gap-2.5">
            <span className="hidden items-center gap-1.5 text-[12px] text-[var(--muted)] sm:flex">
              <ShieldCheck size={12} className="text-[var(--ok)]" />
              Signed in as {CITIZEN.name} — no separate account for this department
            </span>
            <span className="flex items-center gap-1.5 text-[12px] text-[var(--muted)] sm:hidden">
              <ShieldCheck size={12} className="text-[var(--ok)]" /> {CITIZEN.photoInitials}
            </span>
            <ThemeToggle />
          </div>
        </div>
      </div>

      {/* The department's own masthead */}
      <header className="border-b border-[var(--line)] bg-[var(--panel)]">
        <div className="mx-auto max-w-[1180px] px-5 pt-5 sm:px-8">
          <div className="flex flex-wrap items-start gap-3.5">
            <ServiceMark id={id} size={46} />
            <div className="min-w-0 flex-1">
              <h1 className="text-[21px] font-semibold leading-tight tracking-[-0.02em]">{s.name}</h1>
              <p className="text-[12.5px] text-[var(--muted)]">{s.department}</p>
            </div>
            <Badge tone="accent" className="mt-1 hidden sm:inline-flex">
              {s.integration === "native" ? "Native on Gov.in" : s.integration === "adapter" ? "Adapter layer" : "Legacy API"}
            </Badge>
          </div>

          <div className="mt-4 max-w-[560px]">
            <IntentBar scope={id} placeholder={searchPlaceholder} examples={searchExamples} />
          </div>

          <nav className="-mb-px mt-5 flex gap-1 overflow-x-auto">
            {nav.map((n) => {
              const active = path === n.href;
              return (
                <Link
                  key={n.href}
                  href={n.href}
                  className={cn(
                    "shrink-0 border-b-2 px-3 pb-2.5 pt-1 text-[14px] transition-colors",
                    active
                      ? "border-[var(--accent)] font-medium text-[var(--accent)]"
                      : "border-transparent text-[var(--ink-2)] hover:text-[var(--ink)]",
                  )}
                >
                  {n.label}
                </Link>
              );
            })}
          </nav>
        </div>
      </header>

      <main id="main" className="mx-auto w-full max-w-[1180px] px-5 py-8 sm:px-8">
        {children}
      </main>

      <footer className="border-t border-[var(--line)]">
        <div className="mx-auto max-w-[1180px] px-5 py-6 sm:px-8">
          <p className="mb-2.5 text-[11.5px] font-semibold uppercase tracking-[0.08em] text-[var(--muted)]">
            What this department did not have to build
          </p>
          <div className="flex flex-wrap gap-1.5">
            {s.consumes.map((c) => (
              <Badge key={c} tone="neutral">{c}</Badge>
            ))}
          </div>
          <p className="mt-3 max-w-[80ch] text-[12.5px] leading-relaxed text-[var(--muted)]">
            {s.department} owns {s.owns.join(", ").toLowerCase()}. Everything above came from the shared
            infrastructure, which is why signing in here was not a thing that happened.{" "}
            <Link href="/architecture" className="text-[var(--accent)] hover:underline">
              How this works
            </Link>
          </p>
        </div>
      </footer>
    </ServiceTheme>
  );
}

/* ---------------- Small shared building blocks ---------------- */

export function PanelTitle({ children, action }: { children: React.ReactNode; action?: React.ReactNode }) {
  return (
    <div className="mb-3 flex items-end justify-between gap-4">
      <h2 className="text-[15px] font-semibold tracking-[-0.01em] text-[var(--ink)]">{children}</h2>
      {action}
    </div>
  );
}

export function DataRow({ k, v, hint }: { k: string; v: React.ReactNode; hint?: string }) {
  return (
    <div className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-0.5 border-b border-[var(--line-2)] py-2.5 last:border-0">
      <dt className="text-[13px] text-[var(--muted)]">{k}</dt>
      <dd className="text-right text-[13.5px] text-[var(--ink)]">
        {v}
        {hint && <span className="block text-[11.5px] text-[var(--faint)]">{hint}</span>}
      </dd>
    </div>
  );
}
