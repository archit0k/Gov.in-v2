import {
  CLASSES,
  STATION_MAP,
  TRAINS,
  TRAIN_MAP,
  type ClassCode,
  type Train,
  durationLabel,
  minutesToClock,
} from "./network";

/* ============================================================
   INDIAN RAILWAYS - RESERVATION ENGINE

   Availability, fares and allocation. Everything here is
   deterministic: the same train, date and class always returns
   the same answer, so a demo can be rehearsed and a judge who
   reloads sees what they saw before. It is generated rather than
   stored, but it is not random.
   ============================================================ */

/* ---------------- Deterministic seeding ---------------- */

function hash(str: string) {
  let h = 1779033703 ^ str.length;
  for (let i = 0; i < str.length; i++) {
    h = Math.imul(h ^ str.charCodeAt(i), 3432918353);
    h = (h << 13) | (h >>> 19);
  }
  return () => {
    h = Math.imul(h ^ (h >>> 16), 2246822507);
    h = Math.imul(h ^ (h >>> 13), 3266489909);
    return ((h ^= h >>> 16) >>> 0) / 4294967296;
  };
}

/* ---------------- Search ---------------- */

export interface Leg {
  train: Train;
  fromCode: string;
  toCode: string;
  departMins: number;
  arriveMins: number;
  durationMins: number;
  km: number;
  /** Days after departure that the train arrives. */
  nights: number;
}

export function dayOfWeek(dateISO: string) {
  return new Date(dateISO + "T00:00:00").getDay();
}

/** Trains that call at both stations, in the right order, running that day. */
export function searchTrains(fromCode: string, toCode: string, dateISO: string): Leg[] {
  if (!fromCode || !toCode || fromCode === toCode) return [];
  const dow = dayOfWeek(dateISO);

  const legs: Leg[] = [];
  for (const train of TRAINS) {
    const i = train.stops.findIndex((s) => s.code === fromCode);
    const j = train.stops.findIndex((s) => s.code === toCode);
    if (i === -1 || j === -1 || j <= i) continue;
    if (!train.days.includes(dow)) continue;

    const a = train.stops[i];
    const b = train.stops[j];
    const departMins = train.departs + a.arrive + (i === 0 ? 0 : a.halt);
    const arriveMins = train.departs + b.arrive;

    legs.push({
      train,
      fromCode,
      toCode,
      departMins,
      arriveMins,
      durationMins: arriveMins - departMins,
      km: b.km - a.km,
      nights: Math.floor(arriveMins / 1440),
    });
  }
  return legs.sort((x, y) => (x.departMins % 1440) - (y.departMins % 1440));
}

/* ---------------- Availability ---------------- */

export type Quota = "GN" | "TQ" | "LD" | "SS";

export const QUOTAS: { code: Quota; name: string; note: string }[] = [
  { code: "GN", name: "General", note: "Standard fare and standard allocation" },
  { code: "TQ", name: "Tatkal", note: "Opens 11:00 the day before. Higher fare, no refund once confirmed" },
  { code: "LD", name: "Ladies", note: "Reserved allocation for women travelling alone or with children under 12" },
  { code: "SS", name: "Senior citizen", note: "Lower berth preference for passengers over 60" },
];

export type AvailStatus = "AVAILABLE" | "RAC" | "WL" | "REGRET" | "NOT_OFFERED";

export interface Availability {
  cls: ClassCode;
  status: AvailStatus;
  /** Seats free, RAC position or waitlist position depending on status. */
  count: number;
  label: string;
  /** Estimated chance the ticket confirms before the chart is prepared. */
  chance: number | null;
  chanceLabel: string | null;
  fare: number;
}

/** Capacity a service actually carries in a class, before bookings. */
function capacity(train: Train, cls: ClassCode) {
  const base: Record<ClassCode, number> = {
    "1A": 24, "2A": 92, "3A": 192, "3E": 210, SL: 480, CC: 156, EC: 78, "2S": 208,
  };
  return train.premium ? Math.round(base[cls] * 0.8) : base[cls];
}

