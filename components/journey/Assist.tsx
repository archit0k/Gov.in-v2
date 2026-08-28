"use client";

import { useState } from "react";
import { AlertTriangle, Sparkles } from "lucide-react";
import { cn } from "@/components/ui/primitives";

/* ============================================================
   CONTEXTUAL ASSIST
   Not a chatbot. It only appears where a step admits it may be
   confusing, it only knows about this step, and it says so when
   it is not sure.
   ============================================================ */

export function Assist({
  journeyId,
  stepId,
  prompts,
}: {
  journeyId: string;
  stepId: string;
  prompts: string[];
}) {
  const [asked, setAsked] = useState<string | null>(null);
  const [answer, setAnswer] = useState<{ text: string; certain: boolean } | null>(null);
  const [busy, setBusy] = useState(false);
  const [custom, setCustom] = useState("");

  async function ask(question: string) {
    setAsked(question);
    setAnswer(null);
    setBusy(true);
    try {
      const r = await fetch("/api/assist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question, journeyId, stepId }),
      });
      const d = await r.json();
      setAnswer({ text: d.answer, certain: d.certain !== false });
    } catch {
      setAnswer({
        text: "We could not reach the assistance service just now. Nothing you entered was lost — you can continue without it.",
        certain: false,
      });
    } finally {
      setBusy(false);
    }
  }

  return (
    <section className="mt-5 rounded-[14px] border border-[var(--line)] bg-[var(--panel-2)] p-4">
      <div className="mb-2.5 flex items-center gap-2">
        <Sparkles size={14} className="text-[var(--accent)]" strokeWidth={2} />
        <span className="text-[12.5px] font-medium text-[var(--ink-2)]">Not sure about this step?</span>
        <span className="ml-auto text-[11.5px] text-[var(--faint)]">Answers are limited to this journey</span>
      </div>

      <div className="flex flex-wrap gap-1.5">
        {prompts.map((p) => (
          <button
            key={p}
            onClick={() => ask(p)}
            className={cn(
              "rounded-full border px-3 py-1.5 text-[12.5px] transition-colors",
              asked === p
                ? "border-[var(--accent)] bg-[var(--accent-soft)] text-[var(--accent)]"
                : "border-[var(--line)] bg-[var(--panel)] text-[var(--ink-2)] hover:border-[var(--accent-line)] hover:text-[var(--accent)]",
            )}
          >
            {p}
          </button>
        ))}
      </div>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          if (custom.trim()) ask(custom.trim());
        }}
        className="mt-2.5"
      >
        <input
          value={custom}
          onChange={(e) => setCustom(e.target.value)}
          placeholder="Or ask your own question about this step"
          className="w-full rounded-[9px] border border-[var(--line)] bg-[var(--panel)] px-3 py-2 text-[13px] outline-none transition-colors placeholder:text-[var(--faint)] focus:border-[var(--accent)]"
        />
      </form>

      {(busy || answer) && (
        <div className="fade mt-3 rounded-[10px] border border-[var(--line)] bg-[var(--panel)] p-3.5">
          {busy ? (
            <div className="flex items-center gap-2 text-[13px] text-[var(--muted)]">
              <span className="h-1.5 w-1.5 animate-[pulse-soft_0.9s_infinite] rounded-full bg-[var(--accent)]" />
              Checking what this department actually requires
            </div>
          ) : (
            <>
              <p className="text-[13.5px] leading-relaxed text-[var(--ink-2)]">{answer!.text}</p>
              {!answer!.certain && (
                <p className="mt-2.5 flex items-start gap-1.5 text-[12px] leading-relaxed text-[var(--warn)]">
                  <AlertTriangle size={12} className="mt-0.5 shrink-0" />
                  Not fully certain. Nothing here overrides what the department tells you, and this gap is logged so
                  the journey can be improved.
                </p>
              )}
            </>
          )}
        </div>
      )}
    </section>
  );
}
