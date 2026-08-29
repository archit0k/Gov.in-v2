/* ============================================================
   INDIAN RAILWAYS - NETWORK DATA
   Stations, trains, schedules and class inventory.

   This is the department's own domain data. Gov.in never stores
   any of it: seat inventory, schedules and PNRs belong to
   Railways, exactly as licence records belong to the RTO. The
   infrastructure carries identity, consent, payment and the case
   record, and nothing else crosses the line.

   Figures are representative of real services on these routes
   but are invented for this prototype.
   ============================================================ */

export interface Station {
  code: string;
  name: string;
  city: string;
  state: string;
  /** Rough popularity, used to order autocomplete sensibly. */
  rank: number;
}

export const STATIONS: Station[] = [
  { code: "PUNE", name: "Pune Junction", city: "Pune", state: "Maharashtra", rank: 9 },
  { code: "SVJR", name: "Shivajinagar", city: "Pune", state: "Maharashtra", rank: 4 },
  { code: "CSMT", name: "Mumbai CSMT", city: "Mumbai", state: "Maharashtra", rank: 10 },
  { code: "LTT", name: "Lokmanya Tilak Terminus", city: "Mumbai", state: "Maharashtra", rank: 8 },
  { code: "DR", name: "Dadar", city: "Mumbai", state: "Maharashtra", rank: 8 },
  { code: "NSK", name: "Nashik Road", city: "Nashik", state: "Maharashtra", rank: 6 },
  { code: "NGP", name: "Nagpur Junction", city: "Nagpur", state: "Maharashtra", rank: 8 },
  { code: "SUR", name: "Solapur Junction", city: "Solapur", state: "Maharashtra", rank: 5 },
  { code: "KOP", name: "Kolhapur SCT", city: "Kolhapur", state: "Maharashtra", rank: 5 },
  { code: "ADI", name: "Ahmedabad Junction", city: "Ahmedabad", state: "Gujarat", rank: 8 },
  { code: "ST", name: "Surat", city: "Surat", state: "Gujarat", rank: 6 },
  { code: "NDLS", name: "New Delhi", city: "Delhi", state: "Delhi", rank: 10 },
  { code: "NZM", name: "Hazrat Nizamuddin", city: "Delhi", state: "Delhi", rank: 7 },
  { code: "SBC", name: "KSR Bengaluru", city: "Bengaluru", state: "Karnataka", rank: 9 },
  { code: "YPR", name: "Yesvantpur Junction", city: "Bengaluru", state: "Karnataka", rank: 6 },
  { code: "MAS", name: "MGR Chennai Central", city: "Chennai", state: "Tamil Nadu", rank: 9 },
  { code: "HYB", name: "Hyderabad Deccan", city: "Hyderabad", state: "Telangana", rank: 7 },
  { code: "SC", name: "Secunderabad Junction", city: "Hyderabad", state: "Telangana", rank: 8 },
  { code: "HWH", name: "Howrah Junction", city: "Kolkata", state: "West Bengal", rank: 9 },
  { code: "BBS", name: "Bhubaneswar", city: "Bhubaneswar", state: "Odisha", rank: 6 },
  { code: "JP", name: "Jaipur Junction", city: "Jaipur", state: "Rajasthan", rank: 7 },
  { code: "LKO", name: "Lucknow Charbagh", city: "Lucknow", state: "Uttar Pradesh", rank: 7 },
  { code: "BSB", name: "Banaras", city: "Varanasi", state: "Uttar Pradesh", rank: 6 },
  { code: "PNBE", name: "Patna Junction", city: "Patna", state: "Bihar", rank: 7 },
  { code: "ERS", name: "Ernakulam Junction", city: "Kochi", state: "Kerala", rank: 6 },
  { code: "TVC", name: "Thiruvananthapuram Central", city: "Thiruvananthapuram", state: "Kerala", rank: 6 },
  { code: "GOA", name: "Madgaon Junction", city: "Madgaon", state: "Goa", rank: 6 },
  { code: "BPL", name: "Bhopal Junction", city: "Bhopal", state: "Madhya Pradesh", rank: 6 },
  { code: "INDB", name: "Indore Junction", city: "Indore", state: "Madhya Pradesh", rank: 6 },
  { code: "ASR", name: "Amritsar Junction", city: "Amritsar", state: "Punjab", rank: 6 },
  { code: "CDG", name: "Chandigarh", city: "Chandigarh", state: "Chandigarh", rank: 6 },
  { code: "DDN", name: "Dehradun", city: "Dehradun", state: "Uttarakhand", rank: 5 },
  { code: "GHY", name: "Guwahati", city: "Guwahati", state: "Assam", rank: 6 },
];

export const STATION_MAP: Record<string, Station> = Object.fromEntries(
  STATIONS.map((s) => [s.code, s]),
);

