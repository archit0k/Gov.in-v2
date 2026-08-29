"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, ArrowRight, Building2, Check, CircleAlert, Info, MapPin, ShieldCheck } from "lucide-react";
import { Badge, Button, Card, SourceTag, cn } from "@/components/ui/primitives";
import { CITIZEN, formatDate, daysUntil } from "@/lib/data/citizen";
import {
  APPLICATION_TYPES, APPLICATION_TYPE_MAP, APPOINTMENT_STATES, KENDRAS, carryList, earliestOpening,
  feeFor, feeTotal, inventoryRange, makeFileNumber, processingDays,
  type Booklet, type Scheme, type ServiceType,
} from "@/lib/services/passport/engine";
import { newCaseId, useSession } from "@/lib/state/store";
import { useJourneyStep } from "@/components/journey/JourneyRail";

/* ============================================================
   PASSPORT SEVA - the department's own application

   Appointment inventory is the clearest example of a thing the
   infrastructure could never hold: only the office that staffs
   the counters knows how many are open next Tuesday. Identity,
   address and parentage arrive from Gov.in with consent, which
   is why this asks four questions instead of seventy-eight.
   ============================================================ */

type Stage = "type" | "details" | "appointment" | "review" | "done";

const STAGES: { id: Stage; label: string }[] = [
  { id: "type", label: "What you need" },
  { id: "details", label: "Your details" },
  { id: "appointment", label: "Appointment" },
  { id: "review", label: "Review" },
  { id: "done", label: "Confirmation" },
];

const isoPlus = (d: number) => new Date(Date.now() + d * 86_400_000).toISOString().slice(0, 10);

