import type { GovCase, InboxItem, Scheme, TimelineItem } from "@/lib/types";

/* ============================================================
   SEEDED GOVERNMENT STATE
   Cases, events and notices that already exist when the citizen
   arrives. Government has a history with you; the product should
   act like it.
   ============================================================ */

export const SEED_CASES: GovCase[] = [
  {
    id: "GST-2026-004182",
    journeyId: "gst-address-amend",
    serviceId: "gst",
    title: "GST registration amendment",
    states: ["Filed", "Officer review", "Query window", "Approved"],
    stateIndex: 1,
    status: "action-needed",
    statusLine: "The officer has asked for one additional document. Overdue by 4 days.",
    openedAt: "2026-08-12T10:22:00+05:30",
    updatedAt: "2026-08-24T16:05:00+05:30",
    data: { GSTIN: "27AB••••4419F1Z8", Change: "Principal place of business" },
    events: [
      { at: "2026-08-12T10:22:00+05:30", label: "Amendment filed", detail: "REG-14 submitted for principal place of business.", actor: "citizen" },
      { at: "2026-08-14T09:10:00+05:30", label: "Assigned to officer", detail: "Ward 402, Pune Division.", actor: "department" },
      { at: "2026-08-24T16:05:00+05:30", label: "Query raised", detail: "Officer requested electricity bill for the new premises.", actor: "department" },
    ],
    nextAction: { label: "Respond to the query", href: "/cases/GST-2026-004182" },
  },
  {
    id: "EPF-2026-771204",
    journeyId: "epfo-transfer",
    serviceId: "epfo",
    title: "PF transfer claim",
    states: ["Claim raised", "Previous employer attests", "EPFO processing", "Credited"],
    stateIndex: 2,
    status: "submitted",
    statusLine: "Your previous employer has attested. EPFO is processing the transfer.",
    openedAt: "2026-08-02T12:00:00+05:30",
    updatedAt: "2026-08-21T11:40:00+05:30",
    data: { UAN: "1014••••7723", Amount: "₹2,18,940", From: "Vantage Labs Pvt Ltd" },
    events: [
      { at: "2026-08-02T12:00:00+05:30", label: "Claim raised", detail: "Form 13 transfer request submitted.", actor: "citizen" },
      { at: "2026-08-09T15:30:00+05:30", label: "Attested", detail: "Vantage Labs Pvt Ltd digitally attested the claim.", actor: "department" },
      { at: "2026-08-21T11:40:00+05:30", label: "Under processing", detail: "Regional office: Pune (Bandgarden).", actor: "department" },
    ],
  },
  {
    id: "ITR-2026-118840",
    journeyId: "itr-file",
    serviceId: "income-tax",
    title: "Income tax return, AY 2026-27",
    states: ["Filed", "E-verified", "Processed u/s 143(1)", "Refund issued"],
    stateIndex: 3,
    status: "approved",
    statusLine: "Refund of ₹18,420 credited to your registered bank account.",
    openedAt: "2026-07-14T19:02:00+05:30",
    updatedAt: "2026-08-06T08:15:00+05:30",
    data: { PAN: "AB••••4419F", Refund: "₹18,420", Regime: "New" },
    events: [
      { at: "2026-07-14T19:02:00+05:30", label: "Return filed", detail: "ITR-3 filed for AY 2026-27.", actor: "citizen" },
      { at: "2026-07-14T19:04:00+05:30", label: "E-verified", detail: "Verified through Gov.in identity - no separate OTP.", actor: "system" },
      { at: "2026-08-01T10:00:00+05:30", label: "Processed", detail: "Intimation under section 143(1) issued.", actor: "department" },
      { at: "2026-08-06T08:15:00+05:30", label: "Refund credited", detail: "₹18,420 to account ending 4471.", actor: "department" },
    ],
  },
];

