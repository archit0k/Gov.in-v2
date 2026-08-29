"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowLeft, ArrowRight, Building2, Check, CircleAlert, Info, Lock, MapPin, ShieldCheck, Wallet,
} from "lucide-react";
import { Badge, Button, Card, SourceTag, cn } from "@/components/ui/primitives";
import { CITIZEN, daysUntil, formatDate, isoInDays } from "@/lib/data/citizen";
import {
  APPLICATION_TYPES, APPLICATION_TYPE_MAP, APPOINTMENT_STATES, KENDRAS, carryList, earliestOpening,
  feeFor, feeTotal, inventoryRange, makeFileNumber, processingDays,
  type Booklet, type Scheme, type ServiceType,
} from "@/lib/services/passport/engine";
import { newCaseId, useSession } from "@/lib/state/store";
import { useJourneyStep } from "@/components/journey/JourneyRail";

/* ============================================================
   PASSPORT SEVA - the department's own application

   The same six screens the citizen used to walk through on the
   main platform, now living where they belong: inside the
   department, backed by its real fee schedule and its real
   counter inventory. The journey rail travels alongside, so the
   citizen never stops being inside the journey that sent them.
   ============================================================ */

type Stage = "identity" | "existing" | "address" | "appointment" | "fee" | "review" | "done";

const STEPS: { id: Stage; label: string }[] = [
  { id: "identity", label: "Confirm it is you" },
  { id: "existing", label: "Your current passport" },
  { id: "address", label: "Where it goes" },
  { id: "appointment", label: "Seva Kendra slot" },
  { id: "fee", label: "Fee" },
  { id: "review", label: "Review and submit" },
];

const PARENT_CONSENT_ID = "passport-parent-details";



const REASONS: { id: ServiceType; label: string; hint: string }[] = APPLICATION_TYPES.filter(
  (a) => a.id !== "pcc",
).map((a) => ({ id: a.id, label: a.name, hint: a.detail }));

