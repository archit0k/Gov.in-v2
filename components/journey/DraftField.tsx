"use client";

import { useState } from "react";
import { Check, PenLine, Sparkles } from "lucide-react";
import { Button, cn } from "@/components/ui/primitives";
import type { FieldDef } from "@/lib/types";

/* ============================================================
   AI where it earns its place.
   RTI requests are rejected on wording, not on substance. This
   rewrites how you asked, never what you asked, and shows you
   both so the choice stays yours.
   ============================================================ */

export function DraftField({
  f,
  value,
  onChange,
  journeyId,
  stepId,
}: {
  f: FieldDef;
  value: string;
  onChange: (v: string) => void;
  journeyId: string;
  stepId: string;
}) {
  const [busy, setBusy] = useState(false);
  const [suggestion, setSuggestion] = useState<{ draft: string; changed: string; source: string } | null>(null);

  async function improve() {
    setBusy(true);
    setSuggestion(null);
    try {
      const r = await fetch("/api/draft", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: value, journeyId, stepId }),
      });
      const d = await r.json();
      if (d.draft) setSuggestion(d);
    } catch {
      /* silent — the citizen's own wording is always a valid submission */
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="px-5 py-4 sm:px-6">
      <label className="mb-1.5 block text-[13.5px] font-medium" htmlFor={f.id}>
        {f.label}
      </label>
      {f.help && <p className="mb-2 max-w-[64ch] text-[12.5px] leading-relaxed text-[var(--muted)]">{f.help}</p>}

      <textarea
        id={f.id}
        rows={5}
        value={value}
        placeholder={f.placeholder}
        onChange={(e) => onChange(e.target.value)}
        className="w-full resize-y rounded-[10px] border border-[var(--line)] bg-[var(--panel)] px-3.5 py-2.5 text-[14px] leading-relaxed outline-none transition-colors placeholder:text-[var(--faint)] focus:border-[var(--accent)]"
      />

      <div className="mt-2 flex flex-wrap items-center gap-2.5">
        <Button size="sm" variant="secondary" onClick={improve} disabled={busy || value.trim().length < 3}>
          {busy ? (
            <>
              <span className="h-1.5 w-1.5 animate-[pulse-soft_0.9s_infinite] rounded-full bg-[var(--accent)]" />
              Rewording
            </>
          ) : (
            <>
              <Sparkles size={13} /> Put this in the wording the officer needs
            </>
          )}
        </Button>
        <span className="text-[12px] text-[var(--muted)]">
          Optional. Your own words are a valid application.
        </span>
      </div>

      {suggestion && (
        <div className="fade mt-3 rounded-[12px] border border-[var(--accent-line)] bg-[var(--accent-soft)] p-3.5">
          <div className="mb-2 flex flex-wrap items-center gap-2">
            <span className="flex items-center gap-1.5 text-[12px] font-medium text-[var(--accent)]">
              <PenLine size={12} /> Suggested wording
            </span>
            <span className="text-[11.5px] text-[var(--muted)]">
              {suggestion.source === "model" ? "drafted by the AI layer" : "standard statutory template"}
            </span>
          </div>
          <pre className="mb-3 whitespace-pre-wrap font-sans text-[13.5px] leading-relaxed text-[var(--ink)]">
            {suggestion.draft}
          </pre>
          <p className="mb-3 border-t border-[var(--accent-line)] pt-2.5 text-[12.5px] leading-relaxed text-[var(--ink-2)]">
            {suggestion.changed} Nothing was added to what you asked for.
          </p>
          <div className="flex flex-wrap gap-2">
            <Button
              size="sm"
              onClick={() => {
                onChange(suggestion.draft);
                setSuggestion(null);
              }}
            >
              <Check size={13} /> Use this
            </Button>
            <Button size="sm" variant="ghost" onClick={() => setSuggestion(null)}>
              Keep mine
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

export function draftFieldClass(active: boolean) {
  return cn(active && "border-[var(--accent)]");
}
