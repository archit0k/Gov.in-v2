"use client";

import Link from "next/link";
import { useState } from "react";
import { ArrowRight } from "lucide-react";
import { Page, PageHead } from "@/components/shell/AppShell";
import { Badge, Card, ServiceMark, cn } from "@/components/ui/primitives";
import { CATEGORY_LABEL, SERVICES } from "@/lib/data/services";
import { journeysForService } from "@/lib/data/journeys";
import type { ServiceDef } from "@/lib/types";

const INTEGRATION: Record<ServiceDef["integration"], { label: string; tone: "ok" | "info" | "warn" }> = {
  native: { label: "Native", tone: "ok" },
  adapter: { label: "Adapter", tone: "info" },
  "legacy-api": { label: "Legacy API", tone: "warn" },
};

export default function ServicesPage() {
  const [cat, setCat] = useState<string>("all");
  const cats = ["all", ...Array.from(new Set(SERVICES.map((s) => s.category)))];
  const shown = cat === "all" ? SERVICES : SERVICES.filter((s) => s.category === cat);

  return (
    <Page wide>
      <PageHead
        title="Government services"
        sub="Ten departments, one infrastructure. Each keeps its own data, rules and identity — and none of them asks you to register again."
      />

      <div className="mb-6 flex flex-wrap gap-1.5">
        {cats.map((c) => (
          <button
            key={c}
            onClick={() => setCat(c)}
            className={cn(
              "rounded-full border px-3 py-1.5 text-[12.5px] transition-colors",
              cat === c
                ? "border-[var(--accent)] bg-[var(--accent-soft)] text-[var(--accent)]"
                : "border-[var(--line)] text-[var(--ink-2)] hover:border-[var(--faint)]",
            )}
          >
            {c === "all" ? "All services" : CATEGORY_LABEL[c as ServiceDef["category"]]}
          </button>
        ))}
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {shown.map((s, i) => {
          const js = journeysForService(s.id);
          return (
            <Card
              key={s.id}
              as={Link}
              href={`/services/${s.id}`}
              interactive
              className="rise flex flex-col p-4"
              style={{ animationDelay: `${i * 35}ms` }}
            >
              <div className="mb-3 flex items-start gap-3">
                <ServiceMark id={s.id} size={38} />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-[15px] font-medium leading-snug">{s.name}</p>
                  <p className="truncate text-[11.5px] text-[var(--muted)]">{s.department}</p>
                </div>
              </div>
              <p className="mb-3 line-clamp-2 flex-1 text-[13px] leading-relaxed text-[var(--muted)]">{s.summary}</p>
              <div className="flex flex-wrap items-center gap-1.5">
                <Badge tone={INTEGRATION[s.integration].tone}>{INTEGRATION[s.integration].label}</Badge>
                {js.length > 0 && <Badge tone="neutral">{js.length} {js.length === 1 ? "journey" : "journeys"}</Badge>}
                <span className="mono ml-auto truncate text-[10.5px] text-[var(--faint)]">{s.subdomain}</span>
              </div>
            </Card>
          );
        })}
      </div>

      <Card className="mt-8 flex flex-wrap items-center gap-4 p-5">
        <div className="min-w-0 flex-1">
          <p className="text-[15px] font-medium">Adding the eleventh department is a registry entry.</p>
          <p className="mt-1 max-w-[74ch] text-[13.5px] leading-relaxed text-[var(--muted)]">
            Every card above is rendered from one config object, and every journey inside them from another. No
            department here has its own frontend, its own login, or its own idea of what a case is.
          </p>
        </div>
        <Link href="/architecture" className="flex shrink-0 items-center gap-1.5 text-[13.5px] text-[var(--accent)] hover:underline">
          How it works <ArrowRight size={14} />
        </Link>
      </Card>
    </Page>
  );
}
