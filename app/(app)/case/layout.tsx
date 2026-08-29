"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/components/ui/primitives";

const NAV = [
  { href: "/case", label: "The argument" },
  { href: "/case/practical", label: "Would it work?" },
  { href: "/case/transition", label: "Getting there" },
  { href: "/case/scale", label: "At scale" },
  { href: "/case/limits", label: "What it does not solve" },
];

export default function CaseLayout({ children }: { children: React.ReactNode }) {
  const path = usePathname();
  return (
    <>
      <div className="border-b border-[var(--line)] bg-[var(--panel)]">
        <div className="mx-auto flex max-w-[1180px] gap-1 overflow-x-auto px-5 sm:px-8">
          {NAV.map((n) => {
            const active = path === n.href;
            return (
              <Link
                key={n.href}
                href={n.href}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "-mb-px shrink-0 border-b-2 px-3 py-3 text-[14px] transition-colors",
                  active
                    ? "border-[var(--accent)] font-semibold text-[var(--accent)]"
                    : "border-transparent text-[var(--ink-2)] hover:text-[var(--ink)]",
                )}
              >
                {n.label}
              </Link>
            );
          })}
        </div>
      </div>
      {children}
    </>
  );
}
