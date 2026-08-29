"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { ArrowLeft, Check, X } from "lucide-react";
import { Badge, ServiceMark, cn } from "@/components/ui/primitives";
import { service } from "@/lib/data/services";
import { useSession } from "@/lib/state/store";

/* ============================================================
   THE JOURNEY RAIL

   Infrastructure, not chrome. A department does not implement
   this, style it, or opt out of it - it is handed down the same
   way identity and consent are, which is the entire claim the
   product makes.

   Two forms. On the infrastructure's own pages it is a slim bar,
   because the journey is the thing you are already looking at.
   Inside a department it moves to the side: stacking a third
   horizontal band above a department's masthead buries whose
   site you are on, and the side is where a persistent "you are
   part way through something" belongs anyway.
   ============================================================ */

function useActiveJourney() {
  const { state, journey, ready } = useSession();
  const active = state.activeJourney;
  const j = active ? journey(active.journeyId) : undefined;
  if (!ready || !active || !j) return null;
  const draft = state.drafts[j.id];
  return { j, stepIndex: draft?.stepIndex ?? 0 };
}

export function JourneyRail({ variant = "bar" }: { variant?: "bar" | "side" }) {
  const data = useActiveJourney();
  const path = usePathname();

  // On the journey's own screen the runner already shows all of this.
  if (!data || path === `/journeys/${data.j.id}`) return null;

  return variant === "side" ? <SideRail {...data} /> : <BarRail {...data} />;
}

/* ---------------- Bar, for the infrastructure's own pages ---------------- */

function BarRail({ j, stepIndex }: { j: NonNullable<ReturnType<typeof useActiveJourney>>["j"]; stepIndex: number }) {
  const step = j.steps[stepIndex];
  return (
    <div className="border-b border-[var(--accent-line)] bg-[var(--accent-soft)]">
      <div className="mx-auto flex max-w-[1180px] flex-wrap items-center gap-x-4 gap-y-2 px-5 py-2.5 sm:px-8">
        <ServiceMark id={j.serviceId} size={26} />
        <div className="min-w-0">
          <p className="text-[13px] font-medium leading-tight">{j.title}</p>
          <p className="text-[11.5px] leading-tight text-[var(--muted)]">
            Step {stepIndex + 1} of {j.steps.length}
            {step ? `, ${step.title.toLowerCase()}` : ""}
          </p>
        </div>
        <div className="ml-auto">
          <Link
            href={`/journeys/${j.id}`}
            className="flex items-center gap-1.5 rounded-[var(--r-sm)] px-2.5 py-1.5 text-[12.5px] text-[var(--accent)] transition-colors hover:bg-[var(--panel)]"
          >
            <ArrowLeft size={13} /> Back to the journey
          </Link>
        </div>
      </div>
    </div>
  );
}

/* ---------------- Side, for a department's own site ---------------- */

