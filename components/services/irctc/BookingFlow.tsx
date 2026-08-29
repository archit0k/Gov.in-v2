"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowRight, ArrowLeft, Check, CircleAlert, Search, ShieldCheck, Ticket, TrainFront, Utensils,
} from "lucide-react";
import { Badge, Button, Card, SourceTag, cn } from "@/components/ui/primitives";
import { StationPicker } from "./StationPicker";
import { CITIZEN, formatDate } from "@/lib/data/citizen";
import { CLASSES, DAY_NAMES, STATION_MAP, type ClassCode } from "@/lib/services/irctc/network";
import {
  BERTH_PREFS, QUOTAS, allAvailability, allocate, availabilityFor, fareBreakdown, legTimes, makePnr,
  searchTrains, type Availability, type BerthPref, type Leg, type Quota,
} from "@/lib/services/irctc/engine";
import { newCaseId, useSession } from "@/lib/state/store";
import { useJourneyStep } from "@/components/journey/JourneyRail";

/* ============================================================
   RESERVATION - the department's own application

   Everything on this screen is Railways' domain: schedules,
   inventory, quotas, fares, allocation. The only things that
   came from Gov.in are who the citizen is and who is in their
   citizen graph, which is why the passenger step has almost
   nothing to type.
   ============================================================ */

type Stage = "search" | "results" | "passengers" | "review" | "done";

interface Passenger {
  id: string;
  name: string;
  age: number;
  gender: "M" | "F" | "T";
  berth: BerthPref;
  /** Present when the person came from the citizen graph rather than typing. */
  fromGraph?: string;
}

const GRAPH_PEOPLE = [
  { id: "self", name: CITIZEN.name, age: 32, gender: "M" as const, relation: "You" },
  { id: "spouse", name: "Meera Deshmukh", age: 30, gender: "F" as const, relation: "Spouse" },
  { id: "father", name: "Ramesh Deshmukh", age: 62, gender: "M" as const, relation: "Father" },
  { id: "mother", name: "Sunanda Deshmukh", age: 59, gender: "F" as const, relation: "Mother" },
];

function isoPlus(days: number) {
  return new Date(Date.now() + days * 86_400_000).toISOString().slice(0, 10);
}

