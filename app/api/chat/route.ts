import { NextResponse } from "next/server";
import { GROUND_RULES, jsonCall } from "@/lib/ai/model";
import { groundingCatalogue, lifeEventById, navigate } from "@/lib/ai/engine";
import { CONTEXT_KEYS, CONTEXT_KEY_SET, buildContext, guessNeeds } from "@/lib/ai/context";
import { JOURNEY_MAP } from "@/lib/data/journeys";
import { SERVICE_MAP, service, serviceHref } from "@/lib/data/services";
import { CITIZEN } from "@/lib/data/citizen";
import type { GovCase } from "@/lib/types";

export const runtime = "nodejs";

/* ============================================================
   POST /api/chat - AI mode
   A conversation that can act, bounded three ways:
   it may only name services and journeys from the registry, it
   may only read citizen data the citizen has explicitly granted
   in this conversation, and it never performs a consequential
   action - it hands over to a journey where confirmation lives.
   ============================================================ */

interface Turn {
  role: "citizen" | "gov";
  text: string;
}

export async function POST(req: Request) {
  const { messages, granted, cases } = (await req.json()) as {
    messages?: Turn[];
    granted?: string[];
    cases?: GovCase[];
  };

  const turns = (messages ?? []).slice(-12);
  const ok = (granted ?? []).filter((k) => CONTEXT_KEY_SET.has(k));
  const last = [...turns].reverse().find((t) => t.role === "citizen")?.text ?? "";

  const cat = groundingCatalogue();
  const out = await jsonCall(
    `${GROUND_RULES}

You are Gov.in in conversation. The citizen came here because their need did not fit a search box.

Reply as JSON:
{
  "reply": "<your answer, 40-110 words, plain Indian English>",
  "needs": [{ "key": "<context key>", "why": "<max 14 words, what it lets you do>" }],
  "suggests": [{ "kind": "journey" | "service" | "lifeEvent", "id": "<registry id>" }],
  "title": "<only on the first reply: 3-5 words naming this conversation>"
}

ABOUT CITIZEN DATA - this matters more than being helpful:
- You know nothing about this person except their first name unless it appears under GRANTED CONTEXT below.
- Never guess, assume or invent a fact about them. Not their address, not their documents, not their family.
- If a fact would materially change your answer, ask for it through "needs" and answer as best you can without it.
- Ask for at most 2 keys per reply, and only ones that change what you would say.
- Never re-request a key already granted.

ABOUT ACTING:
- You do not submit, pay, cancel or file anything. You hand over to a journey through "suggests", and the
  citizen confirms there. Say so plainly when it matters.
- When a situation spans several departments - a death, a marriage, a move, a new business, a job change -
  suggest the matching lifeEvent rather than listing its parts separately. That is what it is for.
- At most 2 suggestions, and every one must be something you would defend if asked why. Do not pad the list
  to look useful. An empty "suggests" is a perfectly good answer.
- Never suggest something merely adjacent to the topic. Offering fraud reporting to someone describing a
  bereavement is worse than offering nothing.

AVAILABLE CONTEXT KEYS (request via "needs"):
${CONTEXT_KEYS.map((k) => `${k.key} - ${k.label}: ${k.detail} (held by ${k.holder})`).join("\n")}

GRANTED CONTEXT (everything you are allowed to know right now):
${buildContext(ok, cases ?? [])}

REGISTRY (the only services and journeys that exist):
${JSON.stringify(cat)}

The citizen's first name is ${CITIZEN.shortName}.`,
    turns.map((t) => `${t.role === "citizen" ? "Citizen" : "Gov.in"}: ${t.text}`).join("\n"),
    700,
  );

  if (out && typeof out.reply === "string" && out.reply.trim().length > 5) {
    const needs = Array.isArray(out.needs)
      ? (out.needs as { key?: string; why?: string }[])
          .filter((n) => n?.key && CONTEXT_KEY_SET.has(n.key) && !ok.includes(n.key))
          .slice(0, 2)
          .map((n) => ({ key: n.key!, why: n.why ?? "" }))
      : [];
    const suggests = Array.isArray(out.suggests)
      ? (out.suggests as { kind?: string; id?: string }[])
          .filter((sg) => sg?.id && (JOURNEY_MAP[sg.id] || SERVICE_MAP[sg.id] || lifeEventById(sg.id)))
          .slice(0, 2)
          .map((sg) => toSuggestion(sg.id!))
          .filter((sg): sg is NonNullable<typeof sg> => sg !== null)
      : [];
    return NextResponse.json({
      reply: out.reply.trim(),
      needs,
      suggests,
      title: typeof out.title === "string" ? out.title.slice(0, 48) : undefined,
      source: "model",
    });
  }

  return NextResponse.json(fallback(last, ok));
}

function toSuggestion(id: string) {
  const j = JOURNEY_MAP[id];
  if (j) {
    return {
      kind: "journey" as const,
      id,
      label: j.title,
      sublabel: `${service(j.serviceId).name} · about ${j.estMinutes} min`,
      href: `/journeys/${id}`,
      serviceId: j.serviceId,
    };
  }
  const s = SERVICE_MAP[id];
  if (s) {
    return {
      kind: "service" as const,
      id,
      label: s.name,
      sublabel: s.department,
      href: serviceHref(s.id),
      serviceId: s.id,
    };
  }
  const ev = lifeEventById(id);
  if (ev) {
    return {
      kind: "journey" as const,
      id: ev.id,
      label: ev.title,
      sublabel: `${ev.steps.length - 1} government capabilities, composed into one journey`,
      href: `/journeys/${ev.id}`,
      serviceId: "gov-core" as const,
    };
  }
  return null;
}

/** Without a model, the deterministic engine still carries a conversation. */
function fallback(last: string, granted: string[]) {
  const nav = navigate(last);
  const needs = guessNeeds(last, granted).map((key) => ({
    key,
    why: "it changes what applies to you",
  }));

  if (nav.primary?.journeyId && JOURNEY_MAP[nav.primary.journeyId]) {
    const j = JOURNEY_MAP[nav.primary.journeyId];
    return {
      reply: `From what you have described, this maps to ${j.title.toLowerCase()} with ${service(j.serviceId).name}. ${j.goal} It takes about ${j.estMinutes} minutes, and you confirm everything before anything is submitted.`,
      needs,
      suggests: [toSuggestion(j.id)].filter(Boolean),
      source: "engine",
    };
  }

  if (nav.composed) {
    return {
      reply: `${nav.reading} Nothing here is submitted until you confirm each part.`,
      needs,
      suggests: [],
      source: "engine",
    };
  }

  return {
    reply:
      "I could not match that to an existing government service, and I would rather say so than guess. It is logged as an unmet need - repeated unmet needs are how a missing service gets noticed. If something has already gone wrong with a department, a grievance carries the whole case history with it.",
    needs,
    suggests: [toSuggestion("cpgrams-grievance"), toSuggestion("rti-file")].filter(Boolean),
    source: "engine",
  };
}
