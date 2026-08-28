"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { ArrowRight, ArrowUp, Check, Layers, Lock, Plus, Search, ShieldCheck, Sparkles, Trash2, X } from "lucide-react";
import { Badge, Button, Card, ServiceMark, Title, cn } from "@/components/ui/primitives";
import { CITIZEN } from "@/lib/data/citizen";
import { contextKeyDef } from "@/lib/ai/context";
import { newId, useSession, type ChatTurn, type Suggestion } from "@/lib/state/store";
import type { ServiceId } from "@/lib/types";

/* ============================================================
   AI MODE
   The same front door, turned into a conversation. It is here
   for needs that cannot be phrased as a task — and the point of
   the screen is what it does NOT know: it opens knowing a first
   name, and asks for anything more, one bundle at a time.
   ============================================================ */

const OPENERS = [
  "My father died last month and I do not know where to start.",
  "I am starting a business with a friend. What do we actually need?",
  "Something is stuck with a department and nobody replies.",
  "I want to move to Bangalore. What breaks if I do nothing?",
];

export function AiMode({ conversationId }: { conversationId?: string }) {
  const { state, dispatch, ready } = useSession();
  const router = useRouter();
  const params = useSearchParams();
  const seed = params.get("q") ?? "";

  const [activeId, setActiveId] = useState<string | null>(conversationId ?? null);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const bottom = useRef<HTMLDivElement>(null);
  const seeded = useRef(false);

  const conv = state.conversations.find((c) => c.id === activeId);

  useEffect(() => {
    bottom.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [conv?.turns.length, busy]);

  // A question typed into the front door should not have to be typed again.
  useEffect(() => {
    if (!ready || seeded.current || !seed) return;
    seeded.current = true;
    void send(seed);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ready, seed]);

  async function send(text: string, convId?: string, extraGrant?: string) {
    const body = text.trim();
    if (!body || busy) return;

    let id = convId ?? activeId;
    if (!id) {
      id = newId("conv");
      dispatch({ type: "newConversation", id, seed: body });
      setActiveId(id);
      router.replace(`/ai/${id}`);
    }

    const current = state.conversations.find((c) => c.id === id);
    const granted = [...(current?.granted ?? []), ...(extraGrant ? [extraGrant] : [])];

    const turn: ChatTurn = { id: newId("t"), role: "citizen", text: body, at: new Date().toISOString() };
    dispatch({ type: "addTurn", conversationId: id, turn });
    setInput("");
    setBusy(true);

    const history = [...(current?.turns ?? []), turn].map((t) => ({ role: t.role, text: t.text }));

    try {
      const r = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: history, granted, cases: granted.includes("cases") ? state.cases : [] }),
      });
      const d = await r.json();
      dispatch({
        type: "addTurn",
        conversationId: id,
        turn: {
          id: newId("t"),
          role: "gov",
          text: d.reply,
          at: new Date().toISOString(),
          needs: d.needs ?? [],
          suggests: d.suggests ?? [],
          source: d.source,
        },
      });
      if (d.title && (current?.turns.length ?? 0) === 0) {
        dispatch({ type: "titleConversation", conversationId: id, title: d.title });
      }
    } catch {
      dispatch({
        type: "addTurn",
        conversationId: id,
        turn: {
          id: newId("t"),
          role: "gov",
          text: "We could not reach the assistance service. Nothing you typed was lost, and you can still use the navigation bar on the home screen.",
          at: new Date().toISOString(),
          source: "engine",
        },
      });
    } finally {
      setBusy(false);
    }
  }

  function grant(key: string, turnId: string) {
    if (!conv) return;
    dispatch({ type: "grantContext", conversationId: conv.id, key });
    dispatch({ type: "clearNeeds", conversationId: conv.id, turnId });
    void send("I have shared that with you. Please continue.", conv.id, key);
  }

  function decline(turnId: string) {
    if (!conv) return;
    dispatch({ type: "clearNeeds", conversationId: conv.id, turnId });
  }

  if (!ready) return null;

  const empty = !conv || conv.turns.length === 0;

  return (
    <div className="mx-auto grid w-full max-w-[1240px] gap-8 px-5 pb-2 pt-6 sm:px-8 lg:grid-cols-[228px_minmax(0,1fr)] lg:pb-6 lg:pt-8">
      {/* Conversations live with the conversation, not in the global chrome —
          they are only meaningful on this screen. */}
      <aside className="hidden lg:block">
        <Link
          href="/ai"
          className="mb-3 flex items-center gap-2 border border-[var(--line)] bg-[var(--panel)] px-3 py-2 text-[13.5px] font-medium transition-colors hover:border-[var(--ink-2)]"
        >
          <Plus size={15} strokeWidth={2} /> New conversation
        </Link>
        {state.conversations.length > 0 && (
          <>
            <p className="label mb-2">Earlier</p>
            <div className="grid gap-px">
              {state.conversations.slice(0, 14).map((c) => (
                <div key={c.id} className="group/conv relative">
                  <Link
                    href={`/ai/${c.id}`}
                    title={c.title}
                    className={cn(
                      "block truncate border-l-2 py-1.5 pl-2.5 pr-7 text-[13px] transition-colors",
                      c.id === activeId
                        ? "border-[var(--accent)] bg-[var(--accent-soft)] text-[var(--ink)]"
                        : "border-transparent text-[var(--muted)] hover:border-[var(--line)] hover:text-[var(--ink)]",
                    )}
                  >
                    {c.title}
                  </Link>
                  <button
                    onClick={() => dispatch({ type: "deleteConversation", conversationId: c.id })}
                    aria-label={`Delete conversation: ${c.title}`}
                    className="absolute right-0 top-1/2 hidden -translate-y-1/2 p-1.5 text-[var(--faint)] hover:text-[var(--danger)] group-hover/conv:block"
                  >
                    <Trash2 size={12} />
                  </button>
                </div>
              ))}
            </div>
          </>
        )}
      </aside>

      <div className="flex min-h-[calc(100dvh-260px)] flex-col lg:min-h-[calc(100dvh-190px)]">
      <header className="mb-6 flex flex-wrap items-center gap-2.5">
        <Badge tone="accent">
          <Sparkles size={11} strokeWidth={2.3} /> AI mode
        </Badge>
        <span className="text-[12.5px] text-[var(--muted)]">
          Grounded in the service registry · reads nothing about you without asking
        </span>
        <Link href="/home" className="ml-auto flex items-center gap-1.5 text-[12.5px] text-[var(--accent)] hover:underline">
          <Search size={13} /> Back to navigation
        </Link>
      </header>

      {empty ? (
        <div className="flex flex-1 flex-col justify-center pb-10">
          <Title size="lg">What is going on, {CITIZEN.shortName}?</Title>
          <p className="mt-2.5 max-w-[62ch] text-[14.5px] leading-relaxed text-[var(--muted)]">
            Describe it however it makes sense to you. Right now this conversation knows your first name and
            nothing else — not your address, not your documents, not your family. It will ask before it reads
            anything, and tell you why.
          </p>
          <div className="mt-6 grid gap-2">
            {OPENERS.map((o) => (
              <button
                key={o}
                onClick={() => send(o)}
                className="flex items-center gap-3 rounded-[3px] border border-[var(--line)] bg-[var(--panel)] px-4 py-3 text-left text-[14px] text-[var(--ink-2)] transition-colors hover:border-[var(--accent-line)] hover:bg-[var(--accent-soft)]"
              >
                <span className="min-w-0 flex-1">{o}</span>
                <ArrowRight size={15} className="shrink-0 text-[var(--faint)]" />
              </button>
            ))}
          </div>
        </div>
      ) : (
        <div className="flex-1 space-y-6">
          {conv.turns.map((t) => (
            <Turn key={t.id} turn={t} onGrant={grant} onDecline={decline} granted={conv.granted} />
          ))}
          {busy && (
            <div className="flex items-center gap-2.5 text-[13.5px] text-[var(--muted)]">
              <span className="h-1.5 w-1.5 animate-[pulse-soft_0.9s_infinite] rounded-full bg-[var(--accent)]" />
              Checking what government actually offers for this
            </div>
          )}
          <div ref={bottom} />
        </div>
      )}

      {conv && conv.granted.length > 0 && (
        <div className="mb-3 flex flex-wrap items-center gap-1.5 rounded-[3px] border border-[var(--line)] bg-[var(--panel-2)] px-3 py-2">
          <ShieldCheck size={13} className="text-[var(--ok)]" />
          <span className="text-[11.5px] text-[var(--muted)]">Shared with this conversation only:</span>
          {conv.granted.map((k) => (
            <Badge key={k} tone="ok">{contextKeyDef(k)?.label ?? k}</Badge>
          ))}
        </div>
      )}

      <form
        onSubmit={(e) => {
          e.preventDefault();
          send(input);
        }}
        className="sticky bottom-[84px] mt-4 flex items-end gap-2 lg:bottom-4 rounded-[3px] border border-[var(--line)] bg-[var(--panel)] p-2 pl-4 transition-all focus-within:border-[var(--accent)] focus-within:ring-4 focus-within:ring-[var(--accent-soft)]"
      >
        <textarea
          rows={1}
          value={input}
          onChange={(e) => {
            setInput(e.target.value);
            e.target.style.height = "auto";
            e.target.style.height = Math.min(e.target.scrollHeight, 160) + "px";
          }}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              send(input);
            }
          }}
          placeholder="Describe your situation"
          aria-label="Describe your situation"
          className="min-h-[38px] flex-1 resize-none self-center border-0 bg-transparent py-2 text-[15px] leading-relaxed outline-none focus:outline-none focus-visible:outline-none placeholder:text-[var(--faint)]"
        />
        <button
          type="submit"
          disabled={!input.trim() || busy}
          aria-label="Send"
          className="grid h-9 w-9 shrink-0 place-items-center rounded-[3px] bg-[var(--accent)] text-[var(--accent-ink)] transition-opacity disabled:opacity-30"
        >
          <ArrowUp size={17} strokeWidth={2.3} />
        </button>
      </form>
        <p className="mt-2 text-center text-[11.5px] text-[var(--muted)]">
          AI mode explains and routes. It never submits, pays or cancels anything — that happens inside a
          journey, where you confirm.
        </p>
      </div>
    </div>
  );
}

