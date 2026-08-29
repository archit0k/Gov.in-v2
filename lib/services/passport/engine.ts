/* ============================================================
   PASSPORT SEVA - APPLICATION AND APPOINTMENT ENGINE

   The department's own domain: application types, the fee
   schedule, police verification rules, and the appointment
   inventory across Seva Kendras. Inventory in particular is the
   thing Gov.in could never hold - only the office that staffs
   the counters knows how many are open next Tuesday.

   Deterministic, so the same centre and date always answer the
   same way and a demo can be rehearsed.
   ============================================================ */

function hash(str: string) {
  let h = 2166136261 ^ str.length;
  for (let i = 0; i < str.length; i++) {
    h = Math.imul(h ^ str.charCodeAt(i), 16777619);
  }
  return () => {
    h = Math.imul(h ^ (h >>> 15), 2246822507);
    h = Math.imul(h ^ (h >>> 13), 3266489909);
    return ((h ^= h >>> 16) >>> 0) / 4294967296;
  };
}

/* ---------------- Application types ---------------- */

export type ServiceType = "reissue-expiry" | "reissue-pages" | "reissue-damage" | "fresh" | "pcc";
export type Scheme = "normal" | "tatkaal";
export type Booklet = 36 | 60;

export interface ApplicationType {
  id: ServiceType;
  name: string;
  detail: string;
  /** Whether the citizen already holds a passport this applies to. */
  needsExisting: boolean;
  /** Extra steps this variant triggers. */
  extras: string[];
  policeVerification: "post" | "pre" | "none";
}

export const APPLICATION_TYPES: ApplicationType[] = [
  {
    id: "reissue-expiry",
    name: "Reissue, expiring or expired",
    detail: "Your current passport is within a year of expiry, or has already expired.",
    needsExisting: true,
    extras: [],
    policeVerification: "post",
  },
  {
    id: "reissue-pages",
    name: "Reissue, pages exhausted",
    detail: "The booklet is full but still valid.",
    needsExisting: true,
    extras: [],
    policeVerification: "post",
  },
  {
    id: "reissue-damage",
    name: "Replacement, lost or damaged",
    detail: "Requires a police report and takes longer to decide.",
    needsExisting: true,
    extras: ["Police report reference", "Affidavit of loss"],
    policeVerification: "pre",
  },
  {
    id: "fresh",
    name: "First passport",
    detail: "No passport on record. Birth and address proof are checked at the Kendra.",
    needsExisting: false,
    extras: ["Proof of date of birth"],
    policeVerification: "pre",
  },
  {
    id: "pcc",
    name: "Police Clearance Certificate",
    detail: "For employment, residence or long-stay visas abroad.",
    needsExisting: true,
    extras: ["Destination country"],
    policeVerification: "pre",
  },
];

export const APPLICATION_TYPE_MAP = Object.fromEntries(
  APPLICATION_TYPES.map((a) => [a.id, a]),
) as Record<ServiceType, ApplicationType>;

/* ---------------- Fees ---------------- */

export interface FeeLine {
  label: string;
  amount: number;
}

export function feeFor(type: ServiceType, scheme: Scheme, booklet: Booklet, age: number): FeeLine[] {
  const lines: FeeLine[] = [];
  const minor = age < 15;

  if (type === "pcc") {
    lines.push({ label: "Police Clearance Certificate", amount: 500 });
    return lines;
  }

  if (type === "reissue-damage") {
    lines.push({ label: "Replacement of lost or damaged passport", amount: booklet === 60 ? 3500 : 3000 });
  } else if (minor) {
    lines.push({ label: "Passport for applicant under 15", amount: 1000 });
  } else {
    lines.push({
      label: `${type === "fresh" ? "Fresh passport" : "Reissue"}, ${booklet} pages`,
      amount: booklet === 60 ? 2000 : 1500,
    });
  }

  if (scheme === "tatkaal") lines.push({ label: "Tatkaal supplement", amount: 2000 });
  return lines;
}

export function feeTotal(lines: FeeLine[]) {
  return lines.reduce((n, l) => n + l.amount, 0);
}

export function processingDays(type: ServiceType, scheme: Scheme) {
  if (type === "pcc") return scheme === "tatkaal" ? "3 to 5 working days" : "12 to 20 working days";
  if (scheme === "tatkaal") return "3 to 7 working days after the appointment";
  if (type === "reissue-damage") return "45 to 60 days, decided after police verification";
  if (type === "fresh") return "30 to 45 days, including police verification";
  return "15 to 30 days, dispatch usually before police verification closes";
}

/* ---------------- Kendras and inventory ---------------- */

export interface Kendra {
  id: string;
  name: string;
  kind: "PSK" | "POPSK";
  address: string;
  city: string;
  km: number;
  /** Counters open per day; drives how many slots exist. */
  counters: number;
  jurisdiction: string;
}

