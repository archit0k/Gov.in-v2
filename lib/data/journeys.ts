import type { JourneyDef } from "@/lib/types";
import { LEGACY_TOTAL } from "@/lib/data/legacy";

/* ============================================================
   JOURNEY REGISTRY
   A journey is data, not a page. One runner renders all of them.
   That is the whole argument: a new government service is a
   registry entry, not a new website.
   ============================================================ */

export const JOURNEYS: JourneyDef[] = [
  /* ---------------- Passport ---------------- */
  {
    id: "passport-renewal",
    title: "Renew your passport",
    goal: "Get a new passport before the old one expires.",
    serviceId: "passport",
    composes: ["gov-core"],
    estMinutes: 4,
    legacyEquivalent: "Passport Seva — Fresh/Reissue application (Form 1)",
    legacyFields: LEGACY_TOTAL,
    outcome: "Application submitted and an appointment held at your chosen Seva Kendra.",
    caseStates: ["Submitted", "Documents verified", "Appointment", "Police verification", "Printed & dispatched"],
    tags: ["passport", "renew", "reissue", "travel", "expiry", "psk", "visa"],
    steps: [
      {
        id: "identity",
        title: "Confirm it is you",
        intent: "Passport Seva needs a high-assurance identity. You already have one.",
        assistPrompts: ["Why does this not need documents?", "What is identity assurance?"],
        fields: [
          { id: "name", kind: "prefilled", label: "Full name", sourcePath: "citizen.name", sourceLabel: "Verified government profile" },
          { id: "dob", kind: "prefilled", label: "Date of birth", sourcePath: "citizen.dob", sourceLabel: "Verified government profile" },
          { id: "assurance", kind: "prefilled", label: "Identity assurance", sourcePath: "citizen.assurance", sourceLabel: "Gov.in identity" },
          {
            id: "consent-parents",
            kind: "consent",
            label: "Parent details from your citizen graph",
            help: "Passport applications require parent names and places of birth. You have already given these to government once.",
            consent: {
              attribute: "Father and mother — name, date of birth, place of birth",
              requestedBy: "passport",
              purpose: "Statutory requirement for passport issue under the Passports Act",
              retention: "Held with your passport file only; not copied to other departments",
            },
            required: true,
          },
        ],
      },
      {
        id: "existing",
        title: "Your current passport",
        intent: "Reissue means we start from what you already hold.",
        assistPrompts: ["What changes on a reissue?", "Do I get a new passport number?"],
        fields: [
          { id: "passport-no", kind: "prefilled", label: "Passport number", sourcePath: "credential.passport", sourceLabel: "Passport Seva record" },
          { id: "passport-exp", kind: "prefilled", label: "Expires on", sourcePath: "credential.passport.expiry", sourceLabel: "Passport Seva record" },
          {
            id: "reason",
            kind: "radio",
            label: "Why are you reapplying?",
            required: true,
            options: [
              { value: "expiry", label: "It is expiring", hint: "Standard reissue" },
              { value: "pages", label: "Pages exhausted" },
              { value: "damage", label: "Lost or damaged", hint: "Adds a police report step" },
            ],
          },
          {
            id: "booklet",
            kind: "radio",
            label: "Booklet size",
            required: true,
            options: [
              { value: "36", label: "36 pages", hint: "₹1,500" },
              { value: "60", label: "60 pages", hint: "₹2,000 — for frequent travellers" },
            ],
          },
        ],
      },
      {
        id: "address",
        title: "Where should it be sent?",
        intent: "Your verified current address determines police verification jurisdiction.",
        assistPrompts: ["What is police verification?", "Can I use my permanent address instead?"],
        fields: [
          { id: "address", kind: "prefilled", label: "Current address", sourcePath: "address.current", sourceLabel: "Verified government profile · updated Nov 2024" },
          { id: "father", kind: "prefilled", label: "Father", sourcePath: "relationship.father", sourceLabel: "Citizen graph · verified" },
          { id: "mother", kind: "prefilled", label: "Mother", sourcePath: "relationship.mother", sourceLabel: "Citizen graph · verified" },
          { id: "spouse", kind: "prefilled", label: "Spouse", sourcePath: "relationship.spouse", sourceLabel: "Citizen graph · verified" },
          {
            id: "emergency",
            kind: "select",
            label: "Emergency contact",
            help: "Chosen from your citizen graph. Nobody types a phone number twice.",
            required: true,
            options: [
              { value: "spouse", label: "Meera Deshmukh — Spouse" },
              { value: "father", label: "Ramesh Deshmukh — Father" },
              { value: "other", label: "Someone else", hint: "We will need their details, because we do not hold them" },
            ],
          },
          {
            id: "emergency-name",
            kind: "text",
            label: "Their full name",
            placeholder: "As it appears on their ID",
            required: true,
            revealOn: { field: "emergency", value: "other" },
            help: "Asked only because this person is not in your citizen graph. If you add them later, no journey will ask again.",
          },
          {
            id: "emergency-relation",
            kind: "select",
            label: "How are they related to you?",
            required: true,
            revealOn: { field: "emergency", value: "other" },
            options: [
              { value: "sibling", label: "Brother or sister" },
              { value: "child", label: "Son or daughter" },
              { value: "relative", label: "Other relative" },
              { value: "friend", label: "Friend" },
              { value: "colleague", label: "Colleague" },
            ],
          },
          {
            id: "emergency-phone",
            kind: "text",
            label: "Their mobile number",
            placeholder: "+91",
            required: true,
            revealOn: { field: "emergency", value: "other" },
          },
          {
            id: "emergency-add",
            kind: "radio",
            label: "Add them to your citizen graph?",
            required: true,
            revealOn: { field: "emergency", value: "other" },
            options: [
              { value: "yes", label: "Yes, remember them", hint: "Every future journey can offer them without asking again" },
              { value: "no", label: "No, use them just this once" },
            ],
          },
        ],
      },
      {
        id: "appointment",
        title: "Pick your Seva Kendra slot",
        intent: "Slots are held the moment you pick one, not after payment clears.",
        assistPrompts: ["What do I carry to the appointment?", "Can I reschedule?"],
        fields: [
          {
            id: "psk",
            kind: "select",
            label: "Passport Seva Kendra",
            required: true,
            options: [
              { value: "pune-nigdi", label: "PSK Pune — Nigdi", hint: "11 km · earliest 4 Sep" },
              { value: "pune-senapati", label: "POPSK Pune — Senapati Bapat Road", hint: "6 km · earliest 2 Sep" },
              { value: "pimpri", label: "POPSK Pimpri-Chinchwad", hint: "18 km · earliest 1 Sep" },
            ],
          },
          { id: "slot", kind: "appointment", label: "Appointment slot", required: true },
        ],
      },
      {
        id: "pay",
        title: "Fee",
        intent: "One payment, one receipt, attached to the case.",
        fields: [
          { id: "fee", kind: "payment", label: "Passport reissue fee", amount: 1500, help: "36-page booklet, normal processing." },
        ],
      },
      {
        id: "review",
        title: "Review and submit",
        intent: "Everything that will be sent to the Ministry of External Affairs.",
        fields: [{ id: "review", kind: "review", label: "Review" }],
      },
    ],
  },

  /* ---------------- Transport ---------------- */
  {
    id: "dl-address-change",
    title: "Update the address on your driving licence",
    goal: "Make your licence match where you actually live.",
    serviceId: "transport",
    composes: ["gov-core"],
    estMinutes: 2,
    legacyEquivalent: "Parivahan — Form 33 / LLD address change, per-RTO",
    legacyFields: 31,
    outcome: "RTO Pune updates your licence record and reprints on request.",
    caseStates: ["Submitted", "RTO verification", "Record updated", "Card dispatched"],
    tags: ["licence", "license", "dl", "address", "rto", "parivahan", "moved", "shifted"],
    steps: [
      {
        id: "which",
        title: "Which records should change?",
        intent: "Your address lives in the shared profile. Departments subscribe to it.",
        assistPrompts: ["Will this change my RTO?", "Do I need a new card?"],
        fields: [
          { id: "dl", kind: "prefilled", label: "Driving licence", sourcePath: "credential.dl", sourceLabel: "RTO Pune record" },
          { id: "rc", kind: "prefilled", label: "Vehicle registration", sourcePath: "credential.rc", sourceLabel: "RTO Pune record" },
          {
            id: "scope",
            kind: "radio",
            label: "Apply the new address to",
            required: true,
            options: [
              { value: "both", label: "Licence and vehicle registration", hint: "Recommended — one submission, one fee" },
              { value: "dl", label: "Driving licence only" },
            ],
          },
        ],
      },
      {
        id: "address",
        title: "New address",
        intent: "Already verified. Nothing to type, nothing to upload.",
        fields: [
          { id: "new-address", kind: "prefilled", label: "New address", sourcePath: "address.current", sourceLabel: "Verified government profile" },
          {
            id: "consent-addr",
            kind: "consent",
            label: "Share verified address with Parivahan",
            consent: {
              attribute: "Current address (verified)",
              requestedBy: "transport",
              purpose: "Update licence and registration records; determine RTO jurisdiction",
              retention: "Stored in the RTO record for the life of the licence",
            },
            required: true,
          },
          { id: "reprint", kind: "radio", label: "Do you want a reprinted card?", required: true, options: [{ value: "yes", label: "Yes, post it to me", hint: "₹200" }, { value: "no", label: "No, digital record is enough", hint: "Free" }] },
        ],
      },
      { id: "review", title: "Review and submit", intent: "What Parivahan will receive.", fields: [{ id: "review", kind: "review", label: "Review" }] },
    ],
  },

  /* ---------------- EPFO ---------------- */
  {
    id: "epfo-transfer",
    title: "Move your PF from your old employer",
    goal: "Get every rupee into one account without chasing two HR departments.",
    serviceId: "epfo",
    estMinutes: 2,
    legacyEquivalent: "EPFO Member Portal — Form 13 online transfer claim",
    legacyFields: 24,
    outcome: "Transfer claim raised; both employers notified automatically.",
    caseStates: ["Claim raised", "Previous employer attests", "EPFO processing", "Credited"],
    tags: ["pf", "epf", "epfo", "provident", "transfer", "job change", "uan", "retirement"],
    steps: [
      {
        id: "accounts",
        title: "Your member accounts",
        intent: "You have two. That is the entire problem, and we can see both.",
        assistPrompts: ["Why do I have two accounts?", "Will I lose interest during transfer?"],
        fields: [
          { id: "uan", kind: "prefilled", label: "UAN", sourcePath: "credential.uan", sourceLabel: "EPFO member record" },
          { id: "current", kind: "prefilled", label: "Current employer", sourcePath: "employment.employer", sourceLabel: "EPFO member record" },
          { id: "balance", kind: "prefilled", label: "Total balance", sourcePath: "employment.balance", sourceLabel: "EPFO ledger · as of 31 Jul 2026" },
          {
            id: "from",
            kind: "radio",
            label: "Transfer from",
            required: true,
            options: [{ value: "prev", label: "Vantage Labs Pvt Ltd — ₹2,18,940", hint: "Member ID MHBAN00284710000341 · 2017–2023" }],
          },
        ],
      },
      {
        id: "attest",
        title: "Who attests the claim?",
        intent: "The legacy system makes you guess. The registry knows which employer is still active.",
        fields: [
          {
            id: "attestor",
            kind: "radio",
            label: "Attesting employer",
            required: true,
            options: [
              { value: "current", label: "Current employer — Lumen Systems", hint: "Recommended · digital signature registered, ~3 days" },
              { value: "prev", label: "Previous employer — Vantage Labs", hint: "Registered, but historically slower" },
            ],
          },
          { id: "nominee", kind: "prefilled", label: "Nominee on record", sourcePath: "relationship.nominee", sourceLabel: "Citizen graph · verified" },
        ],
      },
      { id: "review", title: "Review and submit", intent: "What EPFO will receive.", fields: [{ id: "review", kind: "review", label: "Review" }] },
    ],
  },

  /* ---------------- GST ---------------- */
  {
    id: "gst-address-amend",
    title: "Change your business address on GST",
    goal: "Amend the principal place of business without a rejection loop.",
    serviceId: "gst",
    estMinutes: 3,
    legacyEquivalent: "GST REG-14 — non-core/core amendment",
    legacyFields: 42,
    outcome: "REG-14 amendment filed; officer review clock starts.",
    caseStates: ["Filed", "Officer review", "Query window", "Approved"],
    tags: ["gst", "gstin", "business", "address", "amendment", "reg-14", "principal place"],
    steps: [
      {
        id: "entity",
        title: "Which registration?",
        intent: "Pulled from your credentials, not retyped.",
        assistPrompts: ["Is this a core or non-core amendment?", "How long does officer review take?"],
        fields: [
          { id: "gstin", kind: "prefilled", label: "GSTIN", sourcePath: "credential.gstin", sourceLabel: "GSTN registration record" },
          { id: "trade", kind: "prefilled", label: "Legal name of business", sourcePath: "business.name", sourceLabel: "MCA company register" },
          {
            id: "kind",
            kind: "radio",
            label: "What is changing?",
            required: true,
            options: [
              { value: "principal", label: "Principal place of business", hint: "Core amendment — officer approval needed" },
              { value: "additional", label: "Add an additional place of business" },
            ],
          },
        ],
      },
      {
        id: "proof",
        title: "Address and proof",
        intent: "Cross-department: the proof you filed with MCA satisfies GST too.",
        fields: [
          { id: "new-address", kind: "prefilled", label: "New principal place", sourcePath: "business.address", sourceLabel: "Verified government profile" },
          {
            id: "doc",
            kind: "document",
            label: "Ownership or tenancy proof",
            help: "You filed a registered lease with MCA in March 2026. GST accepts the same instrument.",
            required: true,
            options: [
              { value: "mca-lease", label: "Registered lease deed — from MCA filing", hint: "Verified · reused, not re-uploaded" },
              { value: "upload", label: "Upload a different document" },
            ],
          },
          {
            id: "consent-mca",
            kind: "consent",
            label: "Let GSTN read one MCA document",
            consent: {
              attribute: "Registered lease deed filed with MCA (INC-22)",
              requestedBy: "gst",
              purpose: "Evidence of principal place of business for REG-14",
              retention: "Reference only — GSTN reads it, it is not re-stored",
            },
            required: true,
          },
        ],
      },
      { id: "review", title: "Review and file", intent: "What GSTN will receive.", fields: [{ id: "review", kind: "review", label: "Review" }] },
    ],
  },

  /* ---------------- Income Tax ---------------- */
  {
    id: "itr-file",
    title: "File your income tax return",
    goal: "File correctly using what government already reported about you.",
    serviceId: "income-tax",
    estMinutes: 5,
    legacyEquivalent: "ITR-3 utility / online form with schedules",
    legacyFields: 190,
    outcome: "Return filed and e-verified; refund tracked as a case.",
    caseStates: ["Filed", "E-verified", "Processed u/s 143(1)", "Refund issued"],
    tags: ["itr", "income tax", "return", "refund", "tds", "26as", "tax", "assessment"],
    steps: [
      {
        id: "prefill",
        title: "What we already know you earned",
        intent: "Your employer, banks and clients already reported this. You are confirming, not declaring.",
        assistPrompts: ["Where does this data come from?", "What if a figure is wrong?"],
        fields: [
          { id: "pan", kind: "prefilled", label: "PAN", sourcePath: "credential.pan", sourceLabel: "Income Tax record" },
          { id: "salary", kind: "prefilled", label: "Salary income reported", sourceLabel: "Form 16 · Lumen Systems Pvt Ltd", sourcePath: "none" },
          { id: "business", kind: "prefilled", label: "Business receipts reported", sourceLabel: "GSTR-3B · Deshmukh Design Studio", sourcePath: "none" },
          { id: "tds", kind: "prefilled", label: "TDS already deducted", sourceLabel: "Form 26AS · 14 deductors", sourcePath: "none" },
        ],
      },
      {
        id: "regime",
        title: "Which tax regime?",
        intent: "We computed both. Pick the cheaper one.",
        assistPrompts: ["Explain new vs old regime for me", "Can I switch back next year?"],
        fields: [
          {
            id: "regime",
            kind: "radio",
            label: "Regime",
            required: true,
            options: [
              { value: "new", label: "New regime", hint: "Tax payable ₹1,84,600 — recommended" },
              { value: "old", label: "Old regime", hint: "Tax payable ₹2,01,300 with your declared deductions" },
            ],
          },
          { id: "deductions", kind: "note", label: "80C, 80D and home loan interest carried forward from last year are pre-applied to the old-regime figure." },
        ],
      },
      { id: "review", title: "Review and file", intent: "What CBDT will receive.", fields: [{ id: "review", kind: "review", label: "Review" }] },
    ],
  },

  /* ---------------- RTI ---------------- */
  {
    id: "rti-file",
    title: "File an RTI request",
    goal: "Ask a government body a question, worded so it cannot be dismissed.",
    serviceId: "rti",
    estMinutes: 3,
    legacyEquivalent: "RTI Online — a public authority tree with 2,000+ nodes and no guidance",
    legacyFields: 19,
    outcome: "Request filed with the correct PIO; the 30-day statutory clock has started.",
    caseStates: ["Filed", "With PIO", "Response due", "Responded"],
    tags: ["rti", "right to information", "information", "pio", "appeal", "transparency", "ask", "stalled"],
    steps: [
      {
        id: "question",
        title: "What do you want to know?",
        intent: "Write it the way you would say it out loud. Routing and wording are our job, not yours.",
        assistPrompts: ["What cannot be asked under RTI?", "What happens if they do not reply?"],
        fields: [
          {
            id: "subject",
            kind: "draft",
            label: "Your question",
            placeholder: "Why has the Baner Road stormwater drain work been stalled since March?",
            required: true,
            help: "Most RTI requests fail on wording, not on substance. You can have this put into statutory form — you will see both versions and choose.",
          },
        ],
      },
      {
        id: "scope",
        title: "What RTI can actually get you",
        intent: "The most common rejection is asking for the wrong kind of thing. Better to know now than in 30 days.",
        assistPrompts: ["Explain Section 8 exemptions", "Can I ask why a decision was taken?"],
        fields: [
          {
            id: "scope-note",
            kind: "note",
            label:
              "RTI compels an authority to give you information it already holds — files, notings, reports, correspondence, figures. It does not compel it to give opinions, justify a policy, answer hypotheticals, or create new analysis for you.",
          },
          {
            id: "exempt",
            kind: "radio",
            label: "Does your request touch any of these?",
            help: "Section 8 exemptions. Touching one does not mean automatic refusal, but it changes what the PIO is allowed to release.",
            required: true,
            options: [
              { value: "none", label: "None of these", hint: "Straightforward request" },
              { value: "personal", label: "Another person's personal information", hint: "Releasable only where there is a public interest" },
              { value: "investigation", label: "An ongoing investigation or prosecution" },
              { value: "commercial", label: "A third party's commercial confidence", hint: "Triggers third-party consultation, adds up to 40 days" },
            ],
          },
          {
            id: "format",
            kind: "radio",
            label: "How do you want the information?",
            required: true,
            options: [
              { value: "electronic", label: "Electronic copies", hint: "No further charge beyond the application fee" },
              { value: "certified", label: "Certified paper copies", hint: "₹2 per page, billed after the PIO responds" },
              { value: "inspection", label: "Inspect the records in person", hint: "First hour free" },
            ],
          },
        ],
      },
      {
        id: "route",
        title: "Where this goes",
        intent: "Choosing the wrong public authority is the second most common reason RTIs fail. The registry does it from your question.",
        assistPrompts: ["Why this authority and not the state department?", "What if it is the wrong one?"],
        fields: [
          {
            id: "authority",
            kind: "select",
            label: "Routed to",
            required: true,
            help: "Matched from the subject of your question and your verified location. You can override it.",
            options: [
              { value: "pmc", label: "Pune Municipal Corporation — PIO, Stormwater Drainage", hint: "Best match · holds the ward-level works files" },
              { value: "pwd", label: "Maharashtra PWD — PIO, Urban Roads", hint: "If the road is a state highway" },
              { value: "morth", label: "MoRTH — PIO, Urban Roads" },
              { value: "other", label: "Something else — help me find it" },
            ],
          },
          {
            id: "authority-other",
            kind: "textarea",
            label: "Which body do you think holds this?",
            placeholder: "The office, department or scheme you believe has the records",
            required: true,
            revealOn: { field: "authority", value: "other" },
            help: "You do not have to be right. If the request reaches the wrong authority, Section 6(3) obliges them to transfer it, and this case follows it there.",
          },
          {
            id: "transfer-note",
            kind: "note",
            label:
              "If this PIO does not hold the information, Section 6(3) obliges them to transfer the request to the authority that does, within five days. That transfer is tracked on this case — you will not have to file again.",
          },
        ],
      },
      {
        id: "applicant",
        title: "Applicant details and fee",
        intent: "Statutorily required. Already held, already verified.",
        fields: [
          { id: "name", kind: "prefilled", label: "Name", sourcePath: "citizen.name", sourceLabel: "Verified government profile" },
          { id: "address", kind: "prefilled", label: "Address for reply", sourcePath: "address.current", sourceLabel: "Verified government profile" },
          {
            id: "bpl",
            kind: "radio",
            label: "Are you claiming a BPL fee exemption?",
            required: true,
            options: [
              { value: "no", label: "No — pay the ₹10 fee" },
              { value: "yes", label: "Yes", hint: "Fee waived, verified against your BPL record. No card to upload." },
            ],
          },
          { id: "fee", kind: "payment", label: "RTI application fee", amount: 10, help: "Statutory fee under the RTI Rules." },
        ],
      },
      { id: "review", title: "Review and file", intent: "What the PIO will receive, and the clock it starts.", fields: [{ id: "review", kind: "review", label: "Review" }] },
    ],
  },

  /* ---------------- Cyber crime ---------------- */
  {
    id: "cyber-fraud-report",
    title: "Report financial fraud",
    goal: "Freeze the money before it leaves the banking system.",
    serviceId: "cybercrime",
    estMinutes: 2,
    legacyEquivalent: "cybercrime.gov.in — 6-page complaint form after login",
    legacyFields: 47,
    outcome: "Complaint registered, bank freeze request raised, acknowledgement number issued.",
    caseStates: ["Reported", "Freeze requested", "Under investigation", "Resolved"],
    tags: ["fraud", "scam", "cyber", "upi", "money", "phishing", "police", "otp", "cheated", "hacked"],
    steps: [
      {
        id: "urgent",
        title: "What happened, and when?",
        intent: "The first hour decides whether the money can be recovered. Everything else can wait.",
        assistPrompts: ["What happens after I report?", "Will I get my money back?"],
        fields: [
          {
            id: "type",
            kind: "radio",
            label: "Type of fraud",
            required: true,
            options: [
              { value: "upi", label: "UPI or bank transfer I did not authorise" },
              { value: "phish", label: "I was tricked into paying or sharing an OTP" },
              { value: "card", label: "Card fraud" },
              { value: "other", label: "Something else" },
            ],
          },
          { id: "amount", kind: "text", label: "Amount lost (₹)", placeholder: "48000", required: true },
          {
            id: "when",
            kind: "radio",
            label: "When?",
            required: true,
            options: [
              { value: "1h", label: "Within the last hour", hint: "Golden hour — freeze is likely to succeed" },
              { value: "24h", label: "Today" },
              { value: "old", label: "More than a day ago" },
            ],
          },
        ],
      },
      {
        id: "detail",
        title: "Where did the money go?",
        intent: "Enough for the bank freeze request. Nothing more, for now.",
        fields: [
          { id: "ref", kind: "text", label: "UPI reference or transaction ID", placeholder: "42••••••7781", required: true },
          { id: "narrative", kind: "textarea", label: "What happened, in your words", placeholder: "A caller said my electricity would be disconnected…" },
          { id: "contact", kind: "prefilled", label: "Contact for the investigating officer", sourcePath: "citizen.phone", sourceLabel: "Verified government profile" },
        ],
      },
      { id: "review", title: "Review and report", intent: "This goes to your state cyber cell and to the payee bank simultaneously.", fields: [{ id: "review", kind: "review", label: "Review" }] },
    ],
  },

  /* ---------------- CPGRAMS ---------------- */
  {
    id: "cpgrams-grievance",
    title: "Raise a grievance",
    goal: "Escalate a service that failed you, with the evidence attached.",
    serviceId: "cpgrams",
    estMinutes: 2,
    legacyEquivalent: "CPGRAMS — ministry/department/subordinate-office dropdown chain",
    legacyFields: 22,
    outcome: "Grievance registered against the correct nodal officer with an SLA clock.",
    caseStates: ["Registered", "With nodal officer", "Action taken", "Closed"],
    tags: ["grievance", "complaint", "cpgrams", "delay", "escalate", "pending", "no response"],
    steps: [
      {
        id: "what",
        title: "What went wrong?",
        intent: "Attach the case. The department, officer and history come with it.",
        assistPrompts: ["What can CPGRAMS actually do?", "How long do they have to respond?"],
        fields: [
          {
            id: "case",
            kind: "select",
            label: "Which government interaction?",
            required: true,
            help: "Your open cases are listed. A grievance without a case reference is why most get closed unresolved.",
            options: [
              { value: "case-gst", label: "GST registration amendment — filed 12 Aug 2026", hint: "Overdue by 4 days" },
              { value: "case-epfo", label: "EPFO transfer claim — filed 2 Aug 2026" },
              { value: "none", label: "Not related to an existing case" },
            ],
          },
          { id: "detail", kind: "textarea", label: "What should have happened?", placeholder: "The statutory review window closed on 24 August with no communication.", required: true },
        ],
      },
      {
        id: "route",
        title: "Where it goes",
        intent: "Derived from the case, not from a dropdown you have to decode.",
        fields: [
          { id: "nodal", kind: "prefilled", label: "Nodal officer", sourceLabel: "Service registry · GSTN Maharashtra grievance cell", sourcePath: "none" },
          { id: "sla", kind: "note", label: "Statutory response window: 21 days. You will be notified at day 15 if there is no movement, and first appeal will be offered automatically." },
        ],
      },
      { id: "review", title: "Review and register", intent: "What the nodal officer will receive.", fields: [{ id: "review", kind: "review", label: "Review" }] },
    ],
  },

  /* ---------------- IRCTC ---------------- */
  {
    id: "irctc-book",
    title: "Book a train",
    goal: "Get seats for the people you actually travel with.",
    serviceId: "irctc",
    estMinutes: 3,
    legacyEquivalent: "IRCTC - passenger details retyped every booking, refund rules discovered afterwards",
    legacyFields: 26,
    outcome: "Tickets booked and the PNR tracked in your timeline.",
    caseStates: ["Booked", "Chart prepared", "Journey complete"],
    tags: ["train", "irctc", "ticket", "rail", "railway", "pnr", "booking", "travel", "seat", "tatkal"],
    steps: [
      {
        id: "who",
        title: "Who is travelling?",
        intent: "Settled here, once, so the reservation system never has to ask.",
        assistPrompts: ["Do they need to carry ID?", "How do concessions work?"],
        fields: [
          {
            id: "pax",
            kind: "select",
            label: "Passengers",
            required: true,
            help: "From your citizen graph. Railways receives an assertion that these people are verified, not their records.",
            options: [
              { value: "self-spouse", label: "You and Meera Deshmukh (spouse)", hint: "Both verified, no ID check at boarding" },
              { value: "self", label: "Just you" },
              { value: "self-parents", label: "You, Ramesh and Sunanda Deshmukh", hint: "Senior citizen concession applied automatically" },
            ],
          },
        ],
      },
      {
        id: "book",
        title: "Choose the train",
        intent: "This part is Railways' own system, and it should be.",
        fields: [
          {
            id: "reservation",
            kind: "handoff",
            label: "Reserve on Indian Railways",
            handoff: {
              serviceId: "irctc",
              href: "/irctc/book",
              action: "Open the reservation system",
              does: [
                "Live availability, RAC and waitlist positions by class",
                "Fare with reservation, superfast, GST and concessions itemised",
                "Berth preference and coach allocation",
                "PNR issue and chart status",
              ],
            },
          },
        ],
      },
      { id: "review", title: "Review and book", intent: "Confirm before the seats are held.", fields: [{ id: "review", kind: "review", label: "Review" }] },
    ],
  },

  /* ---------------- MCA ---------------- */
  {
    id: "mca-dir3-kyc",
    title: "Complete your director KYC",
    goal: "Keep your DIN active before the deadline deactivates it.",
    serviceId: "mca",
    estMinutes: 1,
    legacyEquivalent: "MCA — DIR-3 KYC web form with DSC and professional certification",
    legacyFields: 17,
    outcome: "DIR-3 KYC filed; DIN stays active.",
    caseStates: ["Filed", "Verified", "DIN active"],
    tags: ["mca", "din", "director", "kyc", "dir-3", "company", "incorporation", "roc", "filing", "annual", "registrar"],
    steps: [
      {
        id: "confirm",
        title: "Confirm your director record",
        intent: "Annual KYC exists to check nothing changed. If nothing changed, this should take seconds.",
        assistPrompts: ["What happens if I miss the deadline?", "Why is this filed every year?"],
        fields: [
          { id: "din", kind: "prefilled", label: "DIN", sourcePath: "credential.din", sourceLabel: "MCA director register" },
          { id: "company", kind: "prefilled", label: "Company", sourcePath: "business.name", sourceLabel: "MCA company register" },
          { id: "address", kind: "prefilled", label: "Address on record", sourcePath: "address.current", sourceLabel: "Verified government profile" },
          { id: "changed", kind: "radio", label: "Has anything changed since last year?", required: true, options: [{ value: "no", label: "No, everything above is correct" }, { value: "yes", label: "Yes, something has changed" }] },
        ],
      },
      { id: "review", title: "Review and file", intent: "What the Registrar of Companies will receive.", fields: [{ id: "review", kind: "review", label: "Review" }] },
    ],
  },

  /* ---------------- Scheme ---------------- */
  {
    id: "scheme-apply",
    title: "Apply for the scheme",
    goal: "Enrol after you have checked eligibility yourself.",
    serviceId: "umang",
    estMinutes: 2,
    legacyEquivalent: "Scheme-specific portal with separate registration",
    legacyFields: 34,
    outcome: "Enrolment submitted to the implementing agency.",
    caseStates: ["Submitted", "Verification", "Enrolled"],
    tags: ["scheme", "subsidy", "benefit", "welfare", "apply", "enrol"],
    steps: [
      {
        id: "confirm",
        title: "Confirm your details",
        intent: "Everything the scheme needs is already verified.",
        fields: [
          { id: "name", kind: "prefilled", label: "Name", sourcePath: "citizen.name", sourceLabel: "Verified government profile" },
          { id: "gstin", kind: "prefilled", label: "GSTIN", sourcePath: "credential.gstin", sourceLabel: "GSTN registration record" },
          { id: "business", kind: "prefilled", label: "Enterprise", sourcePath: "business.name", sourceLabel: "MCA company register" },
          {
            id: "consent-scheme",
            kind: "consent",
            label: "Share turnover band with the implementing agency",
            consent: {
              attribute: "GST turnover band (not exact figures)",
              requestedBy: "umang",
              purpose: "Confirm the enterprise falls within the micro-enterprise threshold",
              retention: "Band only, held for the duration of the benefit",
            },
            required: true,
          },
        ],
      },
      { id: "review", title: "Review and apply", intent: "What the implementing agency will receive.", fields: [{ id: "review", kind: "review", label: "Review" }] },
    ],
  },
];

export const JOURNEY_MAP: Record<string, JourneyDef> = Object.fromEntries(
  JOURNEYS.map((j) => [j.id, j]),
);

export function journeysForService(serviceId: string) {
  return JOURNEYS.filter((j) => j.serviceId === serviceId);
}
