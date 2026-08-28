import OpenAI from "openai";

/* ============================================================
   AI GATEWAY
   One place the model is reached from. Every caller goes through
   here, so grounding, timeouts and fallback are policy, not
   something each screen reimplements.
   ============================================================ */

export const MODEL = process.env.OPENAI_MODEL ?? "openai/gpt-5.4-mini";

/** Any OpenAI-compatible endpoint. Unset means OpenAI itself. */
const BASE_URL = process.env.OPENAI_BASE_URL;

let client: OpenAI | null = null;
export function ai(): OpenAI | null {
  if (!process.env.OPENAI_API_KEY) return null;
  client ??= new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
    ...(BASE_URL ? { baseURL: BASE_URL } : {}),
    // The citizen is waiting on this call, so it fails fast into the
    // deterministic engine rather than holding the interface open.
    timeout: 12_000,
    maxRetries: 1,
  });
  return client;
}

export const GROUND_RULES = `You are the navigation and assistance layer inside Gov.in, shared citizen infrastructure for Indian government services.

HARD RULES — these are not style preferences:
- You may only refer to services and journeys that appear in the supplied registry. If something is not in the registry, it does not exist.
- Never invent schemes, deadlines, eligibility rules, fee amounts, document requirements, section numbers or department names.
- Never state a legal requirement you were not given.
- If you are unsure, say plainly that you are not sure and point to the grievance or RTI journey.
- Never claim an action has been performed. You describe and route; the citizen confirms and the department executes.
- Write in plain Indian English. Short sentences. No exclamation marks. No greetings. Never say "I am an AI assistant".
- Address the citizen as "you". Do not use the citizen's name unless it is needed.`;

export async function jsonCall(system: string, user: string, maxTokens = 400): Promise<Record<string, unknown> | null> {
  const c = ai();
  if (!c) return null;
  try {
    const r = await c.chat.completions.create({
      model: MODEL,
      messages: [
        { role: "system", content: system },
        { role: "user", content: user },
      ],
      response_format: { type: "json_object" },
      max_completion_tokens: maxTokens,
    });
    const text = r.choices[0]?.message?.content;
    return text ? (JSON.parse(text) as Record<string, unknown>) : null;
  } catch {
    /* The demo must never depend on a network call succeeding. */
    return null;
  }
}
