import type { Citizen } from "@/lib/types";

/* ============================================================
   DEMO CITIZEN - entirely fictional.
   Rich enough that the infrastructure has something real to do:
   verified addresses, credentials with expiry, a citizen graph,
   an employer, and a business relationship.
   ============================================================ */

export const CITIZEN: Citizen = {
  id: "CIT-4471-9082-3316",
  name: "Archit Deshmukh",
  shortName: "Archit",
  dob: "1994-03-12",
  gender: "Male",
  phone: "+91 98••• ••214",
  email: "archit.d••••@mail.in",
  photoInitials: "AD",
  identityAssurance: "high",
  verifiedOn: "2021-06-08",
  languages: ["English", "मराठी", "हिन्दी"],
  addresses: [
    {
      id: "addr-current",
      label: "current",
      line1: "402, Sunview Residency",
      line2: "Baner Road",
      city: "Pune",
      state: "Maharashtra",
      pin: "411045",
      verification: "verified",
      source: "Verified government profile",
      updatedAt: "2024-11-02",
    },
    {
      id: "addr-permanent",
      label: "permanent",
      line1: "Deshmukh Wada, Plot 17",
      line2: "Shivaji Nagar",
      city: "Nashik",
      state: "Maharashtra",
      pin: "422005",
      verification: "verified",
      source: "Verified government profile",
      updatedAt: "2019-01-20",
    },
  ],
  credentials: [
    {
      id: "cred-passport",
      kind: "passport",
      title: "Indian Passport",
      number: "Z••••782",
      issuer: "Regional Passport Office, Pune",
      serviceId: "passport",
      issuedOn: "2016-10-14",
      expiresOn: "2026-10-13",
      status: "expiring",
      meta: { Type: "Ordinary", "File number": "PN1054126816", Pages: "36" },
    },
    {
      id: "cred-dl",
      kind: "driving-licence",
      title: "Driving Licence",
      number: "MH12 2015••••931",
      issuer: "RTO Pune (MH12)",
      serviceId: "transport",
      issuedOn: "2015-08-22",
      expiresOn: "2035-08-21",
      status: "active",
      meta: { Class: "LMV, MCWG", "Blood group": "B+" },
    },
    {
      id: "cred-rc",
      kind: "vehicle-rc",
      title: "Vehicle Registration",
      number: "MH12 QR 4419",
      issuer: "RTO Pune (MH12)",
      serviceId: "transport",
      issuedOn: "2021-02-11",
      expiresOn: "2036-02-10",
      status: "active",
      meta: { Vehicle: "Maruti Baleno", Fuel: "Petrol", "Insurance valid to": "2026-12-04" },
    },
    {
      id: "cred-pan",
      kind: "pan",
      title: "PAN",
      number: "AB••••4419F",
      issuer: "Income Tax Department",
      serviceId: "income-tax",
      issuedOn: "2013-07-30",
      status: "active",
      meta: { "Linked to Aadhaar": "Yes" },
    },
    {
      id: "cred-gstin",
      kind: "gstin",
      title: "GSTIN",
      number: "27AB••••4419F1Z8",
      issuer: "GSTN, Maharashtra",
      serviceId: "gst",
      issuedOn: "2022-04-18",
      status: "active",
      meta: { "Trade name": "Deshmukh Design Studio", "Return type": "Quarterly (QRMP)" },
    },
    {
      id: "cred-uan",
      kind: "uan",
      title: "Universal Account Number",
      number: "1014••••7723",
      issuer: "EPFO",
      serviceId: "epfo",
      issuedOn: "2017-05-02",
      status: "active",
      meta: { "Member IDs": "2 (1 previous employer)", Balance: "₹8,42,160" },
    },
    {
      id: "cred-din",
      kind: "din",
      title: "Director Identification Number",
      number: "09••••41",
      issuer: "Ministry of Corporate Affairs",
      serviceId: "mca",
      issuedOn: "2022-03-09",
      status: "active",
      meta: { Company: "Deshmukh Design Studio Pvt Ltd", "DIR-3 KYC due": "2026-09-30" },
    },
  ],
  relationships: [
    {
      id: "rel-father",
      relation: "father",
      name: "Ramesh Deshmukh",
      dob: "1963-11-04",
      verification: "verified",
      sharesWith: ["passport", "mca"],
      attributes: { "Place of birth": "Nashik, Maharashtra", Nationality: "Indian" },
    },
    {
      id: "rel-mother",
      relation: "mother",
      name: "Sunanda Deshmukh",
      dob: "1967-02-19",
      verification: "verified",
      sharesWith: ["passport"],
      attributes: { "Place of birth": "Kolhapur, Maharashtra", Nationality: "Indian" },
    },
    {
      id: "rel-spouse",
      relation: "spouse",
      name: "Meera Deshmukh",
      dob: "1995-09-27",
      verification: "verified",
      sharesWith: ["passport", "epfo", "irctc"],
      attributes: { "Married since": "2023-02-11", "Own Gov.in identity": "Yes" },
    },
    {
      id: "rel-nominee",
      relation: "nominee",
      name: "Meera Deshmukh",
      verification: "verified",
      sharesWith: ["epfo"],
      attributes: { Share: "100%", "Declared on": "2023-03-04" },
    },
  ],
  employment: {
    employer: "Lumen Systems Pvt Ltd",
    since: "2023-07-03",
    uan: "1014••••7723",
    monthlyContribution: "₹7,200",
  },
};