function Turn({
  turn,
  granted,
  onGrant,
  onDecline,
}: {
  turn: ChatTurn;
  granted: string[];
  onGrant: (key: string, turnId: string) => void;
  onDecline: (turnId: string) => void;
}) {
  if (turn.role === "citizen") {
    return (
      <div className="flex justify-end">
        <p className="max-w-[80%] rounded-[3px] rounded-br-[4px] bg-[var(--accent-soft)] px-4 py-2.5 text-[14.5px] leading-relaxed text-[var(--ink)]">
          {turn.text}
        </p>
      </div>
    );
  }

  const needs = (turn.needs ?? []).filter((n) => !granted.includes(n.key));

  return (
    <div className="rise">
      <div className="mb-1.5 flex items-center gap-2">
        <span className="grid h-6 w-6 place-items-center rounded-[2px] bg-[var(--accent)] text-[var(--accent-ink)]">
          <ShieldCheck size={13} strokeWidth={2.3} />
        </span>
        <span className="text-[12px] font-medium text-[var(--ink-2)]">Gov.in</span>
        <span className="text-[11.5px] text-[var(--faint)]">
          {turn.source === "model" ? "AI layer" : "navigation engine"}
        </span>
      </div>
      <p className="max-w-[68ch] whitespace-pre-wrap text-[14.5px] leading-relaxed text-[var(--ink)]">{turn.text}</p>

      {needs.length > 0 && (
        <div className="mt-3 grid gap-2">
          {needs.map((n) => {
            const def = contextKeyDef(n.key);
            return (
              <Card key={n.key} className="border-[var(--accent-line)] bg-[var(--accent-soft)] p-3.5">
                <div className="mb-2 flex items-start gap-2.5">
                  <Lock size={14} className="mt-0.5 shrink-0 text-[var(--accent)]" />
                  <div className="min-w-0">
                    <p className="text-[13.5px] font-medium leading-snug">
                      To answer this properly it needs {def?.label.toLowerCase() ?? n.key}
                    </p>
                    <p className="mt-1 text-[12.5px] leading-relaxed text-[var(--ink-2)]">
                      {def?.detail} Held by {def?.holder}.{n.why ? ` Needed because ${n.why}.` : ""}
                    </p>
                  </div>
                </div>
                <div className="flex flex-wrap gap-2">
                  <Button size="sm" onClick={() => onGrant(n.key, turn.id)}>
                    <Check size={13} /> Share for this conversation
                  </Button>
                  <Button size="sm" variant="ghost" onClick={() => onDecline(turn.id)}>
                    <X size={13} /> Answer without it
                  </Button>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      {turn.suggests && turn.suggests.length > 0 && (
        <div className="mt-3 grid gap-1.5">
          <p className="text-[11.5px] uppercase tracking-wider text-[var(--faint)]">Where this actually happens</p>
          {turn.suggests.map((sg: Suggestion) => (
            <Link
              key={sg.id}
              href={sg.href}
              className="flex items-center gap-3 rounded-[3px] border border-[var(--line)] bg-[var(--panel)] p-3 transition-colors hover:border-[var(--accent-line)] hover:bg-[var(--accent-soft)]"
            >
              <ServiceMark id={sg.serviceId as ServiceId} size={32} />
              <span className="min-w-0 flex-1">
                <span className="block truncate text-[14px] font-medium">{sg.label}</span>
                <span className="block truncate text-[12px] text-[var(--muted)]">{sg.sublabel}</span>
              </span>
              <Badge tone="neutral" className={cn(sg.kind === "journey" && "hidden sm:inline-flex")}>
                {sg.kind === "journey" ? <><Layers size={10} /> journey</> : "department"}
              </Badge>
              <ArrowRight size={15} className="shrink-0 text-[var(--faint)]" />
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
