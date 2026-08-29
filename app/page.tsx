"use client";

import { useRouter } from "next/navigation";
import { ArrowRight, KeyRound, Network, ShieldCheck } from "lucide-react";
import { Badge, Button, ServiceMark, cn } from "@/components/ui/primitives";
import { Wordmark, ThemeToggle } from "@/components/shell/AppShell";
import { SERVICES } from "@/lib/data/services";
import { CITIZEN } from "@/lib/data/citizen";
import { useSession } from "@/lib/state/store";

export default function Landing() {
  const router = useRouter();
  const { dispatch } = useSession();

  function enter() {
    dispatch({ type: "signIn" });
    router.push("/home");
  }

  return (
    <div className="min-h-dvh">
      <header className="mx-auto flex max-w-[1180px] items-center gap-3 px-5 py-5 sm:px-8">
        <span className="grid h-8 w-8 place-items-center rounded-[9px] bg-[var(--accent)] text-[var(--accent-ink)]">
          <ShieldCheck size={17} strokeWidth={2.2} />
        </span>
        <Wordmark />
        <Badge tone="warn" className="ml-1">Hackathon prototype · fictional data</Badge>
        <div className="ml-auto flex items-center gap-1">
          <Button href="/architecture" variant="ghost" size="sm">
            <Network size={14} /> How this works
          </Button>
          <ThemeToggle />
        </div>
      </header>

      <main id="main" className="mx-auto grid max-w-[1180px] gap-14 px-5 pb-20 pt-6 sm:px-8 lg:grid-cols-[1.05fr_1fr] lg:gap-16 lg:pt-16">
        <div className="rise">
          <p className="mb-4 text-[13px] font-medium uppercase tracking-[0.13em] text-[var(--muted)]">
            Shared citizen infrastructure
          </p>
          <h1 className="max-w-[16ch] text-[40px] font-semibold leading-[1.08] tracking-[-0.035em] text-[var(--ink)] sm:text-[52px]">
            You should not have to understand government to use it.
          </h1>
          <p className="mt-6 max-w-[54ch] text-[16px] leading-relaxed text-[var(--ink-2)]">
            India has world-class public digital services. It has ten of them, and each was built as if it were the
            only one. Ten logins, ten interfaces, ten places to be told your application is
            <span className="text-[var(--ink)]"> pending</span>.
          </p>
          <p className="mt-4 max-w-[54ch] text-[16px] leading-relaxed text-[var(--ink-2)]">
            Gov.in is not an eleventh portal. It is the layer underneath: one verified identity, one front door, one
            case history — while every department keeps owning its own data, rules and brand.
          </p>

          <div className="mt-9 flex flex-wrap items-center gap-3">
            <Button size="lg" onClick={enter}>
              <KeyRound size={16} /> Continue as demo citizen
            </Button>
            <Button size="lg" variant="secondary" href="/before">
              See what it replaces
            </Button>
            <Button size="lg" variant="ghost" href="/case">
              Read the case
            </Button>
          </div>

          <div className="mt-5 flex items-center gap-3 rounded-[12px] border border-[var(--line)] bg-[var(--panel)] p-3.5">
            <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-[var(--accent)] text-[12px] font-semibold text-[var(--accent-ink)]">
              {CITIZEN.photoInitials}
            </span>
            <p className="text-[13px] leading-relaxed text-[var(--muted)]">
              You will sign in as <span className="text-[var(--ink)]">{CITIZEN.name}</span> — an entirely fictional
              citizen with a passport expiring in 46 days, a stuck GST amendment and PF sitting with an old employer.
              No account, no OTP.
            </p>
          </div>
        </div>

        {/* The problem, shown rather than described */}
        <div className="rise" style={{ animationDelay: "90ms" }}>
          <p className="mb-3 text-[12px] font-medium uppercase tracking-[0.1em] text-[var(--faint)]">
            Today — ten services, ten relationships
          </p>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-2">
            {SERVICES.map((s, i) => (
              <div
                key={s.id}
                className={cn(
                  "rise rounded-[11px] border border-[var(--line)] bg-[var(--panel)] p-3 opacity-[0.86]",
                  i % 3 === 0 && "translate-y-1",
                  i % 4 === 1 && "-translate-y-1",
                )}
                style={{ animationDelay: `${120 + i * 35}ms` }}
              >
                <ServiceMark id={s.id} size={26} />
                <p className="mt-2 truncate text-[12.5px] font-medium leading-tight">{s.shortName}</p>
                <p className="mt-1 truncate text-[10.5px] text-[var(--faint)]">Separate login</p>
              </div>
            ))}
          </div>

          <div className="my-4 flex items-center gap-3">
            <span className="h-px flex-1 bg-[var(--line)]" />
            <ArrowRight size={16} className="rotate-90 text-[var(--faint)]" />
            <span className="h-px flex-1 bg-[var(--line)]" />
          </div>

          <div
            className="rise rounded-[14px] border p-4"
            style={{ animationDelay: "560ms", background: "var(--accent-soft)", borderColor: "var(--accent-line)" }}
          >
            <div className="flex items-center gap-3">
              <span className="grid h-10 w-10 place-items-center rounded-[10px] bg-[var(--accent)] text-[var(--accent-ink)]">
                <ShieldCheck size={20} strokeWidth={2.1} />
              </span>
              <div>
                <Wordmark />
                <p className="text-[12.5px] text-[var(--muted)]">One identity. Ten departments. Same infrastructure.</p>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
