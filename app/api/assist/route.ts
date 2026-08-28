import { NextResponse } from "next/server";
import { GROUND_RULES, jsonCall } from "@/lib/ai/model";
import { JOURNEY_MAP } from "@/lib/data/journeys";
import { service } from "@/lib/data/services";

export const runtime = "nodejs";

/* ============================================================
   POST /api/assist
   Contextual help inside a journey. The model is told exactly
   which step, which fields, and which department — so it answers
   about THIS screen instead of about government in general.
   ============================================================ */

const LOCAL: Record<string, string> = {
  "identity-assurance":
    "Identity assurance is how strongly government has confirmed you are you. Yours is high, established through in-person verification in 2021. That is why this journey needs no identity documents.",
  "police-verification":
    "A local police station confirms you live at the address on the application. Because your address is already verified in your profile, this is usually pre-approved and does not delay dispatch.",
  "regime":
    "The new regime has lower rates and almost no deductions. The old regime has higher rates but allows 80C, 80D and home loan interest. Both figures shown were computed from your actual reported income.",
  "consent":
    "The department is asking for one specific attribute, for one stated purpose. It is logged, it is revocable from your permissions page, and it does not give the department access to anything else.",
  "prefill":
    "Nothing here was typed by you now. Each value comes from the department that owns it, and the source is shown under the field. If a value is wrong, correcting it here corrects it at the source.",
  "deadline":
    "Missing the DIR-3 KYC deadline deactivates your DIN. Reactivation costs ₹5,000 and the company cannot file anything requiring a director signature until it is done.",
  "golden-hour":
    "Reporting within an hour lets the payee bank freeze the funds before they are withdrawn. Recovery rates fall sharply after that, which is why this journey asks for almost nothing up front.",
};

function localAnswer(question: string) {
  const q = question.toLowerCase();
  const key = Object.keys(LOCAL).find((k) => q.includes(k.split("-")[0]));
  if (key) return LOCAL[key];
  if (/consent|permission|share|access/.test(q)) return LOCAL.consent;
  if (/prefill|already|know|autofill|source/.test(q)) return LOCAL.prefill;
  if (/deadline|late|miss/.test(q)) return LOCAL.deadline;
  return null;
}

export async function POST(req: Request) {
  const { question, journeyId, stepId } = (await req.json()) as {
    question?: string;
    journeyId?: string;
    stepId?: string;
  };
  const q = (question ?? "").trim();
  const j = journeyId ? JOURNEY_MAP[journeyId] : undefined;
  const step = j?.steps.find((s) => s.id === stepId) ?? j?.steps[0];

  const out = await jsonCall(
    `${GROUND_RULES}

You are answering one question asked from inside a government journey. Reply as JSON:
{ "answer": "<40-70 words, plain, specific to this step>", "certain": true|false }

Set certain=false, and say so in the answer, if the question needs information you were not given.

CONTEXT
Journey: ${j?.title ?? "unknown"} — ${j?.goal ?? ""}
Department: ${j ? service(j.serviceId).name + " (" + service(j.serviceId).department + ")" : "unknown"}
Current step: ${step?.title ?? "unknown"} — ${step?.intent ?? ""}
Fields on this step: ${step?.fields.map((f) => `${f.label} (${f.kind}${f.sourceLabel ? ", from " + f.sourceLabel : ""})`).join("; ") ?? "none"}
Outcome when finished: ${j?.outcome ?? ""}
What this replaced: ${j ? `${j.legacyEquivalent}, ${j.legacyFields} fields` : ""}`,
    q,
    260,
  );

  if (out && typeof out.answer === "string" && out.answer.length > 10) {
    return NextResponse.json({ answer: out.answer, certain: out.certain !== false, source: "model" });
  }

  const local = localAnswer(q);
  if (local) return NextResponse.json({ answer: local, certain: true, source: "engine" });

  return NextResponse.json({
    answer: step
      ? `On this step: ${step.intent} Everything shown comes from ${j ? service(j.serviceId).department : "the department"} or your verified profile. If that does not answer it, this question is logged so the department can add it to the journey.`
      : "That is outside what this journey covers. It has been logged as an unmet question.",
    certain: false,
    source: "engine",
  });
}
