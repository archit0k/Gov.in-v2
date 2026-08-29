import { CITIZEN, formatDate } from "@/lib/data/citizen";
import type { GovCase } from "@/lib/types";

/* ============================================================
   PERMISSIONED CONTEXT
   The AI starts a conversation knowing nothing about the citizen
   beyond their first name. Every additional fact has to be asked
   for, one bundle at a time, with a reason - and the citizen can
   say no and still get an answer.

   This is the whole difference between an assistant that is
   useful and one that is invasive: not what it can reach, but
   what it had to ask for first.
   ============================================================ */

export interface ContextKeyDef {
  key: string;
  label: string;
  /** Shown on the consent card so "why" is never a mystery. */
  holder: string;
  detail: string;
}

export const CONTEXT_KEYS: ContextKeyDef[] = [
  {
    key: "identity",
    label: "Your verified identity",
    holder: "Gov.in profile",
    detail: "Name, date of birth, and how strongly your identity is verified.",
  },
  {
    key: "contact",
    label: "Your phone and email",
    holder: "Gov.in profile",
    detail: "Only the contact points government already writes to.",
  },
  {
    key: "address",
    label: "Your addresses",
    holder: "Gov.in profile",
    detail: "Current and permanent address, and when each was last verified.",
  },
  {
    key: "credentials",
    label: "Your government credentials",
    holder: "Seven issuing departments",
    detail: "Passport, licence, vehicle, PAN, GSTIN, UAN and DIN - numbers masked, with expiry dates.",
  },
  {
    key: "relationships",
    label: "Your citizen graph",
    holder: "Gov.in profile",
    detail: "Father, mother, spouse and nominee, and which departments can already see each.",
  },
  {
    key: "employment",
    label: "Your employment and PF",
    holder: "EPFO",
    detail: "Current employer, when you joined, and provident fund balance.",
  },
  {
    key: "business",
    label: "Your business",
    holder: "MCA and GSTN",
    detail: "Company, directorship and GST registration.",
  },
  {
    key: "cases",
    label: "Your open cases",
    holder: "Gov.in case infrastructure",
    detail: "What you have filed with which department, and where each one is stuck.",
  },
];

export const CONTEXT_KEY_SET = new Set(CONTEXT_KEYS.map((k) => k.key));

export function contextKeyDef(key: string) {
  return CONTEXT_KEYS.find((k) => k.key === key);
}

/** Resolves granted keys into the text the model is allowed to see. */
export function buildContext(granted: string[], cases: GovCase[] = []): string {
  const c = CITIZEN;
  const out: string[] = [];
  const has = (k: string) => granted.includes(k);

  if (has("identity")) {
    out.push(
      `IDENTITY: ${c.name}, born ${formatDate(c.dob)}, ${c.gender}. Identity assurance: ${c.identityAssurance}, verified in person on ${formatDate(c.verifiedOn)}.`,
    );
  }
  if (has("contact")) out.push(`CONTACT: phone ${c.phone}, email ${c.email}. Languages: ${c.languages.join(", ")}.`);
  if (has("address")) {
    out.push(
      "ADDRESSES: " +
        c.addresses
          .map(
            (a) =>
              `${a.label} - ${a.line1}, ${a.line2 ?? ""} ${a.city}, ${a.state} ${a.pin} (${a.verification}, updated ${formatDate(a.updatedAt)})`,
          )
          .join(" | "),
    );
  }
  if (has("credentials")) {
    out.push(
      "CREDENTIALS: " +
        c.credentials
          .map(
            (k) =>
              `${k.title} ${k.number} issued by ${k.issuer}${k.expiresOn ? `, expires ${formatDate(k.expiresOn)}` : ""} (${k.status})`,
          )
          .join(" | "),
    );
  }
  if (has("relationships")) {
    out.push(
      "CITIZEN GRAPH: " +
        c.relationships
          .map((r) => `${r.relation} ${r.name}${r.dob ? ` born ${formatDate(r.dob)}` : ""}, visible to ${r.sharesWith.join("/")}`)
          .join(" | "),
    );
  }
  if (has("employment")) {
    out.push(
      `EMPLOYMENT: ${c.employment.employer} since ${formatDate(c.employment.since)}. UAN ${c.employment.uan}, monthly contribution ${c.employment.monthlyContribution}. Provident fund balance ₹8,42,160 across 2 member IDs, one of them with a previous employer.`,
    );
  }
  if (has("business")) {
    out.push(
      "BUSINESS: Deshmukh Design Studio Pvt Ltd, incorporated 9 Mar 2022. GSTIN 27AB••••4419F1Z8, quarterly filer. DIN 09••••41, DIR-3 KYC due 30 Sep 2026.",
    );
  }
  if (has("cases") && cases.length) {
    out.push(
      "OPEN CASES: " +
        cases
          .map((k) => `${k.id} (${k.title}) - currently "${k.states[k.stateIndex]}". ${k.statusLine}`)
          .join(" | "),
    );
  }

  return out.length ? out.join("\n") : "No citizen data has been shared with you yet.";
}

/** Keys that would plainly help, given what has been said so far. Fallback only. */
export function guessNeeds(text: string, granted: string[]): string[] {
  const t = text.toLowerCase();
  const want = new Set<string>();
  if (/passport|licen|vehicle|pan|gst|uan|din|expir|renew/.test(t)) want.add("credentials");
  if (/address|moving|relocat|shift|where i live/.test(t)) want.add("address");
  if (/pf|provident|epf|employer|job|salary|pension/.test(t)) want.add("employment");
  if (/company|business|gst|director|incorporat/.test(t)) want.add("business");
  if (/case|status|stuck|pending|filed|applied|refund/.test(t)) want.add("cases");
  if (/father|mother|spouse|wife|husband|family|nominee|parent/.test(t)) want.add("relationships");
  return [...want].filter((k) => !granted.includes(k)).slice(0, 2);
}