/** Ordered matches for the station autocomplete. Code, name and city all match. */
export function searchStations(q: string, limit = 7): Station[] {
  const t = q.trim().toLowerCase();
  if (!t) return [...STATIONS].sort((a, b) => b.rank - a.rank).slice(0, limit);
  return STATIONS.map((s) => {
    const code = s.code.toLowerCase();
    const name = s.name.toLowerCase();
    const city = s.city.toLowerCase();
    let score = 0;
    if (code === t) score = 100;
    else if (code.startsWith(t)) score = 80;
    else if (city.startsWith(t)) score = 70;
    else if (name.startsWith(t)) score = 65;
    else if (city.includes(t)) score = 45;
    else if (name.includes(t)) score = 40;
    else if (code.includes(t)) score = 30;
    return { s, score: score ? score + s.rank : 0 };
  })
    .filter((x) => x.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map((x) => x.s);
}

/* ---------------- Classes ---------------- */

export type ClassCode = "1A" | "2A" | "3A" | "3E" | "SL" | "CC" | "EC" | "2S";

export interface TravelClass {
  code: ClassCode;
  name: string;
  short: string;
  /** Fare multiplier applied to the distance-based base fare. */
  rate: number;
  berths: boolean;
  note: string;
}

export const CLASSES: Record<ClassCode, TravelClass> = {
  "1A": { code: "1A", name: "AC First Class", short: "1A", rate: 4.6, berths: true, note: "Lockable cabins, bedding included" },
  "2A": { code: "2A", name: "AC 2 Tier", short: "2A", rate: 2.7, berths: true, note: "Two berths per bay, curtained, bedding included" },
  "3A": { code: "3A", name: "AC 3 Tier", short: "3A", rate: 1.9, berths: true, note: "Three berths per bay, bedding included" },
  "3E": { code: "3E", name: "AC 3 Tier Economy", short: "3E", rate: 1.7, berths: true, note: "Same as 3A with a tighter berth pitch" },
  SL: { code: "SL", name: "Sleeper", short: "SL", rate: 0.75, berths: true, note: "Non air-conditioned, open windows" },
  CC: { code: "CC", name: "AC Chair Car", short: "CC", rate: 1.55, berths: false, note: "Seated, for daytime journeys" },
  EC: { code: "EC", name: "Executive Chair Car", short: "EC", rate: 3.1, berths: false, note: "Wider seated, daytime only" },
  "2S": { code: "2S", name: "Second Sitting", short: "2S", rate: 0.4, berths: false, note: "Unreserved-style seating, reserved seat" },
};

/* ---------------- Trains ---------------- */

export interface TrainStop {
  code: string;
  /** Minutes from origin departure. */
  arrive: number;
  halt: number;
  /** Kilometres from origin. */
  km: number;
}

export interface Train {
  number: string;
  name: string;
  /** 0 = Sunday. */
  days: number[];
  /** Departure from the origin, minutes past midnight. */
  departs: number;
  classes: ClassCode[];
  stops: TrainStop[];
  pantry: boolean;
  /** Rajdhani / Vande Bharat style services carry a higher base. */
  premium?: boolean;
}

const hhmm = (h: number, m: number) => h * 60 + m;

export const TRAINS: Train[] = [
  {
    number: "12617",
    name: "Mangala Lakshadweep Express",
    days: [0, 1, 2, 3, 4, 5, 6],
    departs: hhmm(6, 10),
    classes: ["2A", "3A", "SL"],
    pantry: true,
    stops: [
      { code: "PUNE", arrive: 0, halt: 0, km: 0 },
      { code: "NSK", arrive: 255, halt: 5, km: 211 },
      { code: "BPL", arrive: 915, halt: 10, km: 862 },
      { code: "NDLS", arrive: 1590, halt: 0, km: 1534 },
    ],
  },
  {
    number: "11026",
    name: "Pune Bhusaval Express",
    days: [0, 1, 2, 3, 4, 5, 6],
    departs: hhmm(9, 40),
    classes: ["3A", "SL", "2S"],
    pantry: false,
    stops: [
      { code: "PUNE", arrive: 0, halt: 0, km: 0 },
      { code: "NSK", arrive: 310, halt: 5, km: 211 },
    ],
  },
  {
    number: "17617",
    name: "Tapovan Express",
    days: [1, 2, 3, 4, 5, 6],
    departs: hhmm(14, 15),
    classes: ["CC", "2S"],
    pantry: false,
    stops: [
      { code: "PUNE", arrive: 0, halt: 0, km: 0 },
      { code: "NSK", arrive: 255, halt: 0, km: 211 },
    ],
  },
  {
    number: "12123",
    name: "Deccan Queen",
    days: [0, 1, 2, 3, 4, 5, 6],
    departs: hhmm(7, 15),
    classes: ["EC", "CC", "2S"],
    pantry: true,
    stops: [
      { code: "PUNE", arrive: 0, halt: 0, km: 0 },
      { code: "DR", arrive: 185, halt: 3, km: 178 },
      { code: "CSMT", arrive: 205, halt: 0, km: 192 },
    ],
  },
  {
    number: "12127",
    name: "Intercity Express",
    days: [0, 1, 2, 3, 4, 5, 6],
    departs: hhmm(15, 40),
    classes: ["CC", "2S"],
    pantry: false,
    stops: [
      { code: "PUNE", arrive: 0, halt: 0, km: 0 },
      { code: "DR", arrive: 190, halt: 3, km: 178 },
      { code: "CSMT", arrive: 212, halt: 0, km: 192 },
    ],
  },
  {
    number: "22945",
    name: "Saurashtra Mail",
    days: [0, 1, 2, 3, 4, 5, 6],
    departs: hhmm(21, 25),
    classes: ["1A", "2A", "3A", "SL"],
    pantry: true,
    stops: [
      { code: "PUNE", arrive: 0, halt: 0, km: 0 },
      { code: "CSMT", arrive: 235, halt: 20, km: 192 },
      { code: "ST", arrive: 545, halt: 5, km: 455 },
      { code: "ADI", arrive: 815, halt: 0, km: 715 },
    ],
  },
  {
    number: "11301",
    name: "Udyan Express",
    days: [0, 1, 2, 3, 4, 5, 6],
    departs: hhmm(16, 5),
    classes: ["2A", "3A", "SL"],
    pantry: true,
    stops: [
      { code: "PUNE", arrive: 0, halt: 0, km: 0 },
      { code: "SUR", arrive: 285, halt: 10, km: 265 },
      { code: "SBC", arrive: 1150, halt: 0, km: 1060 },
    ],
  },
  {
    number: "12629",
    name: "Karnataka Sampark Kranti",
    days: [1, 4, 6],
    departs: hhmm(19, 50),
    classes: ["2A", "3A", "SL"],
    pantry: true,
    premium: true,
    stops: [
      { code: "PUNE", arrive: 0, halt: 0, km: 0 },
      { code: "SBC", arrive: 1085, halt: 0, km: 1060 },
    ],
  },
  {
    number: "22119",
    name: "Karmali Tejas Express",
    days: [0, 2, 3, 5, 6],
    departs: hhmm(5, 25),
    classes: ["EC", "CC"],
    pantry: true,
    premium: true,
    stops: [
      { code: "CSMT", arrive: 0, halt: 0, km: 0 },
      { code: "GOA", arrive: 525, halt: 0, km: 588 },
    ],
  },
  {
    number: "12951",
    name: "Mumbai Rajdhani",
    days: [0, 1, 2, 3, 4, 5, 6],
    departs: hhmm(17, 0),
    classes: ["1A", "2A", "3A"],
    pantry: true,
    premium: true,
    stops: [
      { code: "CSMT", arrive: 0, halt: 0, km: 0 },
      { code: "ST", arrive: 175, halt: 5, km: 263 },
      { code: "NDLS", arrive: 950, halt: 0, km: 1384 },
    ],
  },
  {
    number: "12009",
    name: "Shatabdi Express",
    days: [1, 2, 3, 4, 5, 6],
    departs: hhmm(6, 25),
    classes: ["EC", "CC"],
    pantry: true,
    premium: true,
    stops: [
      { code: "CSMT", arrive: 0, halt: 0, km: 0 },
      { code: "ST", arrive: 170, halt: 5, km: 263 },
      { code: "ADI", arrive: 400, halt: 0, km: 492 },
    ],
  },
  {
    number: "12622",
    name: "Tamil Nadu Express",
    days: [0, 1, 2, 3, 4, 5, 6],
    departs: hhmm(22, 30),
    classes: ["1A", "2A", "3A", "SL"],
    pantry: true,
    stops: [
      { code: "NDLS", arrive: 0, halt: 0, km: 0 },
      { code: "BPL", arrive: 480, halt: 10, km: 701 },
      { code: "MAS", arrive: 1920, halt: 0, km: 2180 },
    ],
  },
  {
    number: "12649",
    name: "Sampark Kranti Express",
    days: [2, 5],
    departs: hhmm(11, 20),
    classes: ["2A", "3A", "SL"],
    pantry: true,
    stops: [
      { code: "NZM", arrive: 0, halt: 0, km: 0 },
      { code: "SBC", arrive: 2015, halt: 0, km: 2365 },
    ],
  },
  {
    number: "12860",
    name: "Gitanjali Express",
    days: [0, 1, 2, 3, 4, 5, 6],
    departs: hhmm(6, 0),
    classes: ["2A", "3A", "SL"],
    pantry: true,
    stops: [
      { code: "CSMT", arrive: 0, halt: 0, km: 0 },
      { code: "NGP", arrive: 890, halt: 10, km: 837 },
      { code: "HWH", arrive: 1830, halt: 0, km: 1968 },
    ],
  },
];

export const TRAIN_MAP: Record<string, Train> = Object.fromEntries(TRAINS.map((t) => [t.number, t]));

export function minutesToClock(mins: number) {
  const m = ((mins % 1440) + 1440) % 1440;
  return `${String(Math.floor(m / 60)).padStart(2, "0")}:${String(m % 60).padStart(2, "0")}`;
}

export function durationLabel(mins: number) {
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  return m ? `${h}h ${m}m` : `${h}h`;
}

export const DAY_NAMES = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
