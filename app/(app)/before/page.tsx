"use client";

import { useState } from "react";
import { ArrowRight, Check, Info } from "lucide-react";
import { Page, PageHead } from "@/components/shell/AppShell";
import { Badge, Button, Card, SectionTitle, ServiceMark, SourceTag, cn } from "@/components/ui/primitives";
import { JOURNEY_MAP } from "@/lib/data/journeys";
import { readProfile } from "@/lib/data/citizen";
import { LEGACY, LEGACY_DECISIONS, LEGACY_KNOWN, LEGACY_TOTAL, type Flag } from "@/lib/data/legacy";

/* ============================================================
   THE COMPARISON
   A reconstruction of the field burden a citizen carries through
   the existing passport reissue application, next to the same
   outcome on shared infrastructure.

   This is a reconstruction from the published form structure for
   the purpose of comparison. No government site's code, markup or
   branding is used, and this is not affiliated with any of them.
   ============================================================ */

const FLAG_LABEL: Record<Exclude<Flag, null>, { text: string; tone: "warn" | "danger" | "info" | "neutral" }> = {
  known: { text: "government already holds this", tone: "warn" },
  repeat: { text: "asked again, a page later", tone: "danger" },
  jargon: { text: "unexplained term", tone: "info" },
  rare: { text: "mandatory, rarely relevant", tone: "neutral" },
};

