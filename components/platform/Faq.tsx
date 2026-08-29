"use client";

import { useState } from "react";
import Link from "next/link";
import { ChevronDown, MessageSquareWarning } from "lucide-react";
import { Card, cn } from "@/components/ui/primitives";
import { PanelTitle } from "@/components/platform/PlatformShell";

/* A department answers its own questions. Escalation, when the answer is
   not good enough, belongs to the shared infrastructure - which is why the
   grievance link at the bottom is not this department's own form. */

export function Faq({
  items,
  note,
}: {
  items: { q: string; a: string }[];
  note: string;
}) {
  const [open, setOpen] = useState<string | null>(items[0]?.q ?? null);

  return (
    <div className="grid gap-6 lg:grid-cols-[1.35fr_1fr]">
      <Card className="p-5">
        <PanelTitle>Common questions</PanelTitle>
        <div className="grid gap-1.5">
          {items.map((x) => {
            const isOpen = open === x.q;
            return (
              <div key={x.q} className="rounded-[var(--r-md)] border border-[var(--line)]">
                <button
                  onClick={() => setOpen(isOpen ? null : x.q)}
                  aria-expanded={isOpen}
                  className="flex w-full items-center gap-3 p-3.5 text-left"
                >
                  <span className="min-w-0 flex-1 text-[14px] font-medium">{x.q}</span>
                  <ChevronDown
                    size={16}
                    className={cn("shrink-0 text-[var(--faint)] transition-transform", isOpen && "rotate-180")}
                  />
                </button>
                {isOpen && (
                  <p className="fade border-t border-[var(--line-2)] p-3.5 text-[13.5px] leading-relaxed text-[var(--muted)]">
                    {x.a}
                  </p>
                )}
              </div>
            );
          })}
        </div>
      </Card>

      <aside className="grid content-start gap-6">
        <Card className="p-5">
          <PanelTitle>If this did not answer it</PanelTitle>
          <p className="mb-3 text-[13.5px] leading-relaxed text-[var(--muted)]">{note}</p>
          <Link
            href="/journeys/cpgrams-grievance"
            className="flex items-center gap-2 rounded-[var(--r-md)] border border-[var(--line)] px-3.5 py-2.5 text-[13.5px] transition-colors hover:border-[var(--accent-line)] hover:bg-[var(--accent-soft)]"
          >
            <MessageSquareWarning size={15} className="shrink-0 text-[var(--muted)]" />
            Raise a grievance
          </Link>
          <p className="mt-2.5 text-[12px] leading-relaxed text-[var(--muted)]">
            A grievance filed from a case carries the department, the officer and the whole history with it. You
            will not have to explain any of it again.
          </p>
        </Card>

        <Card className="p-5">
          <PanelTitle>Talk it through instead</PanelTitle>
          <p className="mb-3 text-[13.5px] leading-relaxed text-[var(--muted)]">
            AI mode lives on the Gov.in front door rather than inside each department, because most real
            questions cross more than one of them.
          </p>
          <Link href="/ai" className="text-[13.5px] text-[var(--accent)] hover:underline">
            Open AI mode
          </Link>
        </Card>
      </aside>
    </div>
  );
}