export function availabilityFor(leg: Leg, cls: ClassCode, quota: Quota, dateISO: string): Availability {
  const t = leg.train;
  if (!t.classes.includes(cls)) {
    return { cls, status: "NOT_OFFERED", count: 0, label: "Not offered", chance: null, chanceLabel: null, fare: 0 };
  }

  const rnd = hash(`${t.number}|${dateISO}|${cls}|${quota}|${leg.fromCode}${leg.toCode}`);
  const cap = capacity(t, cls);

  // How far out the journey is drives how full the train already is.
  const daysOut = Math.max(
    0,
    Math.round((new Date(dateISO + "T00:00:00").getTime() - Date.now()) / 86_400_000),
  );
  const pressure = daysOut > 45 ? 0.25 : daysOut > 20 ? 0.5 : daysOut > 7 ? 0.78 : daysOut > 2 ? 0.94 : 1.02;

  // Tatkal opens a small separate pool the day before; ladies and senior pools are tiny.
  const poolFactor = quota === "TQ" ? 0.07 : quota === "LD" ? 0.05 : quota === "SS" ? 0.04 : 1;
  const pool = Math.max(6, Math.round(cap * poolFactor));

  const booked = Math.round(pool * (pressure * (0.72 + rnd() * 0.5)));
  const free = pool - booked;
  const fare = fareFor(leg, cls, quota);

  if (free > 0) {
    return {
      cls, status: "AVAILABLE", count: free,
      label: `AVAILABLE ${free}`,
      chance: 1, chanceLabel: "Confirmed on booking", fare,
    };
  }

  // RAC exists only where berths do; chair cars go straight to waitlist.
  const racPool = CLASSES[cls].berths ? Math.round(pool * 0.08) : 0;
  const over = -free;

  if (over <= racPool) {
    const pos = Math.max(1, over);
    const chance = Math.min(0.97, 0.72 + (racPool - pos) / Math.max(1, racPool) * 0.25);
    return {
      cls, status: "RAC", count: pos,
      label: `RAC ${pos}`,
      chance,
      chanceLabel: `Confirms in about ${Math.round(chance * 10)} of 10 comparable bookings`,
      fare,
    };
  }

  const wl = over - racPool;
  const clearable = Math.round(pool * 0.16);
  if (wl > clearable * 2.4) {
    return {
      cls, status: "REGRET", count: wl,
      label: `WL ${wl} - regret`,
      chance: 0.03,
      chanceLabel: "Very unlikely to confirm. Booking is not advised",
      fare,
    };
  }
  const chance = Math.max(0.06, 0.82 - wl / Math.max(1, clearable) * 0.62);
  return {
    cls, status: "WL", count: wl,
    label: `WL ${wl}`,
    chance,
    chanceLabel:
      chance > 0.55
        ? `Confirms in about ${Math.round(chance * 10)} of 10 comparable bookings`
        : `Clears in roughly ${Math.round(chance * 100)}% of comparable bookings`,
    fare,
  };
}

export function allAvailability(leg: Leg, quota: Quota, dateISO: string): Availability[] {
  return leg.train.classes.map((c) => availabilityFor(leg, c, quota, dateISO));
}

/* ---------------- Fares ---------------- */

export interface FareBreakdown {
  base: number;
  reservation: number;
  superfast: number;
  tatkal: number;
  gst: number;
  catering: number;
  concession: number;
  total: number;
}

/** Distance slabs, the way the fare table actually works. */
function baseFare(km: number, rate: number, premium: boolean) {
  const slab = km <= 100 ? 0.62 : km <= 300 ? 0.5 : km <= 700 ? 0.42 : 0.36;
  return Math.round(km * slab * rate * (premium ? 1.18 : 1));
}

export function fareFor(leg: Leg, cls: ClassCode, quota: Quota) {
  return fareBreakdown(leg, cls, quota, 1, 0).total;
}