function SideRail({ j, stepIndex }: { j: NonNullable<ReturnType<typeof useActiveJourney>>["j"]; stepIndex: number }) {
  const { dispatch } = useSession();
  const router = useRouter();
  const svc = service(j.serviceId);

  return (
    <>
      {/* Desktop: a column beside the department's work */}
      <aside className="sticky top-6 hidden self-start lg:block" aria-label="Journey progress">
        <div className="rounded-[var(--r-lg)] border border-[var(--accent-line)] bg-[var(--accent-soft)] p-4">
          <p className="text-[11.5px] font-medium text-[var(--accent)]">You are part way through</p>
          <p className="mt-1 text-[15px] font-semibold leading-snug">{j.title}</p>
          <p className="mt-1 text-[12px] text-[var(--muted)]">
            Step {stepIndex + 1} of {j.steps.length}
          </p>

          <ol className="mt-4 grid gap-0.5">
            {j.steps.map((s, i) => {
              const done = i < stepIndex;
              const now = i === stepIndex;
              return (
                <li key={s.id} className="flex items-start gap-2.5 py-1.5">
                  <span
                    className={cn(
                      "mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-full text-[10px] font-semibold",
                      done && "bg-[var(--accent)] text-white",
                      now && "bg-[var(--accent)] text-white ring-4 ring-[var(--panel)]",
                      !done && !now && "border border-[var(--accent-line)] bg-[var(--panel)] text-[var(--muted)]",
                    )}
                  >
                    {done ? <Check size={11} strokeWidth={3} /> : i + 1}
                  </span>
                  <span
                    className={cn(
                      "text-[13px] leading-snug",
                      now ? "font-semibold text-[var(--ink)]" : done ? "text-[var(--ink-2)]" : "text-[var(--muted)]",
                    )}
                  >
                    {s.title}
                    {now && (
                      <span className="mt-0.5 block text-[11.5px] font-normal text-[var(--muted)]">
                        Happening on {svc.shortName}
                      </span>
                    )}
                  </span>
                </li>
              );
            })}
          </ol>

          <div className="mt-4 grid gap-1 border-t border-[var(--accent-line)] pt-3">
            <Link
              href={`/journeys/${j.id}`}
              className="flex items-center gap-1.5 rounded-[var(--r-sm)] px-2 py-1.5 text-[12.5px] text-[var(--accent)] transition-colors hover:bg-[var(--panel)]"
            >
              <ArrowLeft size={13} /> Back to the journey
            </Link>
            <button
              onClick={() => {
                dispatch({ type: "dropJourney" });
                router.push("/home");
              }}
              title="Stop carrying this journey. Nothing you have already done is lost."
              className="flex items-center gap-1.5 rounded-[var(--r-sm)] px-2 py-1.5 text-left text-[12.5px] text-[var(--muted)] transition-colors hover:bg-[var(--panel)] hover:text-[var(--ink)]"
            >
              <X size={13} /> Leave the journey
            </button>
          </div>
        </div>
      </aside>

      {/* Small screens have no room for a column, so it condenses */}
      <div className="mb-5 flex flex-wrap items-center gap-x-3 gap-y-1.5 rounded-[var(--r-md)] border border-[var(--accent-line)] bg-[var(--accent-soft)] px-3.5 py-2.5 lg:hidden">
        <Badge tone="accent">Step {stepIndex + 1} of {j.steps.length}</Badge>
        <p className="min-w-0 flex-1 truncate text-[13px] font-medium">{j.title}</p>
        <Link href={`/journeys/${j.id}`} className="text-[12.5px] text-[var(--accent)]">
          Journey
        </Link>
      </div>
    </>
  );
}

/**
 * What a department calls when it has finished its part. The journey advances
 * in place and the citizen continues, rather than being bounced back to the
 * start of anything.
 */
export function useJourneyStep() {
  const { state, dispatch, journey } = useSession();
  const router = useRouter();
  const active = state.activeJourney;
  const j = active ? journey(active.journeyId) : undefined;
  const draft = j ? state.drafts[j.id] : undefined;

  return {
    journey: j,
    stepIndex: draft?.stepIndex ?? 0,
    /** Record this step's result and move the journey on. */
    complete(fieldId: string, value: string) {
      if (!j) return;
      const i = draft?.stepIndex ?? 0;
      dispatch({ type: "setField", journeyId: j.id, fieldId, value });
      if (i < j.steps.length - 1) {
        dispatch({ type: "setStep", journeyId: j.id, stepIndex: i + 1 });
      }
      router.push(`/journeys/${j.id}`);
    },
  };
}

/** True when a journey is being carried, so a shell can make room for the rail. */
export function useCarryingJourney() {
  const { state, journey, ready } = useSession();
  const path = usePathname();
  const active = state.activeJourney;
  const j = active ? journey(active.journeyId) : undefined;
  if (!ready || !j) return false;
  return path !== `/journeys/${j.id}`;
}
