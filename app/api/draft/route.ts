import { NextResponse } from "next/server";
import { GROUND_RULES, jsonCall } from "@/lib/ai/model";
import { JOURNEY_MAP } from "@/lib/data/journeys";
import { service } from "@/lib/data/services";

export const runtime = "nodejs";

/* ============================================================
   POST /api/draft
   Rewrites what the citizen wrote into the form the receiving
   officer needs. It never changes what is being asked - only how
   it is worded - and the citizen always sees both versions.
   ============================================================ */

/** Deterministic fallback. A template, and labelled as one. */
function templateDraft(text: string, journeyId?: string) {
  const clean = text.trim().replace(/\s+/g, " ");
  if (journeyId === "rti-file") {
    const subject = /[.?!]$/.test(clean) ? clean : `${clean}.`;
    return [
      "Under Section 6(1) of the Right to Information Act, 2005, I request the following information in respect of the matter below.",
      "",
      `Matter: ${subject}`,
      "",
      "1. The current status of this matter, and the reasons recorded on file for any delay.",
      "2. Copies of file notings, inspection reports and correspondence relating to it.",
      "3. The name and designation of the officer responsible, and the sanctioned timeline.",
      "",
      "Please provide the information in electronic form where available. If any part of this is held by another public authority, please transfer that part under Section 6(3) and inform me of the transfer.",
    ].join("\n");
  }
  return clean;
}

export async function POST(req: Request) {
  const { text, journeyId, stepId } = (await req.json()) as {
    text?: string;
    journeyId?: string;
    stepId?: string;
  };
  const input = (text ?? "").trim();
  if (input.length < 3) {
    return NextResponse.json({ draft: "", source: "engine", note: "Write a line or two first." });
  }

  const j = journeyId ? JOURNEY_MAP[journeyId] : undefined;

  const out = await jsonCall(
    `${GROUND_RULES}

You rewrite one citizen's own words into the wording the receiving officer needs. Reply as JSON:
{ "draft": "<the rewritten text>", "changed": "<max 18 words: what you changed and why>" }

RULES SPECIFIC TO THIS TASK:
- Do not change what is being asked for. Only change how it is worded.
- Do not add facts, dates, amounts, file numbers or allegations the citizen did not write.
- Keep it under 130 words. Use numbered points where there is more than one thing being asked.
- If the request contains something the law does not allow to be asked this way, say so inside "changed" rather than silently dropping it.

CONTEXT
Journey: ${j?.title ?? "unknown"} - ${j?.goal ?? ""}
Goes to: ${j ? service(j.serviceId).department : "a government department"}
Step: ${stepId ?? ""}
${journeyId === "rti-file" ? "This is an RTI request under the Right to Information Act, 2005. It must ask for information the authority holds, not for opinions, reasons for policy, or answers to hypothetical questions." : ""}`,
    input,
    500,
  );

  if (out && typeof out.draft === "string" && out.draft.trim().length > 20) {
    return NextResponse.json({
      draft: out.draft.trim(),
      changed: typeof out.changed === "string" ? out.changed : "Reworded for the receiving officer.",
      source: "model",
    });
  }

  return NextResponse.json({
    draft: templateDraft(input, journeyId),
    changed: "Applied the standard statutory template. Your question is unchanged inside it.",
    source: "engine",
  });
}