export function BookingFlow({
  journeyId,
  returnTo,
}: {
  journeyId?: string;
  returnTo?: string;
}) {
  const router = useRouter();
  const { dispatch } = useSession();
  const carried = useJourneyStep();

  // Pick the journey up on arrival so the rail renders over this department's
  // own screens. The citizen never stops being inside the journey.
  useEffect(() => {
    if (journeyId) dispatch({ type: "carryJourney", journeyId });
  }, [journeyId, dispatch]);

  const [stage, setStage] = useState<Stage>("search");
  const [from, setFrom] = useState("PUNE");
  const [to, setTo] = useState("");
  const [date, setDate] = useState(isoPlus(9));
  const [quota, setQuota] = useState<Quota>("GN");

  const [leg, setLeg] = useState<Leg | null>(null);
  const [cls, setCls] = useState<ClassCode | null>(null);
  const [pax, setPax] = useState<Passenger[]>([
    { id: "self", name: CITIZEN.name, age: 32, gender: "M", berth: "LB", fromGraph: "You" },
  ]);
  const [booking, setBooking] = useState<{ pnr: string; seats: ReturnType<typeof allocate>; avail: Availability } | null>(null);

  const legs = useMemo(() => (from && to ? searchTrains(from, to, date) : []), [from, to, date]);
  const seniors = pax.filter((p) => p.age >= 60).length;
  const fare = leg && cls ? fareBreakdown(leg, cls, quota, pax.length, seniors) : null;
  const avail = leg && cls ? availabilityFor(leg, cls, quota, date) : null;

  function runSearch() {
    if (!from || !to) return;
    setLeg(null);
    setCls(null);
    setStage("results");
  }

  function confirm() {
    if (!leg || !cls || !avail) return;
    const pnr = makePnr(leg.train.number, date);
    const seats = avail.status === "AVAILABLE" ? allocate(leg, cls, date, pax.length, pax[0].berth) : [];
    setBooking({ pnr, seats, avail });
    setStage("done");

    const caseId = newCaseId("irctc");
    dispatch({
      type: "recordCase",
      caseId,
      serviceId: "irctc",
      title: `${STATION_MAP[from].city} to ${STATION_MAP[to].city}, ${leg.train.name}`,
      states: ["Booked", "Chart prepared", "Journey complete"],
      statusLine: `PNR ${pnr}. ${pax.length} ${pax.length === 1 ? "passenger" : "passengers"} in ${CLASSES[cls].name}, ${avail.label}.`,
      data: {
        PNR: pnr,
        Train: `${leg.train.number} ${leg.train.name}`,
        From: STATION_MAP[from].name,
        To: STATION_MAP[to].name,
        Date: formatDate(date),
        Class: CLASSES[cls].name,
        Quota: QUOTAS.find((q) => q.code === quota)!.name,
        Passengers: pax.map((p) => p.name).join(", "),
        Status: avail.label,
        Fare: `Rs ${fare!.total.toLocaleString("en-IN")}`,
      },
    });
  }

  return (
    <div className="grid gap-6">
      <Stages stage={stage} />

      {(stage === "search" || stage === "results") && (
        <SearchPanel
          from={from} to={to} date={date} quota={quota}
          setFrom={setFrom} setTo={setTo} setDate={setDate} setQuota={setQuota}
          onSearch={runSearch}
          compact={stage === "results"}
        />
      )}

      {stage === "results" && (
        <Results
          legs={legs} date={date} quota={quota}
          onPick={(l, c) => { setLeg(l); setCls(c); setStage("passengers"); }}
        />
      )}

      {stage === "passengers" && leg && cls && (
        <Passengers
          leg={leg} cls={cls} quota={quota} pax={pax} setPax={setPax}
          onBack={() => setStage("results")}
          onNext={() => setStage("review")}
        />
      )}

      {stage === "review" && leg && cls && fare && avail && (
        <Review
          leg={leg} cls={cls} date={date} quota={quota} pax={pax} fare={fare} avail={avail}
          onBack={() => setStage("passengers")}
          onConfirm={confirm}
        />
      )}

      {stage === "done" && leg && cls && booking && fare && (
        <Done
          leg={leg} cls={cls} date={date} pax={pax} booking={booking} fare={fare}
          returnTo={returnTo ?? (journeyId ? `/journeys/${journeyId}` : undefined)}
          onDone={() => {
            if (journeyId) carried.complete("reservation", "done");
            else if (returnTo) router.push(returnTo);
          }}
        />
      )}
    </div>
  );
}

/* ---------------- Progress ---------------- */

const STAGE_LIST: { id: Stage; label: string }[] = [
  { id: "search", label: "Journey" },
  { id: "results", label: "Train and class" },
  { id: "passengers", label: "Passengers" },
  { id: "review", label: "Review" },
  { id: "done", label: "Ticket" },
];

function Stages({ stage }: { stage: Stage }) {
  const i = STAGE_LIST.findIndex((s) => s.id === stage);
  return (
    <ol className="flex flex-wrap items-center gap-x-2 gap-y-1 text-[12.5px]">
      {STAGE_LIST.map((s, n) => (
        <li key={s.id} className="flex items-center gap-2">
          {n > 0 && <span className="text-[var(--faint)]">›</span>}
          <span className={cn(n === i ? "font-semibold text-[var(--accent)]" : n < i ? "text-[var(--ink-2)]" : "text-[var(--faint)]")}>
            {s.label}
          </span>
        </li>
      ))}
    </ol>
  );
}

/* ---------------- Search ---------------- */

