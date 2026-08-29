"use client";

import { useParams } from "next/navigation";
import { useEffect, useMemo, useRef } from "react";
import { Layers } from "lucide-react";
import { Page } from "@/components/shell/AppShell";
import { Button, Card, EmptyState } from "@/components/ui/primitives";
import { JourneyRunner } from "@/components/journey/JourneyRunner";
import { JOURNEY_MAP } from "@/lib/data/journeys";
import { lifeEventById } from "@/lib/ai/engine";
import { useSession } from "@/lib/state/store";

export default function JourneyPage() {
  const { id } = useParams<{ id: string }>();
  const { state, dispatch, ready } = useSession();

  // A composed journey may exist only in this citizen's session. If a judge
  // deep-links to one, rebuild it from the same registry the engine used.
  const j = useMemo(() => {
    if (JOURNEY_MAP[id]) return JOURNEY_MAP[id];
    const inSession = state.composed.find((c) => c.id === id);
    if (inSession) return inSession;
    if (id.startsWith("composed-")) return lifeEventById(id.replace("composed-", ""));
    return undefined;
  }, [id, state.composed]);

  // Start a draft once. Without the guard, submitting (which clears the draft)
  // would immediately re-create it and bounce the citizen back to step one.
  const started = useRef<string | null>(null);
  useEffect(() => {
    if (j && started.current !== j.id) {
      started.current = j.id;
      dispatch({ type: "startJourney", journeyId: j.id });
    }
  }, [j, dispatch]);

  if (!ready) return null;

  if (!j) {
    return (
      <Page>
        <EmptyState
          title="No such journey"
          body="This journey is not in the registry. Rather than improvise one, we would rather say so."
          action={<Button href="/journeys">All journeys</Button>}
        />
      </Page>
    );
  }

  return (
    <>
      {j.ephemeral && (
        <div className="border-b border-[var(--accent-line)] bg-[var(--accent-soft)]">
          <div className="mx-auto flex max-w-[760px] items-start gap-3 px-5 py-4 sm:px-8">
            <Layers size={17} className="mt-0.5 shrink-0 text-[var(--accent)]" />
            <div>
              <p className="text-[13.5px] font-medium text-[var(--ink)]">
                This journey was composed for you. It is not a government service.
              </p>
              <p className="mt-1 max-w-[74ch] text-[13px] leading-relaxed text-[var(--ink-2)]">
                {j.provenance} Each step below maps to a capability that already exists. If enough citizens need this
                same sequence, it is surfaced to the departments involved as a candidate for a permanent journey.
              </p>
            </div>
          </div>
        </div>
      )}
      <JourneyRunner journey={j} />
      {j.ephemeral && (
        <div className="mx-auto w-full max-w-[760px] px-5 pb-12 sm:px-8">
          <Card className="p-4">
            <p className="text-[13.5px] font-semibold text-[var(--ink)]">Journey learning loop</p>
            <p className="mt-2 max-w-[76ch] text-[13px] leading-relaxed text-[var(--ink-2)]">
              Composed journeys are counted, never published automatically. When the same composition recurs across
              many citizens, it appears in a department dashboard as evidence that a service is missing. The AI
              identifies the gap; people decide whether to close it.
            </p>
          </Card>
        </div>
      )}
    </>
  );
}
