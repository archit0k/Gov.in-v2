"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
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

   It renders wherever the citizen is, including inside a
   department's own subdomain, so a journey never becomes "you
   were sent somewhere and came back". You can see, at every
   moment, which journey you are in, which step this screen is,
   and what is still ahead.
   ============================================================ */

export function JourneyRail({ inService }: { inService?: boolean }) {
  const { state, dispatch, journey, ready } = useSession();
  const router = useRouter();

  const active = state.activeJourney;
  const j = active ? journey(active.journeyId) : undefined;
  if (!ready || !active || !j) return null;

  const draft = state.drafts[j.id];
  const stepIndex = draft?.stepIndex ?? 0;
  const step = j.steps[stepIndex];
  const svc = service(j.serviceId);

  return (
    <div className="border-b border-[var(--accent-line)] bg-[var(--accent-soft)]">
      <div className="mx-auto flex max-w-[1240px] flex-wrap items-center gap-x-4 gap-y-2 px-5 py-2.5 sm:px-8">
        <ServiceMark id={j.serviceId} size={28} />

        <div className="min-w-0">
          <p className="text-[13px] font-medium leading-tight text-[var(--ink)]">{j.title}</p>
          <p className="text-[11.5px] leading-tight text-[var(--muted)]">
            Step {stepIndex + 1} of {j.steps.length}
            {step ? `, ${step.title.toLowerCase()}` : ""}
          </p>
        </div>

        {/* The whole path, so nothing about where this sits is a mystery */}
        <ol className="hidden items-center gap-1 lg:flex" aria-label="Journey progress">
          {j.steps.map((s, i) => (
            <li
              key={s.id}
              title={s.title}
              className={cn(
                "h-1.5 w-9 rounded-full transition-colors",
                i < stepIndex ? "bg-[var(--accent)]" : i === stepIndex ? "bg-[var(--accent)]" : "bg-[var(--accent-line)]",
                i === stepIndex && "ring-2 ring-[var(--accent)] ring-offset-2 ring-offset-[var(--accent-soft)]",
              )}
            />
          ))}
        </ol>

        {inService && (
          <Badge tone="accent" className="hidden sm:inline-flex">
            Running inside {svc.shortName}
          </Badge>
        )}

        <div className="ml-auto flex items-center gap-1">
          <Link
            href={`/journeys/${j.id}`}
            className="flex items-center gap-1.5 rounded-[var(--r-sm)] px-2.5 py-1.5 text-[12.5px] text-[var(--accent)] transition-colors hover:bg-[var(--panel)]"
          >
            <ArrowLeft size={13} /> Journey
          </Link>
          <button
            onClick={() => {
              dispatch({ type: "dropJourney" });
              router.push("/home");
            }}
            title="Stop carrying this journey. Nothing you have already done is lost."
            className="flex items-center gap-1.5 rounded-[var(--r-sm)] px-2.5 py-1.5 text-[12.5px] text-[var(--muted)] transition-colors hover:bg-[var(--panel)] hover:text-[var(--ink)]"
          >
            <X size={13} /> Leave
          </button>
        </div>
      </div>
    </div>
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

/** The completed marker a department shows once it has handed its result back. */
export function StepDone({ label }: { label: string }) {
  return (
    <span className="inline-flex items-center gap-1.5 text-[12.5px] font-medium text-[var(--ok)]">
      <Check size={13} strokeWidth={2.6} /> {label}
    </span>
  );
}