function SearchPanel({
  from, to, date, quota, setFrom, setTo, setDate, setQuota, onSearch, compact,
}: {
  from: string; to: string; date: string; quota: Quota;
  setFrom: (v: string) => void; setTo: (v: string) => void;
  setDate: (v: string) => void; setQuota: (v: Quota) => void;
  onSearch: () => void; compact: boolean;
}) {
  const [open, setOpen] = useState(!compact);
  const ready = !!from && !!to;

  if (compact && !open) {
    return (
      <Card className="flex flex-wrap items-center gap-x-4 gap-y-2 p-4">
        <TrainFront size={17} className="shrink-0 text-[var(--muted)]" />
        <p className="text-[14.5px] font-medium">
          {STATION_MAP[from]?.name} to {STATION_MAP[to]?.name}
        </p>
        <p className="text-[13px] text-[var(--muted)]">
          {formatDate(date)}, {QUOTAS.find((q) => q.code === quota)!.name} quota
        </p>
        <Button size="sm" variant="secondary" className="ml-auto" onClick={() => setOpen(true)}>
          Change
        </Button>
      </Card>
    );
  }

  return (
    <Card className="p-5">
      <div className="grid gap-4 lg:grid-cols-[1fr_1fr_200px]">
        <StationPicker id="from" label="From" value={from} onChange={setFrom} exclude={to} />
        <StationPicker id="to" label="To" value={to} onChange={setTo} exclude={from} autoFocus={!to} />
        <div className="grid gap-2">
          <label htmlFor="doj" className="text-[13.5px] font-medium text-[var(--ink)]">
            Date of journey
          </label>
          <input
            id="doj"
            type="date"
            value={date}
            min={isoPlus(0)}
            max={isoPlus(120)}
            onChange={(e) => setDate(e.target.value)}
            className="h-12 w-full rounded-[var(--r-md)] border border-[var(--line)] bg-[var(--panel)] px-3.5 text-[14.5px] outline-none transition-colors focus:border-[var(--accent)] focus:ring-4 focus:ring-[var(--accent-soft)]"
          />
        </div>
      </div>

      <div className="mt-4 flex flex-wrap gap-1.5">
        {[
          { d: 0, l: "Today" }, { d: 1, l: "Tomorrow" }, { d: 7, l: "In a week" }, { d: 30, l: "In a month" },
        ].map((q) => (
          <button
            key={q.l}
            type="button"
            onClick={() => setDate(isoPlus(q.d))}
            className={cn(
              "rounded-[var(--r-sm)] border px-3 py-1.5 text-[12.5px] transition-colors",
              date === isoPlus(q.d)
                ? "border-[var(--accent)] bg-[var(--accent-soft)] text-[var(--accent)]"
                : "border-[var(--line)] text-[var(--ink-2)] hover:border-[var(--faint)]",
            )}
          >
            {q.l}
          </button>
        ))}
      </div>

      <div className="mt-5 border-t border-[var(--line)] pt-4">
        <p className="mb-2 text-[13.5px] font-medium">Quota</p>
        <div className="grid gap-1.5 sm:grid-cols-2">
          {QUOTAS.map((q) => (
            <button
              key={q.code}
              type="button"
              onClick={() => setQuota(q.code)}
              className={cn(
                "flex items-start gap-2.5 rounded-[var(--r-md)] border px-3.5 py-2.5 text-left transition-colors",
                quota === q.code
                  ? "border-[var(--accent)] bg-[var(--accent-soft)]"
                  : "border-[var(--line)] hover:border-[var(--faint)]",
              )}
            >
              <span className={cn("mt-1 h-2 w-2 shrink-0 rounded-full", quota === q.code ? "bg-[var(--accent)]" : "bg-[var(--line)]")} />
              <span className="min-w-0">
                <span className="block text-[14px] font-medium">{q.name}</span>
                <span className="block text-[12px] leading-snug text-[var(--muted)]">{q.note}</span>
              </span>
            </button>
          ))}
        </div>
      </div>

      <div className="mt-5 flex flex-wrap items-center gap-3 border-t border-[var(--line)] pt-4">
        <Button size="lg" onClick={() => { setOpen(false); onSearch(); }} disabled={!ready}>
          <Search size={16} /> Find trains
        </Button>
        {!ready && <span className="text-[12.5px] text-[var(--muted)]">Pick both stations to search.</span>}
      </div>
    </Card>
  );
}

/* ---------------- Results ---------------- */

const STATUS_TONE: Record<Availability["status"], "ok" | "warn" | "danger" | "neutral"> = {
  AVAILABLE: "ok", RAC: "warn", WL: "warn", REGRET: "danger", NOT_OFFERED: "neutral",
};