export const KENDRAS: Kendra[] = [
  {
    id: "popsk-sbroad",
    name: "POPSK Pune, Senapati Bapat Road",
    kind: "POPSK",
    address: "Head Post Office building, Senapati Bapat Road",
    city: "Pune",
    km: 6,
    counters: 4,
    jurisdiction: "Pune City, wards 1 to 22",
  },
  {
    id: "psk-nigdi",
    name: "PSK Pune, Nigdi",
    kind: "PSK",
    address: "Bhakti Shakti Chowk, Nigdi",
    city: "Pune",
    km: 11,
    counters: 9,
    jurisdiction: "Pune Metropolitan Region",
  },
  {
    id: "popsk-pcmc",
    name: "POPSK Pimpri-Chinchwad",
    kind: "POPSK",
    address: "Post Office complex, Pimpri",
    city: "Pimpri-Chinchwad",
    km: 18,
    counters: 3,
    jurisdiction: "PCMC limits",
  },
  {
    id: "psk-solapur",
    name: "PSK Solapur",
    kind: "PSK",
    address: "Ashok Chowk, Solapur",
    city: "Solapur",
    km: 247,
    counters: 4,
    jurisdiction: "Solapur and Osmanabad districts",
  },
  {
    id: "psk-lowerparel",
    name: "PSK Mumbai, Lower Parel",
    kind: "PSK",
    address: "Marathon Futurex, Lower Parel",
    city: "Mumbai",
    km: 148,
    counters: 12,
    jurisdiction: "Mumbai City and Suburban",
  },
];

export const KENDRA_MAP = Object.fromEntries(KENDRAS.map((k) => [k.id, k])) as Record<string, Kendra>;

export interface Slot {
  time: string;
  free: number;
}

export interface DayInventory {
  date: string;
  weekday: string;
  open: boolean;
  closedReason?: string;
  slots: Slot[];
  total: number;
}

const WEEKDAY = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

/** Kendras run morning batches; Tatkaal holds a small separate quota. */
export function inventoryFor(kendraId: string, dateISO: string, scheme: Scheme): DayInventory {
  const k = KENDRA_MAP[kendraId];
  const d = new Date(dateISO + "T00:00:00");
  const dow = d.getDay();
  const weekday = WEEKDAY[dow];

  if (dow === 0) {
    return { date: dateISO, weekday, open: false, closedReason: "Closed on Sundays", slots: [], total: 0 };
  }
  if (dow === 6 && k.kind === "POPSK") {
    return {
      date: dateISO, weekday, open: false,
      closedReason: "Post Office Kendras do not run Saturday batches", slots: [], total: 0,
    };
  }

  const rnd = hash(`${kendraId}|${dateISO}|${scheme}`);
  const daysOut = Math.max(0, Math.round((d.getTime() - Date.now()) / 86_400_000));
  // Nearer dates are fuller. Tatkaal is a small ring-fenced quota.
  const fill = daysOut < 3 ? 0.97 : daysOut < 8 ? 0.86 : daysOut < 20 ? 0.62 : 0.35;
  const perSlot = scheme === "tatkaal" ? Math.max(1, Math.round(k.counters / 3)) : k.counters;

  const times = scheme === "tatkaal"
    ? ["09:00", "09:30", "10:00"]
    : ["09:15", "09:45", "10:15", "10:45", "11:15", "11:45", "12:15", "14:00", "14:30", "15:00"];

  const slots = times.map((time) => {
    const cap = perSlot;
    const taken = Math.min(cap, Math.round(cap * (fill * (0.7 + rnd() * 0.6))));
    return { time, free: Math.max(0, cap - taken) };
  });

  return { date: dateISO, weekday, open: true, slots, total: slots.reduce((n, s) => n + s.free, 0) };
}

/** The next `days` days of inventory for a Kendra, for the calendar strip. */
export function inventoryRange(kendraId: string, startISO: string, days: number, scheme: Scheme): DayInventory[] {
  const out: DayInventory[] = [];
  const start = new Date(startISO + "T00:00:00");
  for (let i = 0; i < days; i++) {
    const d = new Date(start.getTime() + i * 86_400_000);
    out.push(inventoryFor(kendraId, d.toISOString().slice(0, 10), scheme));
  }
  return out;
}

/** Earliest day with anything free, which is the only question most people have. */
export function earliestOpening(kendraId: string, scheme: Scheme) {
  const start = new Date(Date.now() + 86_400_000).toISOString().slice(0, 10);
  return inventoryRange(kendraId, start, 45, scheme).find((d) => d.open && d.total > 0) ?? null;
}

/* ---------------- What the citizen must carry ---------------- */

export interface CarryItem {
  item: string;
  status: "held" | "carry" | "extra";
  note: string;
}

export function carryList(type: ServiceType): CarryItem[] {
  const base: CarryItem[] = [
    { item: "Proof of identity", status: "held", note: "Your Gov.in identity is high assurance, verified in person in 2021." },
    { item: "Proof of current address", status: "held", note: "Verified in your profile since November 2024, read with your consent." },
    { item: "Parent details", status: "held", note: "From your citizen graph, both verified." },
  ];

  if (APPLICATION_TYPE_MAP[type].needsExisting) {
    base.push({ item: "Existing passport booklet", status: "carry", note: "Cancelled at the counter and returned to you." });
  }
  if (type === "fresh") {
    base.push({ item: "Proof of date of birth", status: "carry", note: "Birth certificate or school leaving certificate, original." });
  }
  if (type === "reissue-damage") {
    base.push({ item: "Police report", status: "carry", note: "Original FIR or lost-report acknowledgement." });
    base.push({ item: "Affidavit of loss", status: "extra", note: "Annexure F, on plain paper, signed at the counter." });
  }
  if (type === "pcc") {
    base.push({ item: "Visa or employment letter", status: "carry", note: "Evidence of why the certificate is needed." });
  }
  return base;
}

export function makeFileNumber(kendraId: string) {
  const rnd = hash(`${kendraId}|${Date.now()}`);
  const n = Math.floor(rnd() * 900000) + 100000;
  const yr = new Date().getFullYear();
  return `PN${String(n)}${String(yr).slice(2)}`;
}

export const APPOINTMENT_STATES = [
  "Submitted",
  "Documents verified",
  "Appointment",
  "Police verification",
  "Printed and dispatched",
];
