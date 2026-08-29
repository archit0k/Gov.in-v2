import { NextResponse } from "next/server";
import { navigate, groundingCatalogue, lifeEventById } from "@/lib/ai/engine";
import { GROUND_RULES, jsonCall } from "@/lib/ai/model";
import { JOURNEY_MAP } from "@/lib/data/journeys";
import { SERVICE_MAP, service, serviceHref } from "@/lib/data/services";
import type { NavResult, ServiceId } from "@/lib/types";

export const runtime = "nodejs";

/* ============================================================
   POST /api/navigate
   Deterministic first. The model is only consulted when the
   engine is genuinely unsure, and it may only pick an id that
   already exists in the registry.
   ============================================================ */

export async function POST(req: Request) {
  const { query, scope } = (await req.json()) as { query?: string; scope?: ServiceId };
  const q = (query ?? "").trim();

  const engine = navigate(q, scope);

  // Confident deterministic match — do not spend a model call or a second of the
  // citizen's time. The bar is deliberately high: a single weak keyword hit is
  // not certainty, and being confidently wrong is worse than being a second slow.
  if (engine.confidence >= 0.85 && engine.mode !== "clarify") {
    return NextResponse.json(engine);
  }

  // A department's own search must not hand the citizen off elsewhere.
  if (scope) return NextResponse.json(engine);

  const cat = groundingCatalogue();
  const out = await jsonCall(
    `${GROUND_RULES}

You are routing one citizen request. Reply as JSON:
{
  "kind": "journey" | "service" | "lifeEvent" | "answer" | "clarify",
  "id": "<exact id from the registry, omit for answer/clarify>",
  "reading": "<one sentence, max 22 words, explaining how you read the request. Address the citizen.>",
  "answer": "<only for kind=answer: max 45 words, factual, from the registry only>",
  "question": "<only for kind=clarify>",
  "options": [{ "label": "...", "id": "<registry id>" }]
}

Choose "journey" when a specific journey clearly matches.
Choose "lifeEvent" when the request spans several departments at once.
Choose "service" when they named a department but not a task.
Choose "answer" only for a factual question about what a service does.
Choose "clarify" when two or more readings are genuinely plausible.

REGISTRY (the only things that exist):
${JSON.stringify(cat)}`,
    `Citizen request: "${q}"`,
    350,
  );

  if (!out) return NextResponse.json({ ...engine, source: "engine" });

  const grounded = ground(out, engine);
  return NextResponse.json(grounded);
}

function ground(out: Record<string, unknown>, fallback: NavResult): NavResult {
  const kind = String(out.kind ?? "");
  const id = typeof out.id === "string" ? out.id : "";
  const reading = typeof out.reading === "string" ? out.reading : fallback.reading;

  if (kind === "journey" && JOURNEY_MAP[id]) {
    const j = JOURNEY_MAP[id];
    return {
      mode: "deterministic",
      reading,
      confidence: 0.88,
      primary: {
        journeyId: j.id,
        serviceId: j.serviceId,
        href: `/journeys/${j.id}`,
        label: j.title,
        sublabel: `${service(j.serviceId).name} · about ${j.estMinutes} min`,
      },
      source: "model",
    };
  }

  if (kind === "lifeEvent") {
    const composed = lifeEventById(id);
    if (composed) {
      return {
        mode: "composed",
        reading,
        confidence: 0.85,
        composed,
        primary: {
          journeyId: composed.id,
          href: `/journeys/${composed.id}`,
          label: composed.title,
          sublabel: `${composed.steps.length} government capabilities, composed into one journey`,
        },
        source: "model",
      };
    }
  }

  if (kind === "service" && SERVICE_MAP[id]) {
    const s = SERVICE_MAP[id];
    return {
      mode: "deterministic",
      reading,
      confidence: 0.8,
      primary: { serviceId: s.id, href: serviceHref(s.id), label: s.name, sublabel: s.department },
      source: "model",
    };
  }

  if (kind === "answer" && typeof out.answer === "string") {
    return { mode: "informational", reading, confidence: 0.7, answer: out.answer, source: "model" };
  }

  if (kind === "clarify" && Array.isArray(out.options)) {
    const opts = (out.options as { label?: string; id?: string }[])
      .filter((o) => o?.id && (JOURNEY_MAP[o.id] || SERVICE_MAP[o.id]))
      .map((o) => ({
        label: o.label ?? JOURNEY_MAP[o.id!]?.title ?? SERVICE_MAP[o.id!]?.name ?? "",
        href: JOURNEY_MAP[o.id!] ? `/journeys/${o.id}` : serviceHref(o.id as ServiceId),
      }));
    if (opts.length) {
      return {
        mode: "clarify",
        reading,
        confidence: 0.4,
        clarify: { question: typeof out.question === "string" ? out.question : "Which is closest?", options: opts },
        source: "model",
      };
    }
  }

  // The model produced something outside the registry. Discard it and use the engine.
  return { ...fallback, source: "engine" };
}
