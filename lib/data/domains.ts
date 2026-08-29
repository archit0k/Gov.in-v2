/* ============================================================
   DOMAIN DATA
   The records a department owns and nobody else stores. This is
   the half of the architecture that does NOT move to shared
   infrastructure - Passport Seva keeps its appointment inventory
   and its fee schedule, IRCTC keeps its seats and its PNRs.
   All figures below are illustrative, for a fictional citizen.
   ============================================================ */

/* ---------------- Passport Seva ---------------- */

export const PASSPORT_FEES = [
  { service: "Reissue, 36 pages, normal", fee: 1500, time: "30–45 days" },
  { service: "Reissue, 60 pages, normal", fee: 2000, time: "30–45 days" },
  { service: "Reissue, 36 pages, tatkaal", fee: 3500, time: "7–10 days" },
  { service: "Fresh passport, 36 pages", fee: 1500, time: "30–45 days" },
  { service: "Replacement, lost or damaged", fee: 3000, time: "45–60 days" },
  { service: "Police Clearance Certificate", fee: 500, time: "15–20 days" },
];

export const PASSPORT_CHECKLIST = [
  {
    item: "Proof of identity",
    status: "held" as const,
    note: "Your Gov.in identity is high-assurance and verified in person. Nothing to carry.",
  },
  {
    item: "Proof of current address",
    status: "held" as const,
    note: "Verified in your profile since Nov 2024. Passport Seva reads it with your consent.",
  },
  {
    item: "Date of birth proof",
    status: "held" as const,
    note: "Already on your existing passport file.",
  },
  {
    item: "Parent details",
    status: "held" as const,
    note: "From your citizen graph, both verified.",
  },
  {
    item: "Old passport",
    status: "carry" as const,
    note: "Carry the physical booklet to the appointment. It is cancelled and returned to you.",
  },
  {
    item: "Annexure or affidavit",
    status: "not-needed" as const,
    note: "Not required for a straightforward reissue on expiry.",
  },
];

export const PSK_CENTRES = [
  { name: "POPSK Pune - Senapati Bapat Road", distance: "6 km", earliest: "2 Sep, 09:45", slots: 18, type: "Post Office PSK" },
  { name: "PSK Pune - Nigdi", distance: "11 km", earliest: "4 Sep, 09:15", slots: 42, type: "Passport Seva Kendra" },
  { name: "POPSK Pimpri-Chinchwad", distance: "18 km", earliest: "1 Sep, 10:30", slots: 9, type: "Post Office PSK" },
  { name: "PSK Mumbai - Lower Parel", distance: "148 km", earliest: "31 Aug, 08:30", slots: 63, type: "Passport Seva Kendra" },
];

export const PASSPORT_FAQ = [
  {
    q: "Why does this need no documents when the old form wanted eleven?",
    a: "Because the documents were never the point - the facts on them were. Passport Seva reads those facts from the departments that already verified them, with your consent, at the moment it needs them. You still carry your old booklet to the appointment.",
  },
  {
    q: "What actually happens at police verification?",
    a: "A local officer confirms you live at the address on the application. Because your address is already verified in your profile with a known jurisdiction, this is usually pre-approved and does not hold up dispatch.",
  },
  {
    q: "Does my passport number change on reissue?",
    a: "Yes. A reissued passport carries a new number, and the old booklet is cancelled and returned to you. Anything holding your old number - a valid visa, for instance - needs the old booklet as proof.",
  },
  {
    q: "Six months of validity - is that a rule?",
    a: "Not an Indian rule. Many destination countries require at least six months of validity remaining on arrival, which is why the reminder comes early rather than on the expiry date.",
  },
];

/* ---------------- IRCTC ---------------- */

export const TRIPS = [
  {
    pnr: "4521 887 190",
    train: "12617 Mangala Lakshadweep Exp",
    from: "Pune Jn",
    to: "Nashik Road",
    date: "2026-09-12",
    depart: "06:10",
    arrive: "10:25",
    cls: "AC 3-tier",
    status: "confirmed" as const,
    berths: ["B4 / 21 Lower", "B4 / 24 Side lower"],
    pax: ["Archit Deshmukh", "Meera Deshmukh"],
    fare: 1240,
  },
  {
    pnr: "2280 445 771",
    train: "11026 Bhusaval Exp",
    from: "Pune Jn",
    to: "Mumbai CSMT",
    date: "2026-06-04",
    depart: "09:40",
    arrive: "13:15",
    cls: "Chair car",
    status: "completed" as const,
    berths: ["C2 / 46"],
    pax: ["Archit Deshmukh"],
    fare: 495,
  },
  {
    pnr: "9910 236 004",
    train: "17617 Tapovan Exp",
    from: "Nashik Road",
    to: "Pune Jn",
    date: "2026-03-21",
    depart: "14:15",
    arrive: "18:30",
    cls: "AC 3-tier",
    status: "cancelled" as const,
    berths: [],
    pax: ["Archit Deshmukh", "Ramesh Deshmukh"],
    fare: 1180,
    refund: { amount: 885, at: "2026-03-22T11:04:00+05:30", note: "Cancelled 26 hours before departure. 25% retained." },
  },
];

export const POPULAR_ROUTES = [
  { from: "Pune Jn", to: "Mumbai CSMT", trains: 34, fastest: "3h 05m" },
  { from: "Pune Jn", to: "Nashik Road", trains: 9, fastest: "4h 15m" },
  { from: "Pune Jn", to: "Nagpur", trains: 12, fastest: "13h 40m" },
  { from: "Pune Jn", to: "Bengaluru SBC", trains: 7, fastest: "17h 20m" },
];

export const REFUND_RULES = [
  { window: "More than 48 hours before departure", retained: "₹200 per passenger", pct: 12 },
  { window: "Between 48 and 12 hours", retained: "25% of the fare", pct: 25 },
  { window: "Between 12 and 4 hours", retained: "50% of the fare", pct: 50 },
  { window: "Under 4 hours, or after chart preparation", retained: "No refund", pct: 100 },
  { window: "Train cancelled, or over 3 hours late", retained: "Nothing - full fare returns automatically", pct: 0 },
];

export const IRCTC_FAQ = [
  {
    q: "Why did it not ask for my wife's age and ID?",
    a: "Because she is in your citizen graph as a verified spouse with her own Gov.in identity. The booking carries an assertion that she is who she says she is, so there is nothing to check at boarding. A passenger outside your graph still has to be entered by hand.",
  },
  {
    q: "What does RAC really mean for me?",
    a: "You have a seat but share a berth until someone cancels. On this route and this train, RAC positions under 10 have confirmed in about nine of ten comparable bookings. That estimate is shown before you pay, not after.",
  },
  {
    q: "If the train is cancelled, do I have to claim the refund?",
    a: "No. A cancellation or a delay beyond three hours returns the full fare automatically to the account that paid, and the refund appears in your Gov.in timeline. You are not asked to apply for money you are owed.",
  },
  {
    q: "Where did the senior citizen concession come from?",
    a: "From the dates of birth already verified in your citizen graph. Concessions you qualify for are applied by default rather than being an option you have to know to look for.",
  },
];
