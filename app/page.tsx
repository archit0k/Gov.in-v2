"use client";

import { useRouter } from "next/navigation";
import { ArrowDown, KeyRound, Network } from "lucide-react";
import { Badge, Button, ServiceMark, Title, Tricolour } from "@/components/ui/primitives";
import { Seal, Wordmark } from "@/components/shell/AppShell";
import { SERVICES } from "@/lib/data/services";
import { CITIZEN } from "@/lib/data/citizen";
import { LEGACY_KNOWN, LEGACY_TOTAL } from "@/lib/data/legacy";
import { useSession } from "@/lib/state/store";

/* ============================================================
   THE FRONT PAGE
   The argument, made structurally: ten separate cells above a
   line, one foundation below it. The tricolour rule is the only
   place the flag appears, and there is no emblem anywhere —
   this is an independent prototype, not an official product.
   ============================================================ */

const PRIMITIVES = [
  "Identity",
  "Consent",
  "Journeys",
  "Cases",
  "Notifications",
  "Service registry",
  "Audit",
  "AI gateway",
];

export default function Landing() {
  const router = useRouter();
  const { dispatch } = useSession();

  function enter() {
    dispatch({ type: "signIn" });
    router.push("/home");
  }

  return (
    <div className="min-h-dvh">
      <header className="bg-[var(--masthead)]">
        <div className="mx-auto flex max-w-[1240px] items-center gap-3 px-5 py-3.5 sm:px-8">
          <Seal onDark size={38} />
          <span className="flex flex-col leading-none">
            <Wordmark onDark />
            <span className="mt-1 text-[11px] text-[var(--masthead-muted)]">Shared citizen infrastructure</span>
          </span>
          <span className="ml-auto hidden text-[11.5px] text-[var(--masthead-muted)] sm:block">
            Independent hackathon prototype · fictional data
          </span>
        </div>
      </header>
      <Tricolour />

      <main id="main" className="mx-auto max-w-[1240px] px-5 py-12 sm:px-8 lg:py-16">
        <div className="grid gap-14 lg:grid-cols-[1.08fr_1fr] lg:gap-16">
          {/* ---------------- The argument ---------------- */}
          <div className="rise">
            <p className="label mb-4">The problem is architectural</p>

            <Title size="xl" className="max-w-[15ch]">
              You should not have to understand government to use it.
            </Title>

            <div className="mt-7 max-w-[56ch] space-y-4 text-[16px] leading-relaxed text-[var(--ink-2)]">
              <p>
                Renewing one passport asks <span className="tnum text-[var(--ink)]">{LEGACY_TOTAL}</span>{" "}
                questions. Government already knows the answer to{" "}
                <span className="tnum text-[var(--ink)]">{LEGACY_KNOWN}</span> of them — it just holds them in
                eleven different systems, behind eleven different logins.
              </p>
              <p>
                India&apos;s public services are not badly built. They are <em>separately</em> built. Every
                department solved identity, forms, status and notifications on its own, which leaves the citizen
                to be the integration layer.
              </p>
              <p className="text-[var(--ink)]">Gov.in is not an eleventh portal. It is the layer underneath.</p>
            </div>

            <div className="mt-9 flex flex-wrap items-center gap-3">
              <Button size="lg" onClick={enter}>
                <KeyRound size={16} /> Continue as demo citizen
              </Button>
              <Button size="lg" variant="secondary" href="/before">
                See what it replaces
              </Button>
              <Button size="lg" variant="ghost" href="/architecture">
                <Network size={15} /> How it works
              </Button>
            </div>

            <div className="mt-6 border-l-[3px] border-[var(--accent)] bg-[var(--panel)] py-3 pl-4 pr-3">
              <p className="max-w-[62ch] text-[13px] leading-relaxed text-[var(--muted)]">
                You will sign in as <span className="text-[var(--ink)]">{CITIZEN.name}</span> — an entirely
                fictional citizen with a passport expiring in 46 days, a stuck GST amendment, and provident fund
                sitting with a former employer. No account, no OTP, no password.
              </p>
            </div>
          </div>

          {/* ---------------- The same argument, drawn ---------------- */}
          <div className="rise" style={{ animationDelay: "90ms" }}>
            <p className="label mb-3">Today — ten services, ten relationships</p>

            <div className="grid grid-cols-2 gap-px border border-[var(--line)] bg-[var(--line)] sm:grid-cols-5 lg:grid-cols-2">
              {SERVICES.map((s, i) => (
                <div
                  key={s.id}
                  className="rise flex items-center gap-2.5 bg-[var(--panel)] px-3 py-2.5"
                  style={{ animationDelay: `${140 + i * 40}ms` }}
                >
                  <ServiceMark id={s.id} size={26} />
                  <span className="min-w-0">
                    <span className="block truncate text-[12.5px] font-medium leading-tight">{s.shortName}</span>
                    <span className="block truncate text-[10.5px] text-[var(--faint)]">Separate login</span>
                  </span>
                </div>
              ))}
            </div>

            <div className="my-5 flex flex-col items-center gap-1.5">
              <ArrowDown size={16} className="text-[var(--faint)]" />
              <span className="label">One layer underneath</span>
            </div>

            <div className="rise border border-[var(--line)] bg-[var(--panel)]" style={{ animationDelay: "620ms" }}>
              <div className="flex items-center gap-3 border-b border-[var(--line)] px-4 py-3.5">
                <Seal size={36} />
                <div className="min-w-0">
                  <Wordmark />
                  <p className="text-[12px] text-[var(--muted)]">
                    One identity · one front door · one case history
                  </p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-px bg-[var(--line)] sm:grid-cols-4">
                {PRIMITIVES.map((x) => (
                  <div key={x} className="bg-[var(--panel-2)] px-3 py-2.5 text-[11.5px] text-[var(--ink-2)]">
                    {x}
                  </div>
                ))}
              </div>
              <p className="border-t border-[var(--line)] px-4 py-3 text-[12px] leading-relaxed text-[var(--muted)]">
                Built once, at the bottom. Departments keep their own data, rules, officers and brand — and stop
                rebuilding the same eight things.
              </p>
            </div>
          </div>
        </div>
      </main>

      <footer className="border-t border-[var(--line)]">
        <div className="mx-auto flex max-w-[1240px] flex-wrap items-center gap-3 px-5 py-5 sm:px-8">
          <Badge tone="warn">Prototype</Badge>
          <p className="max-w-[80ch] text-[12px] leading-relaxed text-[var(--muted)]">
            An independent build for Build What Moves India. Not affiliated with, endorsed by, or connected to
            any government body. No live government system is touched, and every citizen record here is invented.
          </p>
        </div>
      </footer>
    </div>
  );
}