/** Dot-path read used by prefilled journey fields and the AI tool layer. */
export function readProfile(path: string, c: Citizen = CITIZEN): string {
  const map: Record<string, () => string> = {
    "citizen.name": () => c.name,
    "citizen.dob": () => formatDate(c.dob),
    "citizen.gender": () => c.gender,
    "citizen.phone": () => c.phone,
    "citizen.email": () => c.email,
    "citizen.assurance": () => `${c.identityAssurance} assurance, verified ${formatDate(c.verifiedOn)}`,
    "address.current": () => addressLine(0, c),
    "address.permanent": () => addressLine(1, c),
    "address.current.city": () => c.addresses[0].city,
    "address.current.state": () => c.addresses[0].state,
    "address.current.pin": () => c.addresses[0].pin,
    "credential.passport": () => cred("cred-passport", c),
    "credential.passport.expiry": () => formatDate(c.credentials[0].expiresOn!),
    "credential.dl": () => cred("cred-dl", c),
    "credential.rc": () => cred("cred-rc", c),
    "credential.pan": () => cred("cred-pan", c),
    "credential.gstin": () => cred("cred-gstin", c),
    "credential.uan": () => cred("cred-uan", c),
    "credential.din": () => cred("cred-din", c),
    "relationship.father": () => rel("rel-father", c),
    "relationship.mother": () => rel("rel-mother", c),
    "relationship.spouse": () => rel("rel-spouse", c),
    "relationship.nominee": () => `${rel("rel-nominee", c)} · 100% share`,
    "employment.employer": () => c.employment.employer,
    "employment.since": () => `Since ${formatDate(c.employment.since)}`,
    "employment.balance": () => "₹8,42,160 across 2 member IDs",
    "business.name": () => "Deshmukh Design Studio Pvt Ltd",
    "business.address": () => addressLine(0, c),
  };
  return map[path]?.() ?? "-";
}

function cred(id: string, c: Citizen) {
  const x = c.credentials.find((k) => k.id === id);
  return x ? `${x.number}` : "-";
}
function rel(id: string, c: Citizen) {
  const x = c.relationships.find((k) => k.id === id);
  return x ? x.name : "-";
}
function addressLine(i: number, c: Citizen) {
  const a = c.addresses[i];
  return `${a.line1}, ${a.line2 ? a.line2 + ", " : ""}${a.city}, ${a.state} ${a.pin}`;
}

export function formatDate(iso: string) {
  const d = new Date(iso + (iso.length === 10 ? "T00:00:00" : ""));
  return d.toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
}

export function daysUntil(iso: string) {
  const d = new Date(iso + "T00:00:00").getTime();
  return Math.round((d - Date.now()) / 86_400_000);
}