export function fareBreakdown(
  leg: Leg,
  cls: ClassCode,
  quota: Quota,
  passengers: number,
  seniors: number,
): FareBreakdown {
  const c = CLASSES[cls];
  const ac = ["1A", "2A", "3A", "3E", "CC", "EC"].includes(cls);
  const premium = !!leg.train.premium;

  const base = baseFare(leg.km, c.rate, premium) * passengers;
  const reservation = (cls === "2S" ? 15 : cls === "SL" ? 20 : cls === "CC" || cls === "3E" ? 40 : 60) * passengers;
  const superfast = leg.durationMins > 240 ? (cls === "2S" ? 15 : cls === "SL" ? 30 : 45) * passengers : 0;
  const tatkal = quota === "TQ" ? Math.round(base * 0.3) : 0;
  const catering = premium && leg.durationMins > 240 ? 245 * passengers : 0;
  const gst = ac ? Math.round((base + tatkal + catering) * 0.05) : 0;

  // Senior concession does not apply to Tatkal.
  const concession = quota === "TQ" ? 0 : Math.round((base / passengers) * 0.4 * seniors);

  const total = base + reservation + superfast + tatkal + catering + gst - concession;
  return { base, reservation, superfast, tatkal, gst, catering, concession, total: Math.max(0, total) };
}

/* ---------------- Allocation and PNR ---------------- */

export type BerthPref = "LB" | "MB" | "UB" | "SL" | "SU" | "ANY" | "W" | "A";

export const BERTH_PREFS: { code: BerthPref; label: string; berthsOnly: boolean }[] = [
  { code: "LB", label: "Lower", berthsOnly: true },
  { code: "MB", label: "Middle", berthsOnly: true },
  { code: "UB", label: "Upper", berthsOnly: true },
  { code: "SL", label: "Side lower", berthsOnly: true },
  { code: "SU", label: "Side upper", berthsOnly: true },
  { code: "W", label: "Window", berthsOnly: false },
  { code: "A", label: "Aisle", berthsOnly: false },
  { code: "ANY", label: "No preference", berthsOnly: false },
];

export interface AllocatedSeat {
  coach: string;
  number: number;
  berth: string;
}

const BERTH_CYCLE = ["Lower", "Middle", "Upper", "Lower", "Middle", "Upper", "Side lower", "Side upper"];

export function allocate(
  leg: Leg,
  cls: ClassCode,
  dateISO: string,
  count: number,
  pref: BerthPref,
): AllocatedSeat[] {
  const rnd = hash(`${leg.train.number}|${dateISO}|${cls}|alloc`);
  const prefix = cls === "SL" ? "S" : cls === "3A" || cls === "3E" ? "B" : cls === "2A" ? "A" : cls === "1A" ? "H" : "C";
  const coachNo = 1 + Math.floor(rnd() * (cls === "SL" ? 9 : 3));
  const start = 1 + Math.floor(rnd() * 40);

  const out: AllocatedSeat[] = [];
  for (let i = 0; i < count; i++) {
    const n = start + i;
    let berth = CLASSES[cls].berths ? BERTH_CYCLE[(n - 1) % 8] : n % 3 === 0 ? "Aisle" : "Window";
    // Honour the preference for the first passenger where the class allows it.
    if (i === 0 && pref !== "ANY") {
      const wanted = BERTH_PREFS.find((b) => b.code === pref)?.label;
      if (wanted && (CLASSES[cls].berths || !BERTH_PREFS.find((b) => b.code === pref)!.berthsOnly)) berth = wanted;
    }
    out.push({ coach: `${prefix}${coachNo}`, number: n, berth });
  }
  return out;
}

export function makePnr(trainNo: string, dateISO: string) {
  const rnd = hash(`${trainNo}|${dateISO}|${Date.now()}`);
  const n = Math.floor(rnd() * 9_000_000_000) + 1_000_000_000;
  const s = String(n);
  return `${s.slice(0, 4)} ${s.slice(4, 7)} ${s.slice(7)}`;
}

/* ---------------- Presentation helpers ---------------- */

export function legLabel(leg: Leg) {
  const from = STATION_MAP[leg.fromCode];
  const to = STATION_MAP[leg.toCode];
  return `${from?.name ?? leg.fromCode} to ${to?.name ?? leg.toCode}`;
}

export function legTimes(leg: Leg) {
  return {
    depart: minutesToClock(leg.departMins),
    arrive: minutesToClock(leg.arriveMins),
    duration: durationLabel(leg.durationMins),
    nights: leg.nights,
  };
}

export { TRAIN_MAP, CLASSES };