export function ApplyFlow({ journeyId, returnTo }: { journeyId?: string; returnTo?: string }) {
  const router = useRouter();
  const { dispatch } = useSession();
  const carried = useJourneyStep();

  useEffect(() => {
    if (journeyId) dispatch({ type: "carryJourney", journeyId });
  }, [journeyId, dispatch]);

  const [stage, setStage] = useState<Stage>("type");
  const [type, setType] = useState<ServiceType>("reissue-expiry");
  const [scheme, setScheme] = useState<Scheme>("normal");
  const [booklet, setBooklet] = useState<Booklet>(36);
  const [kendra, setKendra] = useState<string>("psk-nigdi");
  const [weekStart, setWeekStart] = useState(isoPlus(1));
  const [day, setDay] = useState<string | null>(null);
  const [slot, setSlot] = useState<string | null>(null);
  const [emergency, setEmergency] = useState("spouse");
  const [fileNo, setFileNo] = useState<string | null>(null);

  const passport = CITIZEN.credentials.find((c) => c.id === "cred-passport")!;
  const days = useMemo(() => inventoryRange(kendra, weekStart, 14, scheme), [kendra, weekStart, scheme]);
  const chosenDay = days.find((d) => d.date === day) ?? null;
  const fees = feeFor(type, scheme, booklet, 32);
  const total = feeTotal(fees);
  const at = APPLICATION_TYPE_MAP[type];

  function submit() {
    const f = makeFileNumber(kendra);
    setFileNo(f);
    setStage("done");
    const k = KENDRAS.find((x) => x.id === kendra)!;
    const caseId = newCaseId("passport");
    dispatch({
      type: "recordCase",
      caseId,
      serviceId: "passport",
      title: at.name,
      states: APPOINTMENT_STATES,
      statusLine: `File ${f}. Appointment held at ${k.name} on ${formatDate(day!)} at ${slot}.`,
      data: {
        "File number": f,
        Service: at.name,
        Scheme: scheme === "tatkaal" ? "Tatkaal" : "Normal",
        Booklet: `${booklet} pages`,
        Kendra: k.name,
        Appointment: `${formatDate(day!)}, ${slot}`,
        "Police verification": at.policeVerification === "pre" ? "Before issue" : at.policeVerification === "post" ? "After dispatch" : "Not required",
        Fee: `Rs ${total.toLocaleString("en-IN")}`,
      },
    });
  }

  return (
    <div className="grid gap-6">
      <ol className="flex flex-wrap items-center gap-x-2 gap-y-1 text-[12.5px]">
        {STAGES.map((s, n) => {
          const i = STAGES.findIndex((x) => x.id === stage);
          return (
            <li key={s.id} className="flex items-center gap-2">
              {n > 0 && <span className="text-[var(--faint)]">›</span>}
              <span className={cn(n === i ? "font-semibold text-[var(--accent)]" : n < i ? "text-[var(--ink-2)]" : "text-[var(--faint)]")}>
                {s.label}
              </span>
            </li>
          );
        })}
      </ol>

      {stage === "type" && (
        <div className="grid gap-4">
          <Card className="p-5">
            <h2 className="text-[17px] font-semibold">What do you need?</h2>
            <p className="mt-1 text-[13.5px] text-[var(--muted)]">
              Your passport expires in {daysUntil(passport.expiresOn!)} days, on {formatDate(passport.expiresOn!)}.
            </p>
            <div className="mt-4 grid gap-2">
              {APPLICATION_TYPES.map((a) => (
                <button
                  key={a.id}
                  onClick={() => setType(a.id)}
                  className={cn(
                    "flex items-start gap-3 rounded-[var(--r-md)] border px-4 py-3 text-left transition-colors",
                    type === a.id ? "border-[var(--accent)] bg-[var(--accent-soft)]" : "border-[var(--line)] hover:border-[var(--faint)]",
                  )}
                >
                  <span className={cn("mt-1.5 h-2 w-2 shrink-0 rounded-full", type === a.id ? "bg-[var(--accent)]" : "bg-[var(--line)]")} />
                  <span className="min-w-0">
                    <span className="flex flex-wrap items-center gap-2">
                      <span className="text-[14.5px] font-medium">{a.name}</span>
                      {a.id === "reissue-expiry" && <Badge tone="ok">Applies to you</Badge>}
                    </span>
                    <span className="mt-0.5 block text-[12.5px] leading-relaxed text-[var(--muted)]">{a.detail}</span>
                  </span>
                </button>
              ))}
            </div>
          </Card>

          {type !== "pcc" && (
            <Card className="p-5">
              <h3 className="text-[15px] font-semibold">Booklet and scheme</h3>
              <div className="mt-3 grid gap-4 sm:grid-cols-2">
                <div>
                  <p className="mb-2 text-[13.5px] font-medium">Pages</p>
                  <div className="grid gap-1.5">
                    {([36, 60] as Booklet[]).map((b) => (
                      <button key={b} onClick={() => setBooklet(b)}
                        className={cn("rounded-[var(--r-md)] border px-3.5 py-2.5 text-left text-[14px] transition-colors",
                          booklet === b ? "border-[var(--accent)] bg-[var(--accent-soft)]" : "border-[var(--line)] hover:border-[var(--faint)]")}>
                        {b} pages
                        <span className="ml-2 text-[12px] text-[var(--muted)]">{b === 60 ? "frequent travellers" : "standard"}</span>
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <p className="mb-2 text-[13.5px] font-medium">Scheme</p>
                  <div className="grid gap-1.5">
                    {(["normal", "tatkaal"] as Scheme[]).map((sc) => (
                      <button key={sc} onClick={() => { setScheme(sc); setDay(null); setSlot(null); }}
                        className={cn("rounded-[var(--r-md)] border px-3.5 py-2.5 text-left text-[14px] capitalize transition-colors",
                          scheme === sc ? "border-[var(--accent)] bg-[var(--accent-soft)]" : "border-[var(--line)] hover:border-[var(--faint)]")}>
                        {sc}
                        <span className="ml-2 text-[12px] text-[var(--muted)]">{sc === "tatkaal" ? "+Rs 2,000, far fewer slots" : "standard fee"}</span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </Card>
          )}

          <div className="flex justify-end">
            <Button size="lg" onClick={() => setStage("details")}>Continue <ArrowRight size={15} /></Button>
          </div>
        </div>
      )}

      {stage === "details" && (
        <div className="grid gap-4">
          <Card className="p-5">
            <h2 className="text-[17px] font-semibold">What the Ministry already holds</h2>
            <p className="mt-1 max-w-[70ch] text-[13.5px] leading-relaxed text-[var(--muted)]">
              Read from Gov.in with your consent when this application was opened. Correct anything that is wrong
              and the correction goes back to the department that owns it.
            </p>
            <dl className="mt-4 divide-y divide-[var(--line)] border-y border-[var(--line)]">
              {[
                ["Full name", CITIZEN.name, "Verified government profile"],
                ["Date of birth", formatDate(CITIZEN.dob), "Verified government profile"],
                ["Current address", `${CITIZEN.addresses[0].line1}, ${CITIZEN.addresses[0].city}`, "Verified, updated Nov 2024"],
                ["Father", "Ramesh Deshmukh", "Citizen graph, verified"],
                ["Mother", "Sunanda Deshmukh", "Citizen graph, verified"],
                ["Existing passport", passport.number, "Passport Seva record"],
              ].map(([k, v, src]) => (
                <div key={k} className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-1 py-3">
                  <dt className="text-[13px] text-[var(--muted)]">{k}</dt>
                  <dd className="text-right">
                    <span className="block text-[14px]">{v}</span>
                    <span className="block text-[11.5px] text-[var(--muted)]">{src}</span>
                  </dd>
                </div>
              ))}
            </dl>
            <SourceTag label="Nothing here was typed. Six facts, six departments, one consent." className="mt-3" />
          </Card>

          <Card className="p-5">
            <h3 className="text-[15px] font-semibold">Emergency contact</h3>
            <p className="mt-1 text-[13px] text-[var(--muted)]">Chosen from your citizen graph.</p>
            <div className="mt-3 grid gap-1.5 sm:grid-cols-3">
              {[["spouse", "Meera Deshmukh", "Spouse"], ["father", "Ramesh Deshmukh", "Father"], ["mother", "Sunanda Deshmukh", "Mother"]].map(([id, n, r]) => (
                <button key={id} onClick={() => setEmergency(id)}
                  className={cn("rounded-[var(--r-md)] border px-3.5 py-2.5 text-left transition-colors",
                    emergency === id ? "border-[var(--accent)] bg-[var(--accent-soft)]" : "border-[var(--line)] hover:border-[var(--faint)]")}>
                  <span className="block text-[14px]">{n}</span>
                  <span className="block text-[12px] text-[var(--muted)]">{r}</span>
                </button>
              ))}
            </div>
          </Card>

          <Card className="p-5">
            <h3 className="text-[15px] font-semibold">What to carry on the day</h3>
            <div className="mt-3 grid gap-2">
              {carryList(type).map((c) => (
                <div key={c.item} className="flex gap-3 rounded-[var(--r-md)] border border-[var(--line)] p-3">
                  <span className={cn("mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-full",
                    c.status === "held" ? "bg-[var(--ok-soft)] text-[var(--ok)]" : "bg-[var(--warn-soft)] text-[var(--warn)]")}>
                    {c.status === "held" ? <Check size={12} strokeWidth={3} /> : <Info size={12} strokeWidth={3} />}
                  </span>
                  <span className="min-w-0">
                    <span className="flex flex-wrap items-center gap-2">
                      <span className="text-[14px] font-medium">{c.item}</span>
                      <Badge tone={c.status === "held" ? "ok" : "warn"}>{c.status === "held" ? "Already held" : "Carry it"}</Badge>
                    </span>
                    <span className="mt-0.5 block text-[12.5px] leading-relaxed text-[var(--muted)]">{c.note}</span>
                  </span>
                </div>
              ))}
            </div>
          </Card>

          <div className="flex items-center gap-3">
            <Button variant="ghost" onClick={() => setStage("type")}><ArrowLeft size={15} /> Back</Button>
            <Button size="lg" className="ml-auto" onClick={() => setStage("appointment")}>Choose an appointment <ArrowRight size={15} /></Button>
          </div>
        </div>
      )}

      {stage === "appointment" && (
        <div className="grid gap-4">
          <Card className="p-5">
            <h2 className="text-[17px] font-semibold">Where do you want to go?</h2>
            <p className="mt-1 text-[13.5px] text-[var(--muted)]">
              Ordered by distance from your verified address. Slot counts are this department&apos;s own inventory.
            </p>
            <div className="mt-4 grid gap-2">
              {KENDRAS.map((k) => {
                const e = earliestOpening(k.id, scheme);
                return (
                  <button key={k.id} onClick={() => { setKendra(k.id); setDay(null); setSlot(null); }}
                    className={cn("flex flex-wrap items-center gap-3 rounded-[var(--r-md)] border px-4 py-3 text-left transition-colors",
                      kendra === k.id ? "border-[var(--accent)] bg-[var(--accent-soft)]" : "border-[var(--line)] hover:border-[var(--faint)]")}>
                    {k.kind === "PSK" ? <Building2 size={16} className="shrink-0 text-[var(--muted)]" /> : <MapPin size={16} className="shrink-0 text-[var(--muted)]" />}
                    <span className="min-w-[200px] flex-1">
                      <span className="block text-[14.5px] font-medium">{k.name}</span>
                      <span className="block text-[12px] text-[var(--muted)]">{k.address} · {k.km} km</span>
                    </span>
                    <span className="text-right">
                      <span className="block text-[13px]">{e ? `Earliest ${formatDate(e.date)}` : "No slots in 45 days"}</span>
                      <span className="block text-[11.5px] text-[var(--muted)]">{k.counters} counters</span>
                    </span>
                  </button>
                );
              })}
            </div>
          </Card>

          <Card className="p-5">
            <div className="flex flex-wrap items-center gap-3">
              <h3 className="text-[15px] font-semibold">Pick a day</h3>
              {scheme === "tatkaal" && <Badge tone="warn">Tatkaal quota, far fewer slots</Badge>}
              <div className="ml-auto flex gap-1.5">
                <Button size="sm" variant="secondary" onClick={() => setWeekStart(isoPlus(1))}>Next 14 days</Button>
                <Button size="sm" variant="secondary" onClick={() => setWeekStart(isoPlus(15))}>The fortnight after</Button>
              </div>
            </div>

            <div className="mt-4 grid grid-cols-2 gap-1.5 sm:grid-cols-4 lg:grid-cols-7">
              {days.map((d) => {
                const on = day === d.date;
                const shut = !d.open || d.total === 0;
                return (
                  <button key={d.date} disabled={shut} onClick={() => { setDay(d.date); setSlot(null); }}
                    title={d.open ? `${d.total} free` : d.closedReason}
                    className={cn("rounded-[var(--r-md)] border p-2.5 text-left transition-colors",
                      on ? "border-[var(--accent)] bg-[var(--accent-soft)]"
                        : shut ? "cursor-not-allowed border-[var(--line)] opacity-45"
                        : "border-[var(--line)] hover:border-[var(--accent)]")}>
                    <span className="block text-[11.5px] text-[var(--muted)]">{d.weekday.slice(0, 3)}</span>
                    <span className="tnum block text-[15px] font-semibold">{d.date.slice(8)}</span>
                    <span className={cn("mt-0.5 block text-[11px]", d.open && d.total > 0 ? "text-[var(--ok)]" : "text-[var(--faint)]")}>
                      {d.open ? (d.total > 0 ? `${d.total} free` : "Full") : "Closed"}
                    </span>
                  </button>
                );
              })}
            </div>

            {chosenDay && (
              <div className="mt-5 border-t border-[var(--line)] pt-4">
                <p className="mb-2.5 text-[13.5px] font-medium">
                  {chosenDay.weekday}, {formatDate(chosenDay.date)}
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {chosenDay.slots.map((s) => (
                    <button key={s.time} disabled={s.free === 0} onClick={() => setSlot(s.time)}
                      className={cn("tnum rounded-[var(--r-sm)] border px-3 py-2 text-[13px] transition-colors",
                        slot === s.time ? "border-[var(--accent)] bg-[var(--accent)] text-white"
                          : s.free === 0 ? "cursor-not-allowed border-[var(--line)] text-[var(--faint)] line-through"
                          : "border-[var(--line)] hover:border-[var(--accent)]")}>
                      {s.time}
                      <span className="ml-1.5 text-[10.5px] opacity-70">{s.free || "full"}</span>
                    </button>
                  ))}
                </div>
                {slot && (
                  <p className="mt-3 text-[12.5px] text-[var(--ok)]">
                    Held for you now, before payment rather than after it.
                  </p>
                )}
              </div>
            )}
          </Card>

          <div className="flex items-center gap-3">
            <Button variant="ghost" onClick={() => setStage("details")}><ArrowLeft size={15} /> Back</Button>
            <Button size="lg" className="ml-auto" disabled={!day || !slot} onClick={() => setStage("review")}>
              Review <ArrowRight size={15} />
            </Button>
          </div>
        </div>
      )}

      {stage === "review" && day && slot && (
        <div className="grid gap-4 lg:grid-cols-[1.35fr_1fr]">
          <Card className="p-5">
            <h2 className="text-[17px] font-semibold">{at.name}</h2>
            <dl className="mt-4 divide-y divide-[var(--line)] border-y border-[var(--line)]">
              {[
                ["Applicant", CITIZEN.name],
                ["Scheme", scheme === "tatkaal" ? "Tatkaal" : "Normal"],
                ...(type !== "pcc" ? [["Booklet", `${booklet} pages`]] : []),
                ["Kendra", KENDRAS.find((k) => k.id === kendra)!.name],
                ["Appointment", `${formatDate(day)} at ${slot}`],
                ["Police verification", at.policeVerification === "pre" ? "Before issue" : at.policeVerification === "post" ? "After dispatch" : "Not required"],
                ["Expected", processingDays(type, scheme)],
              ].map(([k, v]) => (
                <div key={k} className="flex flex-wrap items-baseline justify-between gap-x-6 py-2.5">
                  <dt className="text-[13px] text-[var(--muted)]">{k}</dt>
                  <dd className="text-right text-[13.5px]">{v}</dd>
                </div>
              ))}
            </dl>
            {at.policeVerification === "post" && (
              <p className="mt-3 flex gap-2 rounded-[var(--r-md)] bg-[var(--ok-soft)] p-3 text-[13px] leading-relaxed text-[var(--ok)]">
                <ShieldCheck size={15} className="mt-0.5 shrink-0" />
                Your address is already verified with a known jurisdiction, so verification runs after dispatch
                rather than holding up the booklet.
              </p>
            )}
          </Card>

          <div className="grid content-start gap-4">
            <Card className="p-5">
              <h3 className="text-[15px] font-semibold">Fee</h3>
              <dl className="mt-3">
                {fees.map((f) => (
                  <div key={f.label} className="flex items-baseline justify-between gap-4 border-b border-[var(--line-2)] py-2 last:border-0">
                    <dt className="text-[13px] text-[var(--muted)]">{f.label}</dt>
                    <dd className="tnum text-[13.5px]">Rs {f.amount.toLocaleString("en-IN")}</dd>
                  </div>
                ))}
              </dl>
              <div className="mt-3 flex items-baseline justify-between border-t border-[var(--line)] pt-3">
                <span className="text-[14px] font-semibold">Total</span>
                <span className="tnum text-[22px] font-semibold">Rs {total.toLocaleString("en-IN")}</span>
              </div>
            </Card>

            <div className="flex items-center gap-3">
              <Button variant="ghost" onClick={() => setStage("appointment")}><ArrowLeft size={15} /> Back</Button>
              <Button size="lg" className="ml-auto" onClick={submit}>Pay and submit</Button>
            </div>
          </div>
        </div>
      )}

      {stage === "done" && fileNo && day && slot && (
        <div className="grid gap-4">
          <Card className="overflow-hidden">
            <div className="flex flex-wrap items-center gap-3 border-b border-[var(--line)] bg-[var(--ok-soft)] px-5 py-3">
              <Check size={17} className="shrink-0 text-[var(--ok)]" />
              <p className="text-[14.5px] font-medium">Submitted. File number {fileNo}</p>
            </div>
            <div className="p-5">
              <dl className="divide-y divide-[var(--line)] border-y border-[var(--line)]">
                {[
                  ["Appointment", `${formatDate(day)} at ${slot}`],
                  ["Kendra", KENDRAS.find((k) => k.id === kendra)!.name],
                  ["Carry", carryList(type).filter((c) => c.status !== "held").map((c) => c.item).join(", ") || "Nothing. Everything needed is already verified."],
                  ["Paid", `Rs ${total.toLocaleString("en-IN")}`],
                ].map(([k, v]) => (
                  <div key={k} className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-1 py-3">
                    <dt className="text-[13px] text-[var(--muted)]">{k}</dt>
                    <dd className="max-w-[46ch] text-right text-[13.5px]">{v}</dd>
                  </div>
                ))}
              </dl>
            </div>
          </Card>

          <Card className="flex flex-wrap items-center gap-3 p-4">
            <CircleAlert size={16} className="shrink-0 text-[var(--muted)]" />
            <p className="min-w-0 flex-1 text-[13px] leading-relaxed text-[var(--muted)]">
              This is a case in your Gov.in timeline. Verification, police status and dispatch arrive in your
              inbox against it, so there is no application number to keep safe.
            </p>
            {journeyId ? (
              <Button onClick={() => carried.complete("appointment", "done")}>
                Back to your journey <ArrowRight size={15} />
              </Button>
            ) : returnTo ? (
              <Button onClick={() => router.push(returnTo)}>Continue <ArrowRight size={15} /></Button>
            ) : (
              <Button href="/passport/track" variant="secondary">Track this application</Button>
            )}
          </Card>
        </div>
      )}
    </div>
  );
}