export default function BeforePage() {
  const [annotate, setAnnotate] = useState(true);
  const j = JOURNEY_MAP["passport-renewal"];

  return (
    <Page wide>
      <PageHead
        eyebrow={<Badge tone="accent">Same citizen, same outcome, same day</Badge>}
        title="What this actually replaces"
        sub="Renewing one passport. On the left, the field burden the citizen carries today. On the right, the same application on shared infrastructure. Nothing was removed from what the Ministry receives — it is asked for differently."
      />

      <div className="mb-6 grid gap-3 sm:grid-cols-3">
        <Card className="p-4">
          <p className="tnum text-[28px] font-semibold leading-none">{LEGACY_TOTAL}</p>
          <p className="mt-1.5 text-[13px] text-[var(--muted)]">fields on the existing application</p>
        </Card>
        <Card className="p-4">
          <p className="tnum text-[28px] font-semibold leading-none text-[var(--warn)]">{LEGACY_KNOWN}</p>
          <p className="mt-1.5 text-[13px] text-[var(--muted)]">of them government already holds about you</p>
        </Card>
        <Card className="border-[var(--ok)] bg-[var(--ok-soft)] p-4">
          <p className="tnum text-[28px] font-semibold leading-none text-[var(--ok)]">{LEGACY_DECISIONS}</p>
          <p className="mt-1.5 text-[13px] text-[var(--ink-2)]">decisions only you can make</p>
        </Card>
      </div>

      <div className="mb-4 flex flex-wrap items-center gap-3">
        <button
          onClick={() => setAnnotate((a) => !a)}
          className={cn(
            "flex items-center gap-2 rounded-[2px] border px-3.5 py-1.5 text-[13px] transition-colors",
            annotate
              ? "border-[var(--accent)] bg-[var(--accent-soft)] text-[var(--accent)]"
              : "border-[var(--line)] text-[var(--ink-2)] hover:border-[var(--faint)]",
          )}
        >
          <span
            className={cn(
              "grid h-4 w-4 place-items-center rounded-[3px] border transition-colors",
              annotate ? "border-[var(--accent)] bg-[var(--accent)] text-white" : "border-[var(--faint)]",
            )}
          >
            {annotate && <Check size={11} strokeWidth={3.2} />}
          </span>
          Show what is wrong with it
        </button>
        <span className="text-[12.5px] text-[var(--muted)]">
          The problem is not that the form is ugly. It is that it asks the citizen to be the integration layer.
        </span>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        {/* ---- Before ---- */}
        <section>
          <SectionTitle>Today</SectionTitle>
          <Card className="max-h-[720px] overflow-y-auto p-0">
            <div className="sticky top-0 z-10 border-b border-[var(--line)] bg-[var(--panel-2)] px-4 py-3">
              <p className="text-[13.5px] font-medium">Application for reissue of passport</p>
              <p className="mt-0.5 text-[11.5px] text-[var(--muted)]">
                All fields marked <span className="text-[var(--danger)]">*</span> are mandatory. Reconstruction for
                comparison — not affiliated with any government site.
              </p>
            </div>
            <div className="divide-y divide-[var(--line-2)]">
              {LEGACY.map((sec) => (
                <div key={sec.title} className="px-4 py-3.5">
                  <p className="mb-2.5 text-[11px] font-semibold uppercase tracking-[0.08em] text-[var(--muted)]">
                    {sec.title}
                  </p>
                  <div className="grid gap-1.5">
                    {sec.fields.map((f) => (
                      <div key={sec.title + f.label} className="grid gap-1">
                        <label className="text-[11.5px] leading-tight text-[var(--ink-2)]">
                          {f.label}
                          {f.required && <span className="text-[var(--danger)]"> *</span>}
                        </label>
                        <div className="h-[26px] rounded-[3px] border border-[var(--line)] bg-[var(--panel-2)]" />
                        {annotate && f.flag && (
                          <span
                            className={cn(
                              "fade w-fit rounded-[3px] px-1.5 py-0.5 text-[10.5px] leading-tight",
                              f.flag === "known" && "bg-[var(--warn-soft)] text-[var(--warn)]",
                              f.flag === "repeat" && "bg-[var(--danger-soft)] text-[var(--danger)]",
                              f.flag === "jargon" && "bg-[var(--info-soft)] text-[var(--info)]",
                              f.flag === "rare" && "bg-[var(--line-2)] text-[var(--muted)]",
                            )}
                          >
                            {FLAG_LABEL[f.flag].text}
                          </span>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </section>

        {/* ---- After ---- */}
        <section>
          <SectionTitle>On shared infrastructure</SectionTitle>
          <Card className="max-h-[720px] overflow-y-auto p-0">
            <div className="sticky top-0 z-10 flex items-center gap-2.5 border-b border-[var(--line)] bg-[var(--panel-2)] px-4 py-3">
              <ServiceMark id="passport" size={28} />
              <div>
                <p className="text-[13.5px] font-medium">{j.title}</p>
                <p className="text-[11.5px] text-[var(--muted)]">Passport Seva · about {j.estMinutes} minutes</p>
              </div>
            </div>

            <div className="divide-y divide-[var(--line-2)]">
              <div className="px-4 py-3.5">
                <p className="mb-2.5 text-[11px] font-semibold uppercase tracking-[0.08em] text-[var(--muted)]">
                  Retrieved, not requested
                </p>
                <div className="grid gap-2.5">
                  {[
                    ["Name, date of birth, gender, place of birth", "citizen.name", "Verified government profile"],
                    ["Present and permanent address", "address.current", "Verified government profile"],
                    ["Father, mother and spouse", "relationship.father", "Citizen graph · verified"],
                    ["Previous passport, file number, expiry", "credential.passport", "Passport Seva record"],
                    ["PAN and Aadhaar linkage", "credential.pan", "Income Tax record"],
                    ["Mobile and email", "citizen.phone", "Verified, OTP-confirmed"],
                  ].map(([label, path, src]) => (
                    <div key={label} className="rounded-[3px] border border-[var(--line)] bg-[var(--panel-2)] px-3 py-2">
                      <p className="text-[12.5px] text-[var(--ink-2)]">{label}</p>
                      <p className="mt-0.5 truncate text-[13px] text-[var(--ink)]">{readProfile(path)}</p>
                      <SourceTag label={src} className="mt-1" />
                    </div>
                  ))}
                </div>
                <p className="mt-3 text-[12px] leading-relaxed text-[var(--muted)]">
                  Each value is read from the department that owns it, with your consent, at the moment it is needed.
                  Nothing is copied into a second database.
                </p>
              </div>

              <div className="px-4 py-3.5">
                <p className="mb-2.5 text-[11px] font-semibold uppercase tracking-[0.08em] text-[var(--muted)]">
                  Asked, because only you can answer
                </p>
                <div className="grid gap-2">
                  {[
                    ["Why are you reapplying?", "Expiry, pages exhausted, or damage — this changes the process."],
                    ["36 or 60 pages?", "A preference, not a fact about you."],
                    ["Which Seva Kendra and when?", "Three near you, with real slots."],
                    ["Who is your emergency contact?", "Picked from your citizen graph, not typed."],
                  ].map(([q, why]) => (
                    <div key={q} className="rounded-[3px] border border-[var(--accent-line)] bg-[var(--accent-soft)] px-3 py-2">
                      <p className="text-[13px] font-medium text-[var(--ink)]">{q}</p>
                      <p className="mt-0.5 text-[12px] leading-relaxed text-[var(--ink-2)]">{why}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="px-4 py-3.5">
                <p className="mb-2.5 text-[11px] font-semibold uppercase tracking-[0.08em] text-[var(--muted)]">
                  Gone, and why that is safe
                </p>
                <ul className="grid gap-2 text-[12.5px] leading-relaxed text-[var(--muted)]">
                  <li>
                    <span className="text-[var(--ink-2)]">Two local references.</span> They existed to help police
                    verification find you. A verified address with a known jurisdiction does that better.
                  </li>
                  <li>
                    <span className="text-[var(--ink-2)]">Permanent address, re-entered.</span> Both addresses are held
                    once and shared with consent.
                  </li>
                  <li>
                    <span className="text-[var(--ink-2)]">Ten criminal-history declarations.</span> Still legally
                    required, and still asked — as one grouped declaration, in plain words, at the review step.
                  </li>
                  <li>
                    <span className="text-[var(--ink-2)]">Educational qualification, police station, ECR status.</span>{" "}
                    Derived, not demanded.
                  </li>
                </ul>
              </div>
            </div>
          </Card>
        </section>
      </div>

      <Card className="mt-6 flex flex-wrap items-center gap-4 p-5">
        <Info size={18} className="shrink-0 text-[var(--muted)]" />
        <p className="min-w-0 flex-1 text-[13.5px] leading-relaxed text-[var(--ink-2)]">
          The Ministry of External Affairs receives exactly what it received before. The difference is who does the
          work of assembling it. That is the whole proposal, on one screen.
        </p>
        <Button href="/journeys/passport-renewal" className="shrink-0">
          Try the journey <ArrowRight size={15} />
        </Button>
      </Card>
    </Page>
  );
}