export function ApplyFlow({ journeyId, returnTo }: { journeyId?: string; returnTo?: string }) {
  const router = useRouter();
  const { state, dispatch } = useSession();
  const carried = useJourneyStep();

  useEffect(() => {
    if (journeyId) dispatch({ type: "carryJourney", journeyId });
  }, [journeyId, dispatch]);

  const [stage, setStage] = useState<Stage>("identity");
  // Read from the ledger rather than kept beside it. Two copies of the same
  // permission is how "the profile says granted but the department asks again"
  // happens, and the consent ledger is meant to be the single answer.
  const consent = state.consents.some((c) => c.id === PARENT_CONSENT_ID);
  const [type, setType] = useState<ServiceType>("reissue-expiry");
  const [booklet, setBooklet] = useState<Booklet>(36);
  const [scheme, setScheme] = useState<Scheme>("normal");
  const [emergency, setEmergency] = useState("spouse");
  const [otherName, setOtherName] = useState("");
  const [otherPhone, setOtherPhone] = useState("");
  const [kendra, setKendra] = useState("psk-nigdi");
  const [weekStart, setWeekStart] = useState(isoInDays(1));
  const [day, setDay] = useState<string | null>(null);
  const [slot, setSlot] = useState<string | null>(null);
  const [fileNo, setFileNo] = useState<string | null>(null);
  const [caseId, setCaseId] = useState<string | null>(null);

  const passport = CITIZEN.credentials.find((c) => c.id === "cred-passport")!;
  const at = APPLICATION_TYPE_MAP[type];
  const days = useMemo(() => inventoryRange(kendra, weekStart, 14, scheme), [kendra, weekStart, scheme]);
  const chosenDay = days.find((d) => d.date === day) ?? null;
  const fees = feeFor(type, scheme, booklet, 32);
  const total = feeTotal(fees);

  const idx = STEPS.findIndex((s) => s.id === stage);
  const go = (s: Stage) => {
    setStage(s);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  function submit() {
    if (fileNo) return; // Already filed. Re-entering this screen must not file twice.
    const f = makeFileNumber(kendra);
    setFileNo(f);
    go("done");
    const k = KENDRAS.find((x) => x.id === kendra)!;
    const id = newCaseId("passport");
    setCaseId(id);
    dispatch({
      type: "recordCase",
      caseId: id,
      journeyId,
      serviceId: "passport",
      title: at.name,
      states: APPOINTMENT_STATES,
      statusLine: `File ${f}. Appointment held at ${k.name} on ${formatDate(day!)} at ${slot}.`,
      data: {
        "File number": f,
        Service: at.name,
        Booklet: `${booklet} pages`,
        Scheme: scheme === "tatkaal" ? "Tatkaal" : "Normal",
        Kendra: k.name,
        Appointment: `${formatDate(day!)}, ${slot}`,
        "Emergency contact": emergency === "other" ? otherName : EMERGENCY.find((e) => e.id === emergency)!.name,
        Fee: `Rs ${total.toLocaleString("en-IN")}`,
      },
    });
  }

  return (
    <div className="grid gap-6">
      {stage !== "done" && <Progress idx={idx} />}

      {stage === "identity" && (
        <Screen
          stage="identity"
          title="Confirm it is you"
          intent="Passport Seva needs a high-assurance identity. You already have one, so there is nothing to upload."
          onNext={() => go("existing")}
          nextLabel="Continue"
          nextDisabled={!consent}
          blocked={!consent ? "Allow the one access below to continue" : undefined}
        >
          <Held rows={[
            ["Full name", CITIZEN.name, "Verified government profile", "/profile"],
            ["Date of birth", formatDate(CITIZEN.dob), "Verified government profile", "/profile"],
            ["Identity assurance", `High, verified in person on ${formatDate(CITIZEN.verifiedOn)}`, "Gov.in identity", "/profile"],
          ]} />

          <div className={cn("mt-4 rounded-[var(--r-md)] border p-4 transition-colors",
            consent ? "border-[var(--ok)] bg-[var(--ok-soft)]" : "border-[var(--line)] bg-[var(--panel-2)]")}>
            <div className="mb-3 flex items-start gap-2.5">
              <Lock size={15} className="mt-0.5 shrink-0 text-[var(--muted)]" />
              <div>
                <p className="text-[14px] font-medium leading-snug">Parent details from your citizen graph</p>
                <p className="mt-1 text-[12.5px] leading-relaxed text-[var(--muted)]">
                  Passport applications require parent names and places of birth. You have already given these to
                  government once.
                </p>
              </div>
            </div>
            <dl className="mb-3.5 grid gap-2 border-y border-[var(--line-2)] py-3 text-[12.5px] sm:grid-cols-[130px_1fr]">
              <dt className="text-[var(--muted)]">What</dt>
              <dd className="text-[var(--ink-2)]">Father and mother, name, date of birth, place of birth</dd>
              <dt className="text-[var(--muted)]">Why</dt>
              <dd className="text-[var(--ink-2)]">Statutory requirement under the Passports Act</dd>
              <dt className="text-[var(--muted)]">How long</dt>
              <dd className="text-[var(--ink-2)]">Held with your passport file only, not copied elsewhere</dd>
            </dl>
            {consent ? (
              <div className="flex items-center justify-between gap-3">
                <Badge tone="ok"><ShieldCheck size={11} strokeWidth={2.4} /> Granted and logged</Badge>
                <button
                  onClick={() => dispatch({ type: "revokeConsent", id: PARENT_CONSENT_ID })}
                  className="text-[12.5px] text-[var(--muted)] hover:underline"
                >
                  Withdraw
                </button>
              </div>
            ) : (
              <Button
                size="sm"
                onClick={() => {
                  dispatch({
                    type: "grantConsent",
                    grant: {
                      id: PARENT_CONSENT_ID,
                      attribute: "Father and mother, name, date of birth, place of birth",
                      requestedBy: "passport",
                      purpose: "Statutory requirement for passport issue under the Passports Act",
                      retention: "Held with your passport file only, not copied to other departments",
                      grantedAt: new Date().toISOString(),
                      journeyId: journeyId ?? "passport-renewal",
                    },
                  });
                }}
              >
                Allow this specific access
              </Button>
            )}
          </div>
        </Screen>
      )}

      {stage === "existing" && (
        <Screen
          stage="existing"
          title="Your current passport"
          intent="Reissue starts from what you already hold, so this is confirmation rather than entry."
          onBack={() => go("identity")}
          onNext={() => go("address")}
        >
          <Held rows={[
            ["Passport number", passport.number, "Passport Seva record"],
            ["Expires on", `${formatDate(passport.expiresOn!)}, in ${daysUntil(passport.expiresOn!)} days`, "Passport Seva record"],
            ["File number", passport.meta?.["File number"] ?? "", "Passport Seva record"],
          ]} />

          <Choice
            label="Why are you reapplying?"
            value={type}
            onChange={(v) => setType(v as ServiceType)}
            options={REASONS.map((r) => ({ value: r.id, label: r.label, hint: r.hint }))}
          />

          <Choice
            label="Booklet size"
            value={String(booklet)}
            onChange={(v) => setBooklet(Number(v) as Booklet)}
            options={[
              { value: "36", label: "36 pages", hint: "Standard" },
              { value: "60", label: "60 pages", hint: "For frequent travellers" },
            ]}
          />
        </Screen>
      )}

      {stage === "address" && (
        <Screen
          stage="address"
          title="Where should it be sent?"
          intent="Your verified current address also decides which police station handles verification."
          onBack={() => go("existing")}
          onNext={() => go("appointment")}
          nextDisabled={emergency === "other" && (!otherName.trim() || !otherPhone.trim())}
        >
          <Held rows={[
            ["Current address", `${CITIZEN.addresses[0].line1}, ${CITIZEN.addresses[0].line2}, ${CITIZEN.addresses[0].city}, ${CITIZEN.addresses[0].state} ${CITIZEN.addresses[0].pin}`, "Verified profile, updated Nov 2024", "/profile"],
            ["Father", "Ramesh Deshmukh", "Citizen graph, verified", "/profile/relationships"],
            ["Mother", "Sunanda Deshmukh", "Citizen graph, verified", "/profile/relationships"],
            ["Spouse", "Meera Deshmukh", "Citizen graph, verified", "/profile/relationships"],
          ]} />

          <Choice
            label="Emergency contact"
            help="Chosen from your citizen graph. Nobody types a phone number twice."
            value={emergency}
            onChange={setEmergency}
            options={[
              ...EMERGENCY.map((e) => ({ value: e.id, label: e.name, hint: e.relation })),
              { value: "other", label: "Someone else", hint: "We will need their details, because we do not hold them" },
            ]}
          />

          {emergency === "other" && (
            <div className="fade mt-3 grid gap-3 rounded-[var(--r-md)] border border-[var(--line)] bg-[var(--panel-2)] p-4 sm:grid-cols-2">
              <div className="grid gap-2">
                <label htmlFor="en" className="text-[13.5px] font-medium">Their full name</label>
                <input id="en" value={otherName} onChange={(e) => setOtherName(e.target.value)}
                  className="h-11 rounded-[var(--r-md)] border border-[var(--line)] bg-[var(--panel)] px-3 text-[14px] outline-none focus:border-[var(--accent)]" />
              </div>
              <div className="grid gap-2">
                <label htmlFor="ep" className="text-[13.5px] font-medium">Their mobile number</label>
                <input id="ep" value={otherPhone} onChange={(e) => setOtherPhone(e.target.value)} placeholder="+91"
                  className="h-11 rounded-[var(--r-md)] border border-[var(--line)] bg-[var(--panel)] px-3 text-[14px] outline-none focus:border-[var(--accent)]" />
              </div>
              <p className="text-[12px] leading-relaxed text-[var(--muted)] sm:col-span-2">
                Asked only because this person is not in your citizen graph. Add them later and no journey will
                ask again.
              </p>
            </div>
          )}
        </Screen>
      )}

      {stage === "appointment" && (
        <Screen
          stage="appointment"
          title="Pick your Seva Kendra slot"
          intent="Counter inventory is this department's own. Slots are held the moment you pick one, not after payment clears."
          onBack={() => go("address")}
          onNext={() => go("fee")}
          nextDisabled={!day || !slot}
          blocked={!day ? "Choose a day" : !slot ? "Choose a time" : undefined}
        >
          <div className="grid gap-2">
            {KENDRAS.map((k) => {
              const e = earliestOpening(k.id, scheme);
              return (
                <button key={k.id} onClick={() => { setKendra(k.id); setDay(null); setSlot(null); }}
                  className={cn("flex flex-wrap items-center gap-3 rounded-[var(--r-md)] border px-4 py-3 text-left transition-colors",
                    kendra === k.id ? "border-[var(--accent)] bg-[var(--accent-soft)]" : "border-[var(--line)] hover:border-[var(--faint)]")}>
                  {k.kind === "PSK" ? <Building2 size={16} className="shrink-0 text-[var(--muted)]" /> : <MapPin size={16} className="shrink-0 text-[var(--muted)]" />}
                  <span className="min-w-[190px] flex-1">
                    <span className="block text-[14.5px] font-medium">{k.name}</span>
                    <span className="block text-[12px] text-[var(--muted)]">{k.address}, {k.km} km</span>
                  </span>
                  <span className="text-right">
                    <span className="block text-[13px]">{e ? `Earliest ${formatDate(e.date)}` : "No slots in 45 days"}</span>
                    <span className="block text-[11.5px] text-[var(--muted)]">{k.counters} counters</span>
                  </span>
                </button>
              );
            })}
          </div>

          <div className="mt-5 border-t border-[var(--line)] pt-4">
            <div className="mb-3 flex flex-wrap items-center gap-2">
              <p className="text-[13.5px] font-medium">Pick a day</p>
              {scheme === "tatkaal" && <Badge tone="warn">Tatkaal quota, far fewer slots</Badge>}
              <div className="ml-auto flex gap-1.5">
                <Button size="sm" variant="secondary" onClick={() => setWeekStart(isoInDays(1))}>Next 14 days</Button>
                <Button size="sm" variant="secondary" onClick={() => setWeekStart(isoInDays(15))}>The fortnight after</Button>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-1.5 sm:grid-cols-4 lg:grid-cols-7">
              {days.map((d) => {
                const shut = !d.open || d.total === 0;
                return (
                  <button key={d.date} disabled={shut} onClick={() => { setDay(d.date); setSlot(null); }}
                    title={d.open ? `${d.total} free` : d.closedReason}
                    className={cn("rounded-[var(--r-md)] border p-2.5 text-left transition-colors",
                      day === d.date ? "border-[var(--accent)] bg-[var(--accent-soft)]"
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
              <div className="mt-5">
                <p className="mb-2.5 text-[13.5px] font-medium">{chosenDay.weekday}, {formatDate(chosenDay.date)}</p>
                <div className="flex flex-wrap gap-1.5">
                  {chosenDay.slots.map((s) => (
                    <button key={s.time} disabled={s.free === 0} onClick={() => setSlot(s.time)}
                      className={cn("tnum rounded-[var(--r-sm)] border px-3 py-2 text-[13px] transition-colors",
                        slot === s.time ? "border-[var(--accent)] bg-[var(--accent)] text-white"
                          : s.free === 0 ? "cursor-not-allowed border-[var(--line)] text-[var(--faint)] line-through"
                          : "border-[var(--line)] hover:border-[var(--accent)]")}>
                      {s.time}<span className="ml-1.5 text-[10.5px] opacity-70">{s.free || "full"}</span>
                    </button>
                  ))}
                </div>
                {slot && <p className="mt-3 text-[12.5px] text-[var(--ok)]">Held for you now, before payment rather than after it.</p>}
              </div>
            )}
          </div>
        </Screen>
      )}

      {stage === "fee" && (
        <Screen
          stage="fee"
          title="Fee"
          intent="One payment, one receipt, attached to the case."
          onBack={() => go("appointment")}
          onNext={() => go("review")}
        >
          <Choice
            label="Processing scheme"
            value={scheme}
            onChange={(v) => { setScheme(v as Scheme); setDay(null); setSlot(null); }}
            options={[
              { value: "normal", label: "Normal", hint: processingDays(type, "normal") },
              { value: "tatkaal", label: "Tatkaal", hint: `${processingDays(type, "tatkaal")}, plus Rs 2,000 and far fewer slots` },
            ]}
          />
          {scheme === "tatkaal" && (
            <p className="mt-2 flex gap-2 rounded-[var(--r-md)] bg-[var(--warn-soft)] p-3 text-[13px] leading-relaxed text-[var(--warn)]">
              <CircleAlert size={15} className="mt-0.5 shrink-0" />
              Changing the scheme releases the slot you picked, because Tatkaal draws from a separate quota.
            </p>
          )}

          <div className="mt-5 rounded-[var(--r-md)] border border-[var(--line)] bg-[var(--panel-2)] p-4">
            <div className="mb-3 flex items-center gap-2.5">
              <Wallet size={17} className="text-[var(--muted)]" />
              <p className="text-[14px] font-medium">What you pay</p>
            </div>
            <dl>
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
            <p className="mt-2 text-[12px] text-[var(--muted)]">
              Charged when you submit. The receipt attaches to the case automatically.
            </p>
          </div>
        </Screen>
      )}

      {stage === "review" && day && slot && (
        <Screen
          stage="review"
          title="Review and submit"
          intent={`Everything that will be sent to the Ministry of External Affairs.`}
          onBack={() => go("fee")}
          onSubmit={submit}
        >
          <dl className="divide-y divide-[var(--line)] border-y border-[var(--line)]">
            {[
              ["Applicant", CITIZEN.name],
              ["Service", at.name],
              ["Booklet", `${booklet} pages`],
              ["Scheme", scheme === "tatkaal" ? "Tatkaal" : "Normal"],
              ["Sent to", `${CITIZEN.addresses[0].city}, ${CITIZEN.addresses[0].state}`],
              ["Emergency contact", emergency === "other" ? `${otherName}, ${otherPhone}` : EMERGENCY.find((e) => e.id === emergency)!.name],
              ["Kendra", KENDRAS.find((k) => k.id === kendra)!.name],
              ["Appointment", `${formatDate(day)} at ${slot}`],
              ["Police verification", at.policeVerification === "pre" ? "Before issue" : "After dispatch"],
              ["Expected", processingDays(type, scheme)],
              ["Fee", `Rs ${total.toLocaleString("en-IN")}`],
            ].map(([k, v]) => (
              <div key={k} className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-0.5 py-2.5">
                <dt className="text-[13px] text-[var(--muted)]">{k}</dt>
                <dd className="max-w-[46ch] text-right text-[13.5px]">{v}</dd>
              </div>
            ))}
          </dl>

          <div className="mt-4">
            <p className="mb-2 text-[13.5px] font-medium">Carry on the day</p>
            <div className="grid gap-2">
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
          </div>
        </Screen>
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
            <ShieldCheck size={16} className="shrink-0 text-[var(--ok)]" />
            <p className="min-w-0 flex-1 text-[13px] leading-relaxed text-[var(--muted)]">
              This is a case in your Gov.in timeline. Verification, police status and dispatch arrive in your
              inbox against it, so there is no application number to keep safe.
            </p>
            {journeyId ? (
              <Button onClick={() => carried.complete("appointment", "done", caseId ?? undefined)}>
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

const EMERGENCY = [
  { id: "spouse", name: "Meera Deshmukh", relation: "Spouse" },
  { id: "father", name: "Ramesh Deshmukh", relation: "Father" },
  { id: "mother", name: "Sunanda Deshmukh", relation: "Mother" },
];

/* ---------------- Shared screen furniture ---------------- */

function Progress({ idx }: { idx: number }) {
  return (
    <ol className="flex items-stretch gap-1.5" aria-label="Progress">
      {STEPS.map((s, i) => (
        <li key={s.id} className="flex min-w-0 flex-1 flex-col gap-1.5" title={s.label}>
          <span className={cn("h-[3px] rounded-full transition-colors duration-500",
            i <= idx ? "bg-[var(--accent)]" : "bg-[var(--line)]")} />
          <span className={cn("truncate text-[11px] leading-tight",
            i === idx ? "font-medium text-[var(--ink)]" : "text-[var(--faint)]")}>
            {s.label}
          </span>
        </li>
      ))}
    </ol>
  );
}

function Screen({
  stage, title, intent, children, onBack, onNext, onSubmit, nextLabel = "Continue", nextDisabled, blocked,
}: {
  stage: Stage; title: string; intent: string; children: React.ReactNode;
  onBack?: () => void; onNext?: () => void; onSubmit?: () => void;
  nextLabel?: string; nextDisabled?: boolean; blocked?: string;
}) {
  const [busy, setBusy] = useState(false);
  const idx = STEPS.findIndex((s) => s.id === stage);
  return (
    <Card className="overflow-hidden">
      <div className="border-b border-[var(--line-2)] px-5 py-4 sm:px-6">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 className="text-[18px] font-semibold leading-snug">{title}</h2>
            <p className="mt-1 max-w-[62ch] text-[13.5px] leading-relaxed text-[var(--muted)]">{intent}</p>
          </div>
          {idx >= 0 && <span className="tnum shrink-0 pt-1 text-[12px] text-[var(--faint)]">{idx + 1}/{STEPS.length}</span>}
        </div>
      </div>

      <div className="px-5 py-5 sm:px-6">{children}</div>

      <div className="flex flex-wrap items-center gap-3 border-t border-[var(--line-2)] bg-[var(--panel-2)] px-5 py-4 sm:px-6">
        {onBack && <Button variant="ghost" onClick={onBack}><ArrowLeft size={15} /> Back</Button>}
        <div className="ml-auto flex items-center gap-3">
          {blocked && <span className="hidden text-[12.5px] text-[var(--muted)] sm:inline">{blocked}</span>}
          {onSubmit ? (
            <Button size="lg" disabled={busy} onClick={() => { setBusy(true); setTimeout(onSubmit, 900); }}>
              {busy ? (<><span className="h-1.5 w-1.5 animate-[pulse-soft_0.9s_infinite] rounded-full bg-current" /> Submitting</>) : (<><Check size={16} /> Submit</>)}
            </Button>
          ) : (
            <Button onClick={onNext} disabled={nextDisabled}>{nextLabel} <ArrowRight size={15} /></Button>
          )}
        </div>
      </div>
    </Card>
  );
}

/**
 * Values the citizen does not retype because government already holds them.
 *
 * The fourth entry is where the value is actually maintained. A row that has
 * one offers to take you there; a row held by the department itself offers
 * nothing, because a button that cannot change anything is worse than no
 * button - and the Ministry's own register is not the citizen's to edit.
 */
function Held({ rows }: { rows: (string | undefined)[][] }) {
  return (
    <div className="divide-y divide-[var(--line-2)]">
      {rows.map(([k, v, src, href]) => (
        <div key={k} className="flex flex-wrap items-start justify-between gap-x-6 gap-y-1.5 py-3 first:pt-0">
          <div className="min-w-0">
            <p className="text-[12.5px] text-[var(--muted)]">{k}</p>
            <p className="mt-0.5 text-[15px] leading-snug">{v}</p>
            {src && <SourceTag label={src} className="mt-1.5" />}
          </div>
          {href ? (
            <Link href={href} className="shrink-0 text-[12.5px] text-[var(--accent)] hover:underline">
              Change in your profile
            </Link>
          ) : (
            <span className="shrink-0 text-[12.5px] text-[var(--faint)]">Held by this department</span>
          )}
        </div>
      ))}
    </div>
  );
}

function Choice({
  label, help, value, onChange, options,
}: {
  label: string; help?: string; value: string; onChange: (v: string) => void;
  options: { value: string; label: string; hint?: string }[];
}) {
  return (
    <div className="mt-5 border-t border-[var(--line-2)] pt-4 first:mt-0 first:border-0 first:pt-0">
      <p className="mb-1 text-[13.5px] font-medium">{label}</p>
      {help && <p className="mb-2.5 text-[12.5px] leading-relaxed text-[var(--muted)]">{help}</p>}
      <div className="mt-2 grid gap-1.5">
        {options.map((o) => (
          <button key={o.value} onClick={() => onChange(o.value)}
            className={cn("flex items-center gap-3 rounded-[var(--r-md)] border px-3.5 py-3 text-left transition-colors",
              value === o.value ? "border-[var(--accent)] bg-[var(--accent-soft)]" : "border-[var(--line)] hover:border-[var(--faint)]")}>
            <span className={cn("grid h-[18px] w-[18px] shrink-0 place-items-center rounded-full border-2",
              value === o.value ? "border-[var(--accent)]" : "border-[var(--line)]")}>
              {value === o.value && <span className="h-2 w-2 rounded-full bg-[var(--accent)]" />}
            </span>
            <span className="min-w-0 flex-1">
              <span className="block text-[14px] leading-snug">{o.label}</span>
              {o.hint && <span className="mt-0.5 block text-[12px] text-[var(--muted)]">{o.hint}</span>}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}
