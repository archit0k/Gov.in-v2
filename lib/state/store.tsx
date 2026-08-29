"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useReducer,
  type ReactNode,
} from "react";
import type { GovCase, InboxItem, JourneyDef, TimelineItem } from "@/lib/types";
import { SEED_CASES, SEED_INBOX, SEED_TIMELINE } from "@/lib/data/seed";
import { JOURNEY_MAP } from "@/lib/data/journeys";
import { service } from "@/lib/data/services";

/* ============================================================
   CITIZEN SESSION STATE
   In production this is the case/event infrastructure behind an
   API gateway. In the prototype it is a single reducer persisted
   per visitor, so every judge gets a clean, fully stateful demo
   and "reset" is instant.
   ============================================================ */

const KEY = "gov.in.session.v1";

export interface ConsentGrant {
  id: string;
  attribute: string;
  requestedBy: string;
  purpose: string;
  retention: string;
  grantedAt: string;
  journeyId: string;
}

export interface Suggestion {
  kind: "journey" | "service";
  id: string;
  label: string;
  sublabel: string;
  href: string;
  serviceId: string;
}

export interface ChatTurn {
  id: string;
  role: "citizen" | "gov";
  text: string;
  at: string;
  /** Context the AI asked for on this turn, and has not been answered yet. */
  needs?: { key: string; why: string }[];
  suggests?: Suggestion[];
  source?: "model" | "engine";
}

export interface Conversation {
  id: string;
  title: string;
  createdAt: string;
  updatedAt: string;
  turns: ChatTurn[];
  /** Context keys the citizen has released to this conversation only. */
  granted: string[];
}

export interface Draft {
  journeyId: string;
  stepIndex: number;
  values: Record<string, string>;
  startedAt: string;
}

export interface SessionState {
  signedIn: boolean;
  drafts: Record<string, Draft>;
  cases: GovCase[];
  inbox: InboxItem[];
  timeline: TimelineItem[];
  composed: JourneyDef[];
  consents: ConsentGrant[];
  recentIntents: string[];
  conversations: Conversation[];
}

const initial: SessionState = {
  signedIn: false,
  drafts: {},
  cases: SEED_CASES,
  inbox: SEED_INBOX,
  timeline: SEED_TIMELINE,
  composed: [],
  consents: [
    {
      id: "c-seed-1",
      attribute: "Current address (verified)",
      requestedBy: "gst",
      purpose: "Principal place of business amendment (REG-14)",
      retention: "Held in the GST registration record",
      grantedAt: "2026-08-12T10:22:00+05:30",
      journeyId: "gst-address-amend",
    },
    {
      id: "c-seed-2",
      attribute: "Employment record and nominee",
      requestedBy: "epfo",
      purpose: "Transfer of provident fund balance between member IDs",
      retention: "Held in the EPFO member record",
      grantedAt: "2026-08-02T12:00:00+05:30",
      journeyId: "epfo-transfer",
    },
  ],
  recentIntents: [],
  conversations: [],
};

type Action =
  | { type: "hydrate"; state: SessionState }
  | { type: "signIn" }
  | { type: "signOut" }
  | { type: "reset" }
  | { type: "startJourney"; journeyId: string }
  | { type: "setStep"; journeyId: string; stepIndex: number }
  | { type: "setField"; journeyId: string; fieldId: string; value: string }
  | { type: "grantConsent"; grant: ConsentGrant }
  | { type: "submit"; journeyId: string; caseId: string; data: Record<string, string> }
  | { type: "advanceCase"; caseId: string }
  | { type: "readInbox"; id: string }
  | { type: "readAll" }
  | { type: "addComposed"; journey: JourneyDef }
  | { type: "recordIntent"; text: string }
  | { type: "newConversation"; id: string; seed?: string }
  | { type: "addTurn"; conversationId: string; turn: ChatTurn }
  | { type: "titleConversation"; conversationId: string; title: string }
  | { type: "grantContext"; conversationId: string; key: string }
  | { type: "clearNeeds"; conversationId: string; turnId: string }
  | { type: "deleteConversation"; conversationId: string };

