/* ============================================================
   LEGACY FORM RECONSTRUCTION
   The field burden a citizen carries through the existing
   passport reissue application, reconstructed from the published
   form structure purely for comparison. No government site's
   code, markup or branding is used, and this is not affiliated
   with any of them.

   It lives here, not in the page, so the counts quoted anywhere
   in the product are computed from one list rather than typed
   into prose and left to drift.
   ============================================================ */

export type Flag = "known" | "repeat" | "jargon" | "rare" | null;

export interface LegacySection {
  title: string;
  fields: { label: string; flag?: Flag; required?: boolean }[];
}

export const LEGACY: LegacySection[] = [
  {
    title: "A. Applicant details",
    fields: [
      { label: "Service required", required: true },
      { label: "Type of application", required: true, flag: "jargon" },
      { label: "Type of passport booklet", required: true },
      { label: "Given name", required: true, flag: "known" },
      { label: "Surname", required: true, flag: "known" },
      { label: "Have you ever been known by any other name?", required: true },
      { label: "Gender", required: true, flag: "known" },
      { label: "Date of birth", required: true, flag: "known" },
      { label: "Place of birth - village / town / city", required: true, flag: "known" },
      { label: "Place of birth - district", required: true, flag: "known" },
      { label: "Place of birth - state / UT", required: true, flag: "known" },
      { label: "Place of birth - country", required: true, flag: "known" },
      { label: "Marital status", required: true, flag: "known" },
      { label: "Citizenship of India by", required: true, flag: "jargon" },
      { label: "PAN", flag: "known" },
      { label: "Voter ID", flag: "known" },
      { label: "Employment type", required: true },
      { label: "Are you or have you been a government servant?", required: true },
      { label: "Educational qualification", required: true, flag: "rare" },
      { label: "Are you eligible for non-ECR category?", required: true, flag: "jargon" },
      { label: "Visible distinguishing mark", required: true },
      { label: "Aadhaar number", required: true, flag: "known" },
    ],
  },
  {
    title: "B. Family details",
    fields: [
      { label: "Father - given name", required: true, flag: "known" },
      { label: "Father - surname", required: true, flag: "known" },
      { label: "Mother - given name", required: true, flag: "known" },
      { label: "Mother - surname", required: true, flag: "known" },
      { label: "Legal guardian - given name", flag: "rare" },
      { label: "Legal guardian - surname", flag: "rare" },
      { label: "Spouse - given name", flag: "known" },
      { label: "Spouse - surname", flag: "known" },
    ],
  },
  {
    title: "C. Present residential address",
    fields: [
      { label: "House no. and street", required: true, flag: "known" },
      { label: "Village / town / city", required: true, flag: "known" },
      { label: "District", required: true, flag: "known" },
      { label: "State / UT", required: true, flag: "known" },
      { label: "PIN code", required: true, flag: "known" },
      { label: "Police station", required: true, flag: "jargon" },
      { label: "Mobile number", required: true, flag: "known" },
      { label: "Telephone number", flag: "rare" },
      { label: "Email address", required: true, flag: "known" },
      { label: "Residing at this address since", required: true },
    ],
  },
  {
    title: "D. Permanent address",
    fields: [
      { label: "House no. and street", required: true, flag: "repeat" },
      { label: "Village / town / city", required: true, flag: "repeat" },
      { label: "District", required: true, flag: "repeat" },
      { label: "State / UT", required: true, flag: "repeat" },
      { label: "PIN code", required: true, flag: "repeat" },
      { label: "Police station", required: true, flag: "repeat" },
      { label: "Mobile number", flag: "repeat" },
      { label: "Telephone number", flag: "repeat" },
    ],
  },
  {
    title: "E. Emergency contact",
    fields: [
      { label: "Name", required: true, flag: "known" },
      { label: "Address", required: true, flag: "known" },
      { label: "Mobile number", required: true, flag: "known" },
      { label: "Telephone number" },
      { label: "Email address" },
    ],
  },
  {
    title: "F. References in your locality",
    fields: [
      { label: "Reference 1 - name", required: true },
      { label: "Reference 1 - address", required: true },
      { label: "Reference 1 - mobile", required: true },
      { label: "Reference 1 - telephone" },
      { label: "Reference 2 - name", required: true },
      { label: "Reference 2 - address", required: true },
      { label: "Reference 2 - mobile", required: true },
      { label: "Reference 2 - telephone" },
    ],
  },
  {
    title: "G. Previous passport details",
    fields: [
      { label: "Passport number", required: true, flag: "known" },
      { label: "Date of issue", required: true, flag: "known" },
      { label: "Date of expiry", required: true, flag: "known" },
      { label: "Place of issue", required: true, flag: "known" },
      { label: "File number", required: true, flag: "known" },
      { label: "Has there been any change in particulars?", required: true },
      { label: "Has the passport ever been lost, damaged or impounded?", required: true },
    ],
  },
  {
    title: "H. Other details",
    fields: [
      { label: "Criminal proceedings pending against you?", required: true },
      { label: "Ever convicted by a court?", required: true },
      { label: "Ever refused or denied a passport?", required: true },
      { label: "Passport ever impounded or revoked?", required: true },
      { label: "Ever repatriated at government expense?", required: true },
      { label: "Ever deported to India?", required: true },
      { label: "Warrant or summons issued by a court?", required: true },
      { label: "Order prohibiting your departure from India?", required: true },
      { label: "Ever applied for asylum abroad?", required: true },
      { label: "Ever granted citizenship of another country?", required: true },
    ],
  },
];


export const LEGACY_TOTAL = LEGACY.reduce((n, s) => n + s.fields.length, 0);

/** Fields whose value the government already holds, or has just asked for. */
export const LEGACY_KNOWN = LEGACY.reduce(
  (n, s) => n + s.fields.filter((f) => f.flag === "known" || f.flag === "repeat").length,
  0,
);

/** What is actually a decision only the citizen can make. */
export const LEGACY_DECISIONS = 4;
