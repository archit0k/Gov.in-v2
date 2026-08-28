"use client";

import { useRouter } from "next/navigation";
import { useRef, useState } from "react";
import Link from "next/link";
import { ArrowRight, CornerDownLeft, Layers, Search, Sparkles, Zap } from "lucide-react";
import { Badge, Card, ServiceMark, cn } from "@/components/ui/primitives";
import { useSession } from "@/lib/state/store";
import type { NavResult } from "@/lib/types";

/* ============================================================
   THE FRONT DOOR
   One input. Not "ask AI" — a navigation surface. It resolves
   deterministically when it can, and only reaches the model when
   the request is genuinely ambiguous. The badge tells you which
   happened, every time.
   ============================================================ */

const EXAMPLES = [
  "renew my passport",
  "I am moving to Bangalore next month",
  "someone took ₹48,000 from my UPI",
  "my PF is stuck with my old company",
  "I want to ask why a road project stalled",
];

export function IntentBar({ autoFocus, compact }: { autoFocus?: boolean; compact?: boolean }) {
  const [q, setQ] = useState("");
  const [busy, setBusy] = useState(false);
  const [res, setRes] = useState<NavResult | null>(null);
  const router = useRouter();
  const { dispatch } = useSession();
  const inputRef = useRef<HTMLInputElement>(null);

  async function run(text: string) {
    const query = text.trim();
    if (!query) return;
    setBusy(true);
    setRes(null);
    dispatch({ type: "recordIntent", text: query });
    try {
      const r = await fetch("/api/navigate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query }),
      });
      const data: NavResult = await r.json();
      if (data.composed) dispatch({ type: "addComposed", journey: data.composed });
      setRes(data);
      // A confident, unambiguous match should not make the citizen click twice.
      if (data.mode === "deterministic" && data.confidence >= 0.85 && data.primary) {
        setTimeout(() => router.push(data.primary!.href), 620);
      }
    } catch {
      setRes({
        mode: "clarify",
        reading: "We could not reach the navigation service. Your request was not lost.",
        confidence: 0,
        source: "engine",
        clarify: { question: "Try one of these", options: [{ label: "Browse all services", href: "/services" }] },
      });
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="w-full">
      <form
        onSubmit={(e) => {
          e.preventDefault();
          run(q);
        }}
        className={cn(
          "group relative flex items-center gap-3 rounded-[14px] border bg-[var(--panel)] px-4 transition-all duration-200",
          compact ? "h-12" : "h-[58px]",
          busy ? "border-[var(--accent)] shadow-[0_0_0_4px_var(--accent-soft)]" : "border-[var(--line)] focus-within:border-[var(--accent)] focus-within:shadow-[0_0_0_4px_var(--accent-soft)]",
        )}
      >
        <Search size={compact ? 17 : 19} className="shrink-0 text-[var(--faint)]" strokeWidth={1.9} />
        <input
          ref={inputRef}
          value={q}
          autoFocus={autoFocus}
          onChange={(e) => setQ(e.target.value)}
          placeholder="What do you need to do?"
          aria-label="What do you need to do?"
          className={cn(
            "min-w-0 flex-1 bg-transparent text-[var(--ink)] outline-none placeholder:text-[var(--faint)]",
            compact ? "text-[14.5px]" : "text-[16.5px]",
          )}
        />
        {q && !busy && (
          <kbd className="hidden shrink-0 items-center gap-1 rounded-[6px] border border-[var(--line)] px-1.5 py-1 text-[10.5px] text-[var(--muted)] sm:flex">
            <CornerDownLeft size={11} /> Enter
          </kbd>
        )}
        {busy && (
          <span className="flex shrink-0 items-center gap-2 text-[12.5px] text-[var(--muted)]">
            <span className="h-1.5 w-1.5 animate-[pulse-soft_1s_infinite] rounded-full bg-[var(--accent)]" />
            Understanding your request
          </span>
        )}
      </form>

      {!res && !busy && (
        <div className="mt-3 flex flex-wrap gap-1.5">
          {EXAMPLES.map((e) => (
            <button
              key={e}
              onClick={() => {
                setQ(e);
                run(e);
              }}
              className="rounded-full border border-[var(--line)] bg-[var(--panel)] px-3 py-1.5 text-[12.5px] text-[var(--ink-2)] transition-colors hover:border-[var(--accent-line)] hover:bg-[var(--accent-soft)] hover:text-[var(--accent)]"
            >
              {e}
            </button>
          ))}
        </div>
      )}

      {res && <Result res={res} onClear={() => { setRes(null); setQ(""); inputRef.current?.focus(); }} />}
    </div>
  );
}

