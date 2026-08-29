/* ============================================================
   GOV.IN — Core infrastructure types
   These are the shared primitives every department builds on.
   Departments own their DOMAIN data; the infrastructure owns
   identity, journeys, cases, events and consent.
   ============================================================ */

/* ---------- Identity & profile (infrastructure-owned) ---------- */

export type VerificationLevel = "verified" | "self-declared" | "pending";

export interface Address {
  id: string;
  label: "current" | "permanent";
  line1: string;
  line2?: string;
  city: string;
  state: string;
  pin: string;
  verification: VerificationLevel;
  source: string;
  updatedAt: string;
}

export interface Credential {
  id: string;
  kind:
    | "passport"
    | "driving-licence"
    | "vehicle-rc"
    | "pan"
    | "gstin"
    | "uan"
    | "din"
    | "voter-id"
    | "insurance";
  title: string;
  number: string;
  issuer: string;
  serviceId: ServiceId;
  issuedOn?: string;
  expiresOn?: string;
  status: "active" | "expiring" | "expired" | "suspended";
  meta?: Record<string, string>;
}

export interface Relationship {
  id: string;
  relation: "father" | "mother" | "spouse" | "child" | "nominee" | "guardian";
  name: string;
  dob?: string;
  verification: VerificationLevel;
  /** What this relationship is permitted to expose, and to whom. */
  sharesWith: ServiceId[];
  attributes: Record<string, string>;
}

export interface Citizen {
  id: string;
  name: string;
  shortName: string;
  dob: string;
  gender: string;
  phone: string;
  email: string;
  photoInitials: string;
  identityAssurance: "high" | "medium" | "low";
  verifiedOn: string;
  addresses: Address[];
  credentials: Credential[];
  relationships: Relationship[];
  employment: {
    employer: string;
    since: string;
    uan: string;
    monthlyContribution: string;
  };
  languages: string[];
}

/* ---------- Service registry (department-owned domains) ---------- */

export type ServiceId =
  | "passport"
  | "income-tax"
  | "gst"
  | "epfo"
  | "mca"
  | "transport"
  | "cybercrime"
  | "rti"
  | "cpgrams"
  | "irctc"
  | "umang"
  | "gov-core";

export interface ServiceDef {
  id: ServiceId;
  name: string;
  shortName: string;
  department: string;
  subdomain: string;
  category: "identity" | "finance" | "business" | "mobility" | "welfare" | "rights" | "safety" | "travel";
  summary: string;
  /** Why this service exists, in citizen language. */
  citizenPurpose: string;
  accent: string;
  accentSoft: string;
  accentLine: string;
  icon: string;
  /** Which shared infrastructure primitives this domain consumes. */
  consumes: string[];
  /** Domain data this department owns and no one else stores. */
  owns: string[];
  integration: "native" | "adapter" | "legacy-api";
  migrationNote: string;
}

/* ---------- Journey registry (composable, config-driven) ---------- */

export type FieldKind =
  | "prefilled"
  | "text"
  | "textarea"
  | "draft"
  | "select"
  | "date"
  | "radio"
  | "consent"
  | "document"
  | "appointment"
  | "payment"
  | "review"
  | "handoff"
  | "note";

export interface FieldDef {
  id: string;
  kind: FieldKind;
  label: string;
  help?: string;
  /** Where the infrastructure already holds this value. */
  sourcePath?: string;
  sourceLabel?: string;
  options?: { value: string; label: string; hint?: string }[];
  placeholder?: string;
  required?: boolean;
  /** Show this field only when an earlier answer on the journey matches. */
  revealOn?: { field: string; value: string };
  /**
   * Where the work actually happens. The journey carries context and the case;
   * the department runs its own application, because a reservation system or an
   * appointment inventory is not something a form engine can stand in for.
   */
  handoff?: { serviceId: ServiceId; href: string; action: string; does: string[] };
  /** For consent fields: what is being accessed, by whom, and why. */
  consent?: { attribute: string; requestedBy: ServiceId; purpose: string; retention: string };
  amount?: number;
}

export interface StepDef {
  id: string;
  title: string;
  /** One-line answer to "why am I on this screen?" */
  intent: string;
  fields: FieldDef[];
  /** Contextual questions the AI layer can answer at this step. */
  assistPrompts?: string[];
}

export interface JourneyDef {
  id: string;
  title: string;
  /** Citizen's goal, not the department's process name. */
  goal: string;
  serviceId: ServiceId;
  /** Additional departments whose capabilities this journey composes. */
  composes?: ServiceId[];
  estMinutes: number;
  legacyEquivalent: string;
  legacyFields: number;
  steps: StepDef[];
  outcome: string;
  caseStates: string[];
  tags: string[];
  /** Set when the journey was composed by the AI layer for one citizen. */
  ephemeral?: boolean;
  provenance?: string;
}

/* ---------- Cases (unified transaction record) ---------- */

export interface CaseEvent {
  at: string;
  label: string;
  detail?: string;
  actor: "citizen" | "department" | "system";
}

export interface GovCase {
  id: string;
  journeyId: string;
  serviceId: ServiceId;
  title: string;
  stateIndex: number;
  states: string[];
  status: "in-progress" | "submitted" | "action-needed" | "approved" | "closed";
  statusLine: string;
  openedAt: string;
  updatedAt: string;
  data: Record<string, string>;
  events: CaseEvent[];
  nextAction?: { label: string; href: string };
}

/* ---------- Events → Inbox / Timeline ---------- */

export type InboxCategory = "action" | "important" | "update" | "info" | "security" | "done";

export interface InboxItem {
  id: string;
  category: InboxCategory;
  serviceId: ServiceId;
  title: string;
  body: string;
  at: string;
  read: boolean;
  dueLabel?: string;
  action?: { label: string; href: string };
  caseId?: string;
}

export interface TimelineItem {
  id: string;
  at: string;
  serviceId: ServiceId;
  title: string;
  detail: string;
  kind: "submitted" | "approved" | "issued" | "notice" | "payment" | "profile";
}

/* ---------- Schemes (consent-gated eligibility) ---------- */

export interface Scheme {
  id: string;
  name: string;
  authority: string;
  serviceId: ServiceId;
  summary: string;
  benefit: string;
  /** Attributes the eligibility check needs — shown before it runs. */
  requires: { attribute: string; source: string }[];
  rules: { label: string; pass: boolean; detail: string }[];
  verdict: "eligible" | "not-eligible" | "partial";
  verdictLine: string;
}

/* ---------- Navigation engine result ---------- */

export interface NavResult {
  mode: "deterministic" | "composed" | "clarify" | "informational";
  /** Explains to the citizen why they landed here. */
  reading: string;
  confidence: number;
  primary?: {
    journeyId?: string;
    serviceId?: ServiceId;
    href: string;
    label: string;
    sublabel: string;
  };
  alternatives?: { href: string; label: string; sublabel: string; serviceId: ServiceId }[];
  clarify?: { question: string; options: { label: string; href: string }[] };
  composed?: JourneyDef;
  answer?: string;
  source: "engine" | "model";
}