function reducer(s: SessionState, a: Action): SessionState {
  switch (a.type) {
    case "hydrate":
      return a.state;
    case "signIn":
      return { ...s, signedIn: true };
    case "signOut":
      return { ...s, signedIn: false };
    case "reset":
      return { ...initial, signedIn: s.signedIn };
    case "startJourney":
      if (s.drafts[a.journeyId]) return s;
      return {
        ...s,
        drafts: {
          ...s.drafts,
          [a.journeyId]: { journeyId: a.journeyId, stepIndex: 0, values: {}, startedAt: new Date().toISOString() },
        },
      };
    case "setStep":
      return {
        ...s,
        drafts: { ...s.drafts, [a.journeyId]: { ...s.drafts[a.journeyId], stepIndex: a.stepIndex } },
      };
    case "setField":
      return {
        ...s,
        drafts: {
          ...s.drafts,
          [a.journeyId]: {
            ...s.drafts[a.journeyId],
            values: { ...s.drafts[a.journeyId]?.values, [a.fieldId]: a.value },
          },
        },
      };
    case "grantConsent":
      if (s.consents.some((c) => c.id === a.grant.id)) return s;
      return { ...s, consents: [a.grant, ...s.consents] };
    case "submit": {
      const j = journeyFrom(s, a.journeyId);
      if (!j) return s;
      const now = new Date().toISOString();
      const newCase: GovCase = {
        id: a.caseId,
        journeyId: j.id,
        serviceId: j.serviceId,
        title: j.title,
        states: j.caseStates,
        stateIndex: 0,
        status: "submitted",
        statusLine: j.outcome,
        openedAt: now,
        updatedAt: now,
        data: a.data,
        events: [
          { at: now, label: j.caseStates[0], detail: j.outcome, actor: "citizen" },
          {
            at: now,
            label: "Acknowledged",
            detail: `${service(j.serviceId).name} received it over the shared case interface - no separate acknowledgement email, no reference number to keep safe.`,
            actor: "system",
          },
        ],
      };
      const note: InboxItem = {
        id: `n-${a.caseId}`,
        category: "update",
        serviceId: j.serviceId,
        title: `${j.title} - submitted`,
        body: j.outcome,
        at: now,
        read: false,
        caseId: a.caseId,
        action: { label: "Track case", href: `/cases/${a.caseId}` },
      };
      const tl: TimelineItem = {
        id: `t-${a.caseId}`,
        at: now,
        serviceId: j.serviceId,
        title: `${j.title} submitted`,
        detail: j.outcome,
        kind: "submitted",
      };
      const { [a.journeyId]: _removed, ...restDrafts } = s.drafts;
      void _removed;
      return {
        ...s,
        drafts: restDrafts,
        cases: [newCase, ...s.cases],
        inbox: [note, ...s.inbox],
        timeline: [tl, ...s.timeline],
      };
    }
    case "advanceCase":
      return {
        ...s,
        cases: s.cases.map((c) => {
          if (c.id !== a.caseId || c.stateIndex >= c.states.length - 1) return c;
          const idx = c.stateIndex + 1;
          const now = new Date().toISOString();
          return {
            ...c,
            stateIndex: idx,
            updatedAt: now,
            status: idx >= c.states.length - 1 ? "approved" : "submitted",
            statusLine: `${c.states[idx]} - updated just now by the department.`,
            events: [
              ...c.events,
              { at: now, label: c.states[idx], detail: "Department updated the case state.", actor: "department" as const },
            ],
          };
        }),
      };
    case "readInbox":
      return { ...s, inbox: s.inbox.map((n) => (n.id === a.id ? { ...n, read: true } : n)) };
    case "readAll":
      return { ...s, inbox: s.inbox.map((n) => ({ ...n, read: true })) };
    case "addComposed":
      if (s.composed.some((c) => c.id === a.journey.id)) return s;
      return { ...s, composed: [a.journey, ...s.composed] };
    case "recordIntent":
      return { ...s, recentIntents: [a.text, ...s.recentIntents.filter((t) => t !== a.text)].slice(0, 6) };
    case "newConversation": {
      if (s.conversations.some((c) => c.id === a.id)) return s;
      const now = new Date().toISOString();
      const conv: Conversation = {
        id: a.id,
        title: a.seed ? a.seed.slice(0, 46) : "New conversation",
        createdAt: now,
        updatedAt: now,
        turns: [],
        // Every conversation starts from zero. Permission is not inherited
        // from the last one, because the reason for it was specific to that one.
        granted: [],
      };
      return { ...s, conversations: [conv, ...s.conversations].slice(0, 30) };
    }
    case "addTurn":
      return {
        ...s,
        conversations: s.conversations.map((c) =>
          c.id === a.conversationId
            ? { ...c, turns: [...c.turns, a.turn], updatedAt: new Date().toISOString() }
            : c,
        ),
      };
    case "titleConversation":
      return {
        ...s,
        conversations: s.conversations.map((c) =>
          c.id === a.conversationId ? { ...c, title: a.title } : c,
        ),
      };
    case "grantContext":
      return {
        ...s,
        conversations: s.conversations.map((c) =>
          c.id === a.conversationId && !c.granted.includes(a.key)
            ? { ...c, granted: [...c.granted, a.key] }
            : c,
        ),
      };
    case "clearNeeds":
      return {
        ...s,
        conversations: s.conversations.map((c) =>
          c.id === a.conversationId
            ? { ...c, turns: c.turns.map((t) => (t.id === a.turnId ? { ...t, needs: [] } : t)) }
            : c,
        ),
      };
    case "deleteConversation":
      return { ...s, conversations: s.conversations.filter((c) => c.id !== a.conversationId) };
    default:
      return s;
  }
}