function Results({
  legs, date, quota, onPick,
}: {
  legs: Leg[]; date: string; quota: Quota; onPick: (leg: Leg, cls: ClassCode) => void;
}) {
  if (legs.length === 0) {
    return (
      <Card className="p-8 text-center">
        <p className="text-[15px] font-medium">No direct train on this date</p>
        <p className="mx-auto mt-2 max-w-[54ch] text-[13.5px] leading-relaxed text-[var(--muted)]">
          Some services do not run every day. Try another date, or a nearby station. This prototype carries
          fourteen real services rather than the full timetable.
        </p>
      </Card>
    );
  }

  return (
    <div className="grid gap-3">
      <p className="text-[13px] text-[var(--muted)]">
        {legs.length} {legs.length === 1 ? "train" : "trains"} on {formatDate(date)}
      </p>

      {legs.map((leg) => {
        const t = legTimes(leg);
        const avs = allAvailability(leg, quota, date);
        return (
          <Card key={leg.train.number} className="overflow-hidden">
            <div className="flex flex-wrap items-start gap-x-6 gap-y-3 p-4">
              <div className="min-w-[220px] flex-1">
                <p className="text-[15px] font-semibold leading-snug">{leg.train.name}</p>
                <p className="mono mt-0.5 text-[12px] text-[var(--muted)]">{leg.train.number}</p>
                <div className="mt-2 flex flex-wrap items-center gap-1">
                  {DAY_NAMES.map((d, i) => (
                    <span
                      key={d}
                      title={leg.train.days.includes(i) ? `Runs on ${d}` : `No service on ${d}`}
                      className={cn(
                        "grid h-5 w-7 place-items-center rounded-[3px] text-[10px] font-semibold",
                        leg.train.days.includes(i)
                          ? "bg-[var(--accent-soft)] text-[var(--accent)]"
                          : "bg-[var(--line-2)] text-[var(--faint)]",
                      )}
                    >
                      {d[0]}
                    </span>
                  ))}
                  {leg.train.pantry && (
                    <span className="ml-1 flex items-center gap-1 text-[11.5px] text-[var(--muted)]">
                      <Utensils size={11} /> Pantry
                    </span>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-4">
                <div className="text-right">
                  <p className="tnum text-[20px] font-semibold leading-none">{t.depart}</p>
                  <p className="mono mt-1 text-[11.5px] text-[var(--muted)]">{leg.fromCode}</p>
                </div>
                <div className="flex min-w-[86px] flex-col items-center gap-1">
                  <span className="text-[11px] text-[var(--muted)]">{t.duration}</span>
                  <span className="h-px w-full bg-[var(--line)]" />
                  <span className="text-[10.5px] text-[var(--faint)]">{leg.km} km</span>
                </div>
                <div>
                  <p className="tnum text-[20px] font-semibold leading-none">
                    {t.arrive}
                    {t.nights > 0 && <span className="ml-1 align-super text-[11px] text-[var(--warn)]">+{t.nights}</span>}
                  </p>
                  <p className="mono mt-1 text-[11.5px] text-[var(--muted)]">{leg.toCode}</p>
                </div>
              </div>
            </div>

            <div className="flex flex-wrap gap-2 border-t border-[var(--line)] bg-[var(--panel-2)] p-3">
              {avs.map((a) => {
                const dead = a.status === "REGRET" || a.status === "NOT_OFFERED";
                return (
                  <button
                    key={a.cls}
                    type="button"
                    disabled={dead}
                    onClick={() => onPick(leg, a.cls)}
                    title={CLASSES[a.cls].note}
                    className={cn(
                      "min-w-[152px] flex-1 rounded-[var(--r-md)] border px-3 py-2.5 text-left transition-colors",
                      dead
                        ? "cursor-not-allowed border-[var(--line)] opacity-55"
                        : "border-[var(--line)] bg-[var(--panel)] hover:border-[var(--accent)] hover:bg-[var(--accent-soft)]",
                    )}
                  >
                    <span className="flex items-baseline justify-between gap-2">
                      <span className="text-[13px] font-semibold">{CLASSES[a.cls].short}</span>
                      <span className="tnum text-[13px]">Rs {a.fare.toLocaleString("en-IN")}</span>
                    </span>
                    <span className="mt-1 block">
                      <Badge tone={STATUS_TONE[a.status]}>{a.label}</Badge>
                    </span>
                    {a.chanceLabel && a.status !== "AVAILABLE" && (
                      <span className="mt-1 block text-[11px] leading-snug text-[var(--muted)]">{a.chanceLabel}</span>
                    )}
                  </button>
                );
              })}
            </div>
          </Card>
        );
      })}
    </div>
  );
}

/* ---------------- Passengers ---------------- */

function Passengers({
  leg, cls, quota, pax, setPax, onBack, onNext,
}: {
  leg: Leg; cls: ClassCode; quota: Quota;
  pax: Passenger[]; setPax: (p: Passenger[]) => void;
  onBack: () => void; onNext: () => void;
}) {
  const [name, setName] = useState("");
  const [age, setAge] = useState("");
  const [gender, setGender] = useState<"M" | "F" | "T">("M");
  const berths = CLASSES[cls].berths;
  const prefs = BERTH_PREFS.filter((b) => (berths ? true : !b.berthsOnly));

  const inGraph = (id: string) => pax.some((p) => p.id === id);

  function toggleGraph(person: (typeof GRAPH_PEOPLE)[number]) {
    if (inGraph(person.id)) {
      if (person.id === "self") return;
      setPax(pax.filter((p) => p.id !== person.id));
    } else if (pax.length < 6) {
      setPax([...pax, { ...person, berth: "ANY", fromGraph: person.relation }]);
    }
  }

  function addManual() {
    const a = parseInt(age, 10);
    if (!name.trim() || !a || a < 1 || a > 120 || pax.length >= 6) return;
    setPax([...pax, { id: `m-${Date.now()}`, name: name.trim(), age: a, gender, berth: "ANY" }]);
    setName(""); setAge("");
  }

  return (
    <div className="grid gap-4">
      <Card className="p-5">
        <h2 className="text-[17px] font-semibold">Who is travelling?</h2>
        <p className="mt-1 max-w-[70ch] text-[13.5px] leading-relaxed text-[var(--muted)]">
          People in your citizen graph are already verified, so Railways receives an assertion that they are who
          they say they are. Nothing to type, and no ID check at boarding.
        </p>

        <div className="mt-4 grid gap-2 sm:grid-cols-2">
          {GRAPH_PEOPLE.map((p) => {
            const on = inGraph(p.id);
            return (
              <button
                key={p.id}
                type="button"
                onClick={() => toggleGraph(p)}
                disabled={p.id === "self"}
                className={cn(
                  "flex items-center gap-3 rounded-[var(--r-md)] border px-3.5 py-3 text-left transition-colors",
                  on ? "border-[var(--accent)] bg-[var(--accent-soft)]" : "border-[var(--line)] hover:border-[var(--faint)]",
                  p.id === "self" && "cursor-default",
                )}
              >
                <span className={cn("grid h-5 w-5 shrink-0 place-items-center rounded-[3px] border-2", on ? "border-[var(--accent)] bg-[var(--accent)] text-white" : "border-[var(--line)]")}>
                  {on && <Check size={12} strokeWidth={3.2} />}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-[14px] font-medium">{p.name}</span>
                  <span className="block text-[12px] text-[var(--muted)]">
                    {p.relation}, {p.age}
                    {p.age >= 60 && <span className="text-[var(--ok)]"> · senior concession applies</span>}
                  </span>
                </span>
              </button>
            );
          })}
        </div>

        <SourceTag label="Citizen graph, verified. Railways sees eligibility, not the underlying records." className="mt-3" />
      </Card>

      <Card className="p-5">
        <h3 className="text-[15px] font-semibold">Someone not in your citizen graph</h3>
        <p className="mt-1 text-[13px] leading-relaxed text-[var(--muted)]">
          This is the only part that still works the old way, and it is worth noticing how much longer it takes.
        </p>
        <div className="mt-3 grid gap-3 sm:grid-cols-[1fr_100px_140px_auto]">
          <div className="grid gap-2">
            <label htmlFor="pname" className="text-[13px] font-medium">Full name</label>
            <input id="pname" value={name} onChange={(e) => setName(e.target.value)}
              className="h-11 rounded-[var(--r-md)] border border-[var(--line)] bg-[var(--panel)] px-3 text-[14px] outline-none focus:border-[var(--accent)] focus:ring-4 focus:ring-[var(--accent-soft)]" />
          </div>
          <div className="grid gap-2">
            <label htmlFor="page" className="text-[13px] font-medium">Age</label>
            <input id="page" inputMode="numeric" value={age} onChange={(e) => setAge(e.target.value.replace(/\D/g, ""))}
              className="h-11 rounded-[var(--r-md)] border border-[var(--line)] bg-[var(--panel)] px-3 text-[14px] outline-none focus:border-[var(--accent)] focus:ring-4 focus:ring-[var(--accent-soft)]" />
          </div>
          <div className="grid gap-2">
            <label htmlFor="pgen" className="text-[13px] font-medium">Gender</label>
            <select id="pgen" value={gender} onChange={(e) => setGender(e.target.value as "M" | "F" | "T")}
              className="h-11 rounded-[var(--r-md)] border border-[var(--line)] bg-[var(--panel)] px-3 text-[14px] outline-none focus:border-[var(--accent)]">
              <option value="M">Male</option><option value="F">Female</option><option value="T">Transgender</option>
            </select>
          </div>
          <div className="flex items-end">
            <Button variant="secondary" onClick={addManual} disabled={!name.trim() || !age || pax.length >= 6}>Add</Button>
          </div>
        </div>
      </Card>

      <Card className="p-5">
        <h3 className="text-[15px] font-semibold">
          {pax.length} {pax.length === 1 ? "passenger" : "passengers"}
          <span className="ml-2 font-normal text-[13px] text-[var(--muted)]">{CLASSES[cls].name}, {leg.train.name}</span>
        </h3>
        <div className="mt-3 divide-y divide-[var(--line)] border-y border-[var(--line)]">
          {pax.map((p, i) => (
            <div key={p.id} className="flex flex-wrap items-center gap-x-4 gap-y-2 py-3">
              <span className="tnum w-5 shrink-0 text-[12px] text-[var(--faint)]">{i + 1}</span>
              <span className="min-w-[160px] flex-1">
                <span className="block text-[14px] font-medium">{p.name}</span>
                <span className="block text-[12px] text-[var(--muted)]">
                  {p.age}, {p.gender === "M" ? "Male" : p.gender === "F" ? "Female" : "Transgender"}
                  {p.fromGraph ? ` · ${p.fromGraph}, verified` : " · entered manually"}
                </span>
              </span>
              <select
                aria-label={`Berth preference for ${p.name}`}
                value={p.berth}
                onChange={(e) => setPax(pax.map((x) => (x.id === p.id ? { ...x, berth: e.target.value as BerthPref } : x)))}
                className="h-9 rounded-[var(--r-sm)] border border-[var(--line)] bg-[var(--panel)] px-2 text-[13px] outline-none focus:border-[var(--accent)]"
              >
                {prefs.map((b) => <option key={b.code} value={b.code}>{b.label}</option>)}
              </select>
              {!p.fromGraph && (
                <button onClick={() => setPax(pax.filter((x) => x.id !== p.id))} className="text-[12.5px] text-[var(--muted)] hover:text-[var(--danger)]">
                  Remove
                </button>
              )}
            </div>
          ))}
        </div>
        <p className="mt-3 text-[12px] text-[var(--muted)]">
          Berth preference is a request. Allocation depends on what is free when the chart is prepared.
        </p>
      </Card>

      <div className="flex flex-wrap items-center gap-3">
        <Button variant="ghost" onClick={onBack}><ArrowLeft size={15} /> Back to trains</Button>
        <Button size="lg" className="ml-auto" onClick={onNext}>
          Review Rs {fareBreakdown(leg, cls, quota, pax.length, pax.filter((p) => p.age >= 60).length).total.toLocaleString("en-IN")}
          <ArrowRight size={15} />
        </Button>
      </div>
    </div>
  );
}

/* ---------------- Review ---------------- */

function Review({
  leg, cls, date, quota, pax, fare, avail, onBack, onConfirm,
}: {
  leg: Leg; cls: ClassCode; date: string; quota: Quota; pax: Passenger[];
  fare: ReturnType<typeof fareBreakdown>; avail: Availability;
  onBack: () => void; onConfirm: () => void;
}) {
  const t = legTimes(leg);
  const [busy, setBusy] = useState(false);
  const rows: [string, number][] = [
    ["Base fare", fare.base],
    ["Reservation charge", fare.reservation],
    ["Superfast charge", fare.superfast],
    ["Tatkal charge", fare.tatkal],
    ["Catering", fare.catering],
    ["GST", fare.gst],
    ["Senior citizen concession", -fare.concession],
  ];

  return (
    <div className="grid gap-4 lg:grid-cols-[1.4fr_1fr]">
      <div className="grid content-start gap-4">
        <Card className="p-5">
          <h2 className="text-[17px] font-semibold">{leg.train.name}</h2>
          <p className="mono mt-0.5 text-[12.5px] text-[var(--muted)]">{leg.train.number}</p>
          <div className="mt-4 flex flex-wrap items-center gap-5">
            <div>
              <p className="tnum text-[24px] font-semibold leading-none">{t.depart}</p>
              <p className="mt-1 text-[13px]">{STATION_MAP[leg.fromCode].name}</p>
            </div>
            <ArrowRight size={16} className="text-[var(--faint)]" />
            <div>
              <p className="tnum text-[24px] font-semibold leading-none">
                {t.arrive}{t.nights > 0 && <span className="ml-1 align-super text-[12px] text-[var(--warn)]">+{t.nights}</span>}
              </p>
              <p className="mt-1 text-[13px]">{STATION_MAP[leg.toCode].name}</p>
            </div>
            <div className="ml-auto text-right">
              <p className="text-[13px] text-[var(--muted)]">{formatDate(date)}</p>
              <p className="text-[13px] text-[var(--muted)]">{t.duration}, {leg.km} km</p>
            </div>
          </div>
          <div className="mt-4 flex flex-wrap items-center gap-2 border-t border-[var(--line)] pt-3">
            <Badge tone="accent">{CLASSES[cls].name}</Badge>
            <Badge tone="neutral">{QUOTAS.find((q) => q.code === quota)!.name}</Badge>
            <Badge tone={STATUS_TONE[avail.status]}>{avail.label}</Badge>
          </div>
          {avail.status !== "AVAILABLE" && (
            <p className="mt-3 flex gap-2 rounded-[var(--r-md)] bg-[var(--warn-soft)] p-3 text-[13px] leading-relaxed text-[var(--warn)]">
              <CircleAlert size={15} className="mt-0.5 shrink-0" />
              {avail.chanceLabel}. If it does not confirm before the chart is prepared, the full fare returns
              automatically to the account that paid.
            </p>
          )}
        </Card>

        <Card className="p-5">
          <h3 className="text-[15px] font-semibold">Passengers</h3>
          <div className="mt-3 divide-y divide-[var(--line)] border-y border-[var(--line)]">
            {pax.map((p) => (
              <div key={p.id} className="flex flex-wrap items-center justify-between gap-2 py-2.5">
                <span className="text-[14px]">{p.name}</span>
                <span className="text-[12.5px] text-[var(--muted)]">
                  {p.age}, {p.gender} · {BERTH_PREFS.find((b) => b.code === p.berth)?.label}
                </span>
              </div>
            ))}
          </div>
        </Card>
      </div>

      <div className="grid content-start gap-4">
        <Card className="p-5">
          <h3 className="text-[15px] font-semibold">Fare</h3>
          <dl className="mt-3">
            {rows.filter(([, v]) => v !== 0).map(([k, v]) => (
              <div key={k} className="flex items-baseline justify-between gap-4 border-b border-[var(--line-2)] py-2 last:border-0">
                <dt className="text-[13px] text-[var(--muted)]">{k}</dt>
                <dd className={cn("tnum text-[13.5px]", v < 0 && "text-[var(--ok)]")}>
                  {v < 0 ? "-" : ""}Rs {Math.abs(v).toLocaleString("en-IN")}
                </dd>
              </div>
            ))}
          </dl>
          <div className="mt-3 flex items-baseline justify-between border-t border-[var(--line)] pt-3">
            <span className="text-[14px] font-semibold">Total</span>
            <span className="tnum text-[22px] font-semibold">Rs {fare.total.toLocaleString("en-IN")}</span>
          </div>
          <p className="mt-2 text-[12px] text-[var(--muted)]">
            For {pax.length} {pax.length === 1 ? "passenger" : "passengers"}. Paid through Gov.in, with the
            receipt attached to the case.
          </p>
        </Card>

        <Card className="p-5">
          <h3 className="text-[15px] font-semibold">If you cancel</h3>
          <ul className="mt-2 grid gap-1.5 text-[12.5px] leading-relaxed text-[var(--muted)]">
            <li>More than 48 hours before: Rs 200 per passenger retained.</li>
            <li>48 to 12 hours: 25% of the fare.</li>
            <li>Under 12 hours: 50%.</li>
            <li className="text-[var(--ok)]">Train cancelled or over 3 hours late: full fare returns automatically.</li>
          </ul>
        </Card>

        <div className="flex flex-wrap items-center gap-3">
          <Button variant="ghost" onClick={onBack}><ArrowLeft size={15} /> Back</Button>
          <Button size="lg" className="ml-auto" disabled={busy} onClick={() => { setBusy(true); setTimeout(onConfirm, 900); }}>
            {busy ? (
              <><span className="h-1.5 w-1.5 animate-[pulse-soft_0.9s_infinite] rounded-full bg-current" /> Reserving</>
            ) : (
              <><Ticket size={16} /> Pay and book</>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}

/* ---------------- Confirmation ---------------- */

function Done({
  leg, cls, date, pax, booking, fare, returnTo, onDone,
}: {
  leg: Leg; cls: ClassCode; date: string; pax: Passenger[];
  booking: { pnr: string; seats: ReturnType<typeof allocate>; avail: Availability };
  fare: ReturnType<typeof fareBreakdown>;
  returnTo?: string; onDone: () => void;
}) {
  const t = legTimes(leg);
  return (
    <div className="grid gap-4">
      <Card className="overflow-hidden">
        <div className="flex flex-wrap items-center gap-3 border-b border-[var(--line)] bg-[var(--ok-soft)] px-5 py-3">
          <Check size={17} className="shrink-0 text-[var(--ok)]" />
          <p className="text-[14.5px] font-medium text-[var(--ink)]">Booked. PNR {booking.pnr}</p>
          <span className="ml-auto">
            <Badge tone={STATUS_TONE[booking.avail.status]}>{booking.avail.label}</Badge>
          </span>
        </div>

        <div className="p-5">
          <div className="flex flex-wrap items-start gap-x-8 gap-y-4">
            <div>
              <p className="text-[16px] font-semibold">{leg.train.name}</p>
              <p className="mono text-[12.5px] text-[var(--muted)]">{leg.train.number}</p>
            </div>
            <div className="flex items-center gap-4">
              <div>
                <p className="tnum text-[20px] font-semibold leading-none">{t.depart}</p>
                <p className="mt-1 text-[12.5px] text-[var(--muted)]">{STATION_MAP[leg.fromCode].name}</p>
              </div>
              <ArrowRight size={15} className="text-[var(--faint)]" />
              <div>
                <p className="tnum text-[20px] font-semibold leading-none">{t.arrive}</p>
                <p className="mt-1 text-[12.5px] text-[var(--muted)]">{STATION_MAP[leg.toCode].name}</p>
              </div>
            </div>
            <div className="ml-auto text-right">
              <p className="text-[13px]">{formatDate(date)}</p>
              <p className="text-[13px] text-[var(--muted)]">{CLASSES[cls].name}</p>
            </div>
          </div>

          <div className="mt-5 divide-y divide-[var(--line)] border-y border-[var(--line)]">
            {pax.map((p, i) => {
              const seat = booking.seats[i];
              return (
                <div key={p.id} className="flex flex-wrap items-center justify-between gap-3 py-3">
                  <span>
                    <span className="block text-[14px] font-medium">{p.name}</span>
                    <span className="block text-[12px] text-[var(--muted)]">{p.age}, {p.gender}</span>
                  </span>
                  <span className="text-right">
                    {seat ? (
                      <>
                        <span className="mono block text-[14px] font-semibold">{seat.coach} / {seat.number}</span>
                        <span className="block text-[12px] text-[var(--muted)]">{seat.berth}</span>
                      </>
                    ) : (
                      <span className="text-[13px] text-[var(--warn)]">Allocated when the chart is prepared</span>
                    )}
                  </span>
                </div>
              );
            })}
          </div>

          <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
            <span className="text-[13px] text-[var(--muted)]">Paid</span>
            <span className="tnum text-[18px] font-semibold">Rs {fare.total.toLocaleString("en-IN")}</span>
          </div>
        </div>
      </Card>

      <Card className="flex flex-wrap items-center gap-3 p-4">
        <ShieldCheck size={16} className="shrink-0 text-[var(--ok)]" />
        <p className="min-w-0 flex-1 text-[13px] leading-relaxed text-[var(--muted)]">
          This booking is now a case in your Gov.in timeline. Chart preparation, delays and any refund will
          arrive in your inbox against it, without you checking back here.
        </p>
        {returnTo ? (
          <Button onClick={onDone}>Back to your journey <ArrowRight size={15} /></Button>
        ) : (
          <Button href="/irctc/trips" variant="secondary">See my trips</Button>
        )}
      </Card>
    </div>
  );
}
