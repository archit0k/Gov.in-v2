"use client";

import { useRouter } from "next/navigation";
import { useRef, useState } from "react";
import Link from "next/link";
import { ArrowRight, CornerDownLeft, Layers, Search, Sparkles, Zap } from "lucide-react";
import { Badge, Card, ServiceMark, cn } from "@/components/ui/primitives";
import { useSession } from "@/lib/state/store";
import type { NavResult, ServiceId } from "@/lib/types";

/* ============================================================
   THE FRONT DOOR
   One input. Not "ask AI" — a navigation surface. It resolves
   deterministically when it can, and only reaches the model when
   the request is genuinely ambiguous. The badge tells you which
   happened, every time.

   AI mode sits beside it rather than replacing it: when a need
   cannot be phrased as a task, the whole surface becomes a
   conversation. It exists only on the infrastructure's own front
   door — a department inherits the navigation surface, not a
   chat product.
   ============================================================ */

const EXAMPLES = [
  "renew my passport",
  "I am moving to Bangalore next month",
  "someone took ₹48,000 from my UPI",
  "my PF is stuck with my old company",
  "I want to ask why a road project stalled",
];

export function IntentBar({
  autoFocus,
  size = "md",
  aiMode = false,
  scope,
  examples,
  placeholder,
}: {
  autoFocus?: boolean;
  size?: "md" | "hero";
  /** Only the infrastructure front door offers AI mode. */
  aiMode?: boolean;
  /** Restrict results to one department's journeys. */
  scope?: ServiceId;
  examples?: string[];
  placeholder?: string;
}) {
  const [q, setQ] = useState("");
  const [busy, setBusy] = useState(false);
  const [res, setRes] = useState<NavResult | null>(null);
  const { dispatch } = useSession();
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const hero = size === "hero";
  const chips = examples ?? EXAMPLES;

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
        body: JSON.stringify({ query, scope }),
      });
      const data: NavResult = await r.json();
      if (data.composed) dispatch({ type: "addComposed", journey: data.composed });
      setRes(data);
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

  function toAi() {
    const seed = q.trim();
    router.push(seed ? `/ai?q=${encodeURIComponent(seed)}` : "/ai");
  }

  return (
    <div className="w-full">
      <form
        onSubmit={(e) => {
          e.preventDefault();
          run(q);
        }}
        className={cn(
          // The container carries the whole focus treatment: its border plus a
          // soft halo. The input inside must draw nothing of its own.
          "flex items-center gap-3 rounded-[14px] border bg-[var(--panel)] transition-all duration-150",
          hero ? "h-[62px] px-5" : "h-12 px-4",
          busy
            ? "border-[var(--accent)] ring-4 ring-[var(--accent-soft)]"
            : "border-[var(--line)] focus-within:border-[var(--accent)] focus-within:ring-4 focus-within:ring-[var(--accent-soft)]",
        )}
      >
        <Search size={hero ? 20 : 17} className="shrink-0 text-[var(--faint)]" strokeWidth={1.9} />
        <input
          ref={inputRef}
          value={q}
          autoFocus={autoFocus}
          onChange={(e) => setQ(e.target.value)}
          placeholder={placeholder ?? "What do you need to do?"}
          aria-label={placeholder ?? "What do you need to do?"}
          className={cn(
            "min-w-0 flex-1 border-0 bg-transparent text-[var(--ink)] outline-none focus:outline-none focus-visible:outline-none placeholder:text-[var(--faint)]",
            hero ? "text-[17.5px]" : "text-[14.5px]",
          )}
        />
        {busy ? (
          <span className="flex shrink-0 items-center gap-2 text-[12.5px] text-[var(--muted)]">
            <span className="h-1.5 w-1.5 animate-[pulse-soft_1s_infinite] rounded-full bg-[var(--accent)]" />
            Understanding
          </span>
        ) : (
          <>
            {q && (
              <kbd className="hidden shrink-0 items-center gap-1 rounded-[6px] border border-[var(--line)] px-1.5 py-1 text-[10.5px] text-[var(--muted)] sm:flex">
                <CornerDownLeft size={11} /> Enter
              </kbd>
            )}
            {aiMode && (
              <button
                type="button"
                onClick={toAi}
                title="Turn this page into a conversation. For when you cannot phrase it as a task."
                className="flex h-9 shrink-0 items-center gap-1.5 rounded-full border border-[var(--accent-line)] bg-[var(--accent-soft)] px-3 text-[12.5px] font-medium text-[var(--accent)] transition-[filter] hover:brightness-105 sm:h-10"
              >
                <Sparkles size={13} strokeWidth={2.1} /> AI mode
              </button>
            )}
          </>
        )}
      </form>

      {!res && !busy && (
        <div className="mt-3 flex flex-wrap gap-1.5">
          {chips.map((e) => (
            <button
              key={e}
              onClick={() => {
                setQ(e);
                run(e);
              }}
              className="inline-flex min-h-[40px] items-center rounded-full border border-[var(--line)] bg-[var(--panel)] px-3.5 text-[12.5px] text-[var(--ink-2)] transition-colors hover:border-[var(--accent-line)] hover:bg-[var(--accent-soft)] hover:text-[var(--accent)] sm:min-h-0 sm:py-1.5"
            >
              {e}
            </button>
          ))}
        </div>
      )}

      {res && (
        <Result
          res={res}
          aiMode={aiMode}
          onAsk={toAi}
          onClear={() => {
            setRes(null);
            setQ("");
            inputRef.current?.focus();
          }}
        />
      )}
    </div>
  );
}

function Result({
  res,
  aiMode,
  onAsk,
  onClear,
}: {
  res: NavResult;
  aiMode: boolean;
  onAsk: () => void;
  onClear: () => void;
}) {
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
              {res.composed.steps.slice(0, -1).map((s, i) => (
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

          {aiMode && (res.mode === "clarify" || res.mode === "informational") && (
            <button
              onClick={onAsk}
              className="mt-3 flex w-full items-center gap-2 rounded-[10px] border border-dashed border-[var(--line)] px-3.5 py-2.5 text-[13px] text-[var(--muted)] transition-colors hover:border-[var(--accent-line)] hover:text-[var(--accent)]"
            >
              <Sparkles size={14} /> Still not it? Talk it through in AI mode
              <ArrowRight size={14} className="ml-auto" />
            </button>
          )}
        </div>
      </Card>
    </div>
  );
}