export const SEED_INBOX: InboxItem[] = [
  {
    id: "n-passport",
    category: "action",
    serviceId: "passport",
    title: "Your passport expires in 46 days",
    body: "Many countries require six months of validity. Renewal takes about four minutes because we already hold everything Passport Seva needs.",
    at: "2026-08-28T07:10:00+05:30",
    read: false,
    dueLabel: "Expires 13 Oct 2026",
    action: { label: "Renew passport", href: "/journeys/passport-renewal" },
  },
  {
    id: "n-gst",
    category: "action",
    serviceId: "gst",
    title: "GST officer has asked for a document",
    body: "Ward 402 requested an electricity bill for your new premises. The query window closed 4 days ago.",
    at: "2026-08-24T16:05:00+05:30",
    read: false,
    dueLabel: "Overdue",
    caseId: "GST-2026-004182",
    action: { label: "Open case", href: "/cases/GST-2026-004182" },
  },
  {
    id: "n-mca",
    category: "important",
    serviceId: "mca",
    title: "Director KYC due by 30 September",
    body: "If DIR-3 KYC is not filed, your DIN is deactivated and a ₹5,000 reactivation fee applies.",
    at: "2026-08-26T09:00:00+05:30",
    read: false,
    dueLabel: "33 days left",
    action: { label: "File in under a minute", href: "/journeys/mca-dir3-kyc" },
  },
  {
    id: "n-scheme",
    category: "important",
    serviceId: "umang",
    title: "A new scheme may apply to your business",
    body: "The Micro Enterprise Digital Credit Scheme opened on 20 August. We have not checked your eligibility - that needs your permission.",
    at: "2026-08-22T11:00:00+05:30",
    read: false,
    action: { label: "Check eligibility", href: "/schemes/medcs" },
  },
  {
    id: "n-epfo",
    category: "update",
    serviceId: "epfo",
    title: "PF transfer is being processed",
    body: "Vantage Labs attested your claim on 9 August. EPFO Pune is processing the transfer of ₹2,18,940.",
    at: "2026-08-21T11:40:00+05:30",
    read: true,
    caseId: "EPF-2026-771204",
    action: { label: "Track claim", href: "/cases/EPF-2026-771204" },
  },
  {
    id: "n-challan",
    category: "info",
    serviceId: "transport",
    title: "No pending challans",
    body: "Your vehicle MH12 QR 4419 has no outstanding challans. Insurance is valid until 4 December 2026.",
    at: "2026-08-19T08:00:00+05:30",
    read: true,
  },
  {
    id: "n-security",
    category: "security",
    serviceId: "gov-core",
    title: "GSTN read your verified address",
    body: "On 12 August, GSTN accessed your current address for the registration amendment you filed. Purpose-bound, logged, and revocable.",
    at: "2026-08-12T10:22:00+05:30",
    read: true,
    action: { label: "Review permissions", href: "/profile/permissions" },
  },
  {
    id: "n-refund",
    category: "done",
    serviceId: "income-tax",
    title: "Income tax refund credited",
    body: "₹18,420 was credited to the account ending 4471 on 6 August.",
    at: "2026-08-06T08:15:00+05:30",
    read: true,
    caseId: "ITR-2026-118840",
    action: { label: "View case", href: "/cases/ITR-2026-118840" },
  },
];

export const SEED_TIMELINE: TimelineItem[] = [
  { id: "t1", at: "2026-08-24T16:05:00+05:30", serviceId: "gst", title: "GST officer raised a query", detail: "Electricity bill requested for the new premises.", kind: "notice" },
  { id: "t2", at: "2026-08-21T11:40:00+05:30", serviceId: "epfo", title: "PF transfer under processing", detail: "₹2,18,940 from Vantage Labs Pvt Ltd.", kind: "submitted" },
  { id: "t3", at: "2026-08-12T10:22:00+05:30", serviceId: "gst", title: "GST amendment filed", detail: "Principal place of business changed to Baner Road, Pune.", kind: "submitted" },
  { id: "t4", at: "2026-08-06T08:15:00+05:30", serviceId: "income-tax", title: "Refund of ₹18,420 credited", detail: "AY 2026-27, processed under section 143(1).", kind: "payment" },
  { id: "t5", at: "2026-07-14T19:02:00+05:30", serviceId: "income-tax", title: "Income tax return filed", detail: "ITR-3, new regime, e-verified through Gov.in identity.", kind: "submitted" },
  { id: "t6", at: "2026-04-02T10:30:00+05:30", serviceId: "transport", title: "Vehicle insurance renewed", detail: "MH12 QR 4419, valid to 4 December 2026.", kind: "issued" },
  { id: "t7", at: "2026-03-18T14:00:00+05:30", serviceId: "mca", title: "Registered lease deed filed", detail: "INC-22 for Deshmukh Design Studio Pvt Ltd.", kind: "submitted" },
  { id: "t8", at: "2024-11-02T09:00:00+05:30", serviceId: "gov-core", title: "Current address updated and verified", detail: "Baner Road, Pune. Propagated to 4 departments with consent.", kind: "profile" },
];

export const SCHEMES: Scheme[] = [
  {
    id: "medcs",
    name: "Micro Enterprise Digital Credit Scheme",
    authority: "Ministry of Micro, Small and Medium Enterprises",
    serviceId: "umang",
    summary:
      "Collateral-free working capital of up to ₹10 lakh for GST-registered micro enterprises, at 4% interest subvention.",
    benefit: "Up to ₹10,00,000 · 4% interest subvention · no collateral",
    requires: [
      { attribute: "GST registration status", source: "GSTN" },
      { attribute: "Annual turnover band (band only, not exact figures)", source: "GSTN returns" },
      { attribute: "Company incorporation date", source: "MCA" },
      { attribute: "Existing government credit lines", source: "Ministry of MSME" },
    ],
    rules: [
      { label: "GST registration active for 12+ months", pass: true, detail: "Registered 18 Apr 2022 - 4 years 4 months." },
      { label: "Turnover under ₹5 crore", pass: true, detail: "Your turnover band is ₹1–2 crore." },
      { label: "Enterprise incorporated in India", pass: true, detail: "Deshmukh Design Studio Pvt Ltd, incorporated 9 Mar 2022." },
      { label: "No existing subvented credit line", pass: true, detail: "No active subvented facility found." },
      { label: "Udyam registration on record", pass: false, detail: "Not found. You can register during the application - it adds one step." },
    ],
    verdict: "partial",
    verdictLine:
      "You meet 4 of 5 conditions. The fifth - Udyam registration - can be completed inside the application itself.",
  },
];

export const SCHEME_MAP = Object.fromEntries(SCHEMES.map((s) => [s.id, s]));