function Result({ res, onClear }: { res: NavResult; onClear: () => void }) {
  return (
    <div className="rise mt-3">
      <Card className="overflow-hidden">
        <div className="flex flex-wrap items-center gap-2 border-b border-[var(--line-2)] bg-[var(--panel-2)] px-4 py-2.5">
          {res.mode === "deterministic" && (
            <Badge tone="ok"><Zap size={11} strokeWidth={2.4} /> Deterministic match</Badge>
          )}
          {res.mode === "composed" && (
            <Badge tone="accent"><Layers size={11} strokeWidth={2.4} /> Composed journey</Badge>
          )}
          {res.mode === "clarify" && <Badge tone="warn">Needs one clarification</Badge>}
          {res.mode === "informational" && <Badge tone="info">Answer</Badge>}
          <span className="text-[12.5px] text-[var(--muted)]">
            {res.source === "model" ? "resolved by the AI layer" : "resolved by the navigation engine — no model call"}
          </span>
          <button onClick={onClear} className="ml-auto text-[12px] text-[var(--faint)] hover:text-[var(--ink)]">
            Clear
          </button>
        </div>

        <div className="p-4">
          <p className="mb-3.5 text-[14px] leading-relaxed text-[var(--ink-2)]">{res.reading}</p>

          {res.answer && (
            <p className="mb-3.5 rounded-[10px] border border-[var(--line)] bg-[var(--panel-2)] p-3.5 text-[14px] leading-relaxed">
              {res.answer}
            </p>
          )}

          {res.primary && (
            <Link
              href={res.primary.href}
              className="flex items-center gap-3 rounded-[12px] border border-[var(--accent-line)] bg-[var(--accent-soft)] p-3.5 transition-all hover:shadow-[var(--shadow-2)]"
            >
              {res.primary.serviceId ? (
                <ServiceMark id={res.primary.serviceId} size={38} />
              ) : (
                <span className="grid h-[38px] w-[38px] shrink-0 place-items-center rounded-[10px] bg-[var(--accent)] text-[var(--accent-ink)]">
                  <Sparkles size={18} strokeWidth={1.9} />
                </span>
              )}
              <span className="min-w-0 flex-1">
                <span className="block truncate text-[15px] font-medium text-[var(--ink)]">{res.primary.label}</span>
                <span className="block truncate text-[12.5px] text-[var(--muted)]">{res.primary.sublabel}</span>
              </span>
              <ArrowRight size={17} className="shrink-0 text-[var(--accent)]" />
            </Link>
          )}

          {res.composed && (
            <ul className="mt-3 grid gap-1.5">
              {res.composed.steps.map((s, i) => (
                <li key={s.id} className="flex items-center gap-2.5 rounded-[9px] border border-[var(--line)] px-3 py-2 text-[13px]">
                  <span className="tnum w-4 shrink-0 text-[11.5px] text-[var(--faint)]">{i + 1}</span>
                  <span className="truncate text-[var(--ink)]">{s.title}</span>
                  <span className="ml-auto truncate text-[11.5px] text-[var(--muted)]">{s.fields[0]?.label}</span>
                </li>
              ))}
            </ul>
          )}

          {res.clarify && (
            <div className="grid gap-1.5">
              <p className="mb-1 text-[13px] font-medium">{res.clarify.question}</p>
              {res.clarify.options.map((o) => (
                <Link
                  key={o.href + o.label}
                  href={o.href}
                  className="flex items-center gap-2 rounded-[10px] border border-[var(--line)] px-3.5 py-2.5 text-[14px] transition-colors hover:border-[var(--accent-line)] hover:bg-[var(--accent-soft)]"
                >
                  {o.label}
                  <ArrowRight size={15} className="ml-auto text-[var(--faint)]" />
                </Link>
              ))}
            </div>
          )}

          {res.alternatives && res.alternatives.length > 0 && (
            <div className="mt-3 border-t border-[var(--line-2)] pt-3">
              <p className="mb-2 text-[11.5px] uppercase tracking-wider text-[var(--faint)]">Or did you mean</p>
              <div className="grid gap-1">
                {res.alternatives.map((a) => (
                  <Link
                    key={a.href}
                    href={a.href}
                    className="flex items-center gap-2.5 rounded-[9px] px-2 py-1.5 text-[13.5px] transition-colors hover:bg-[var(--line-2)]"
                  >
                    <ServiceMark id={a.serviceId} size={24} />
                    <span className="truncate">{a.label}</span>
                    <span className="ml-auto shrink-0 text-[11.5px] text-[var(--muted)]">{a.sublabel}</span>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>
      </Card>
    </div>
  );
}