function journeyFrom(s: SessionState, id: string): JourneyDef | undefined {
  return JOURNEY_MAP[id] ?? s.composed.find((c) => c.id === id);
}

interface Ctx {
  state: SessionState;
  ready: boolean;
  dispatch: React.Dispatch<Action>;
  journey: (id: string) => JourneyDef | undefined;
  unread: number;
  actionsNeeded: InboxItem[];
}

const SessionCtx = createContext<Ctx | null>(null);

export function SessionProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, initial);
  const [ready, setReady] = useReducer(() => true, false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(KEY);
      if (raw) dispatch({ type: "hydrate", state: { ...initial, ...JSON.parse(raw) } });
    } catch {
      /* private mode, blocked storage - the demo still works, just not across reloads */
    }
    setReady();
  }, []);

  useEffect(() => {
    if (!ready) return;
    try {
      localStorage.setItem(KEY, JSON.stringify(state));
    } catch {
      /* ignore */
    }
  }, [state, ready]);

  const journey = useCallback(
    (id: string) => JOURNEY_MAP[id] ?? state.composed.find((c) => c.id === id),
    [state.composed],
  );

  const value = useMemo<Ctx>(
    () => ({
      state,
      ready,
      dispatch,
      journey,
      unread: state.inbox.filter((n) => !n.read).length,
      actionsNeeded: state.inbox.filter((n) => n.category === "action"),
    }),
    [state, ready, journey],
  );

  return <SessionCtx.Provider value={value}>{children}</SessionCtx.Provider>;
}

export function useSession() {
  const ctx = useContext(SessionCtx);
  if (!ctx) throw new Error("useSession must be used inside SessionProvider");
  return ctx;
}

const CASE_PREFIX: Record<string, string> = {
  passport: "PSP",
  "income-tax": "ITR",
  gst: "GST",
  epfo: "EPF",
  mca: "MCA",
  transport: "RTO",
  cybercrime: "NCR",
  rti: "RTI",
  cpgrams: "PGR",
  irctc: "PNR",
  umang: "SCH",
  "gov-core": "GOV",
};

export function newId(prefix = "c") {
  return `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`;
}

export function newCaseId(serviceId: string) {
  const prefix = CASE_PREFIX[serviceId] ?? serviceId.slice(0, 3).toUpperCase();
  const n = Math.floor(100000 + Math.random() * 899999);
  return `${prefix}-2026-${n}`;
}
