"use client";

import Link from "next/link";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import {
  BookMarked, Building2, Car, FileSearch, Landmark, LayoutGrid, MessageSquareWarning,
  PiggyBank, Receipt, ShieldAlert, Store, TrainFront, ShieldCheck, type LucideIcon,
} from "lucide-react";
import type { ReactNode } from "react";
import { service } from "@/lib/data/services";
import type { ServiceId } from "@/lib/types";

export function cn(...i: ClassValue[]) {
  return twMerge(clsx(i));
}

/* ---------------- Service identity ---------------- */

const ICONS: Record<string, LucideIcon> = {
  BookMarked, Building2, Car, FileSearch, Landmark, LayoutGrid,
  MessageSquareWarning, PiggyBank, Receipt, ShieldAlert, Store, TrainFront,
};

export function ServiceMark({
  id,
  size = 40,
  className,
}: {
  id: ServiceId;
  size?: number;
  className?: string;
}) {
  const s = service(id);
  const Icon = ICONS[s.icon] ?? Landmark;
  return (
    <span
      data-service={s.id}
      className={cn(
        "inline-grid shrink-0 place-items-center rounded-[10px] border border-[var(--accent-line)] bg-[var(--accent-soft)] text-[var(--accent)]",
        className,
      )}
      style={{ width: size, height: size, "--svc": s.accent } as React.CSSProperties}
      aria-hidden
    >
      <Icon size={Math.round(size * 0.48)} strokeWidth={1.7} />
    </span>
  );
}

/**
 * Scopes a department's accent to a subtree. The department supplies one
 * colour; the derived tokens in globals.css keep it readable in both themes,
 * so a department cannot ship a combination the citizen cannot read.
 */
export function ServiceTheme({ id, children, className }: { id: ServiceId; children: ReactNode; className?: string }) {
  const s = service(id);
  return (
    <div data-service={s.id} className={className} style={{ "--svc": s.accent } as React.CSSProperties}>
      {children}
    </div>
  );
}

/* ---------------- Buttons ---------------- */

type BtnProps = {
  children: ReactNode;
  href?: string;
  onClick?: () => void;
  variant?: "primary" | "secondary" | "ghost" | "danger";
  size?: "sm" | "md" | "lg";
  className?: string;
  disabled?: boolean;
  type?: "button" | "submit";
};

const BTN = {
  base: "inline-flex items-center justify-center gap-2 rounded-[10px] font-medium transition-all duration-150 disabled:opacity-40 disabled:pointer-events-none whitespace-nowrap",
  primary:
    "bg-[var(--accent)] text-[var(--accent-ink)] shadow-[var(--shadow-1)] hover:brightness-110 active:scale-[0.985]",
  secondary:
    "bg-[var(--panel)] text-[var(--ink)] border border-[var(--line)] hover:border-[var(--faint)] hover:bg-[var(--panel-2)] active:scale-[0.985]",
  ghost: "text-[var(--ink-2)] hover:bg-[var(--line-2)] hover:text-[var(--ink)]",
  danger: "bg-[var(--danger)] text-[var(--danger-ink)] hover:brightness-110",
  sm: "h-8 px-3 text-[13px]",
  md: "h-10 px-4 text-[14px]",
  lg: "h-12 px-6 text-[15px]",
};

export function Button({ children, href, onClick, variant = "primary", size = "md", className, disabled, type = "button" }: BtnProps) {
  const cls = cn(BTN.base, BTN[variant], BTN[size], className);
  if (href && !disabled) return <Link href={href} className={cls} onClick={onClick}>{children}</Link>;
  return (
    <button type={type} className={cls} onClick={onClick} disabled={disabled}>
      {children}
    </button>
  );
}

/* ---------------- Surfaces ---------------- */

export function Card({
  children,
  className,
  as: As = "div",
  interactive,
  ...rest
}: {
  children: ReactNode;
  className?: string;
  as?: React.ElementType;
  interactive?: boolean;
  [key: string]: unknown;
}) {
  return (
    <As
      {...rest}
      className={cn(
        "rounded-[var(--radius-lg)] border border-[var(--line)] bg-[var(--panel)]",
        interactive && "transition-all duration-150 hover:border-[var(--faint)] hover:shadow-[var(--shadow-2)]",
        className,
      )}
    >
      {children}
    </As>
  );
}

export function SectionTitle({
  children,
  action,
  sub,
}: {
  children: ReactNode;
  action?: ReactNode;
  /** One line of framing under the heading, where the section needs it. */
  sub?: string;
}) {
  return (
    <div className="mb-3 flex flex-wrap items-end justify-between gap-x-6 gap-y-2">
      <div className="min-w-0">
        <h2 className="text-[13px] font-semibold uppercase tracking-[0.09em] text-[var(--muted)]">{children}</h2>
        {sub && <p className="mt-1.5 max-w-[74ch] text-[13.5px] leading-relaxed text-[var(--muted)]">{sub}</p>}
      </div>
      {action && <div className="-my-2 flex min-h-[36px] shrink-0 items-center py-2">{action}</div>}
    </div>
  );
}

/* ---------------- Status ---------------- */

const TONE = {
  neutral: "bg-[var(--line-2)] text-[var(--ink-2)] border-[var(--line)]",
  accent: "bg-[var(--accent-soft)] text-[var(--accent)] border-[var(--accent-line)]",
  ok: "bg-[var(--ok-soft)] text-[var(--ok)] border-transparent",
  warn: "bg-[var(--warn-soft)] text-[var(--warn)] border-transparent",
  danger: "bg-[var(--danger-soft)] text-[var(--danger)] border-transparent",
  info: "bg-[var(--info-soft)] text-[var(--info)] border-transparent",
};

export function Badge({
  children,
  tone = "neutral",
  className,
}: {
  children: ReactNode;
  tone?: keyof typeof TONE;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full border px-2 py-[3px] text-[11.5px] font-medium leading-none",
        TONE[tone],
        className,
      )}
    >
      {children}
    </span>
  );
}

/** The trust primitive: where a value came from, shown next to the value. */
export function SourceTag({ label, className }: { label: string; className?: string }) {
  return (
    <span className={cn("inline-flex items-center gap-1 text-[11.5px] text-[var(--muted)]", className)}>
      <ShieldCheck size={12} className="text-[var(--ok)]" strokeWidth={2.2} />
      {label}
    </span>
  );
}

/* ---------------- Progress ---------------- */

export function ProgressRail({
  steps,
  current,
  className,
}: {
  steps: string[];
  current: number;
  className?: string;
}) {
  return (
    <ol className={cn("flex items-center gap-1.5", className)} aria-label="Progress">
      {steps.map((s, i) => {
        const done = i < current;
        const now = i === current;
        return (
          <li key={s + i} className="flex min-w-0 flex-1 flex-col gap-1.5" title={s}>
            <span
              className={cn(
                "h-[3px] rounded-full transition-all duration-500",
                done && "bg-[var(--accent)]",
                now && "bg-[var(--accent)]",
                !done && !now && "bg-[var(--line)]",
              )}
              style={now ? { boxShadow: "0 0 0 3px var(--accent-soft)" } : undefined}
            />
            <span
              className={cn(
                "truncate text-[11px] leading-tight transition-colors",
                now ? "font-medium text-[var(--ink)]" : "text-[var(--faint)]",
              )}
            >
              {s}
            </span>
          </li>
        );
      })}
    </ol>
  );
}

/* ---------------- States ---------------- */

export function EmptyState({
  title,
  body,
  action,
  icon,
}: {
  title: string;
  body: string;
  action?: ReactNode;
  icon?: ReactNode;
}) {
  return (
    <div className="flex flex-col items-center gap-3 rounded-[var(--radius-lg)] border border-dashed border-[var(--line)] px-6 py-14 text-center">
      {icon && <div className="text-[var(--faint)]">{icon}</div>}
      <p className="text-[15px] font-medium text-[var(--ink)]">{title}</p>
      <p className="max-w-sm text-[13.5px] leading-relaxed text-[var(--muted)]">{body}</p>
      {action && <div className="mt-1">{action}</div>}
    </div>
  );
}

export function Shimmer({ className }: { className?: string }) {
  return <div className={cn("skeleton", className)} />;
}

/* ---------------- Text ---------------- */

export function Kv({ k, v, source }: { k: string; v: ReactNode; source?: string }) {
  return (
    <div className="flex flex-col gap-1 py-3">
      <dt className="text-[12.5px] text-[var(--muted)]">{k}</dt>
      <dd className="text-[14.5px] leading-snug text-[var(--ink)]">{v}</dd>
      {source && <SourceTag label={source} />}
    </div>
  );
}

export function timeAgo(iso: string) {
  const d = Date.now() - new Date(iso).getTime();
  const m = Math.round(d / 60000);
  if (m < 1) return "just now";
  if (m < 60) return `${m} min ago`;
  const h = Math.round(m / 60);
  if (h < 24) return `${h} hr ago`;
  const days = Math.round(h / 24);
  if (days < 30) return `${days} d ago`;
  return new Date(iso).toLocaleDateString("en-IN", { day: "numeric", month: "short" });
}

export function fmtDateTime(iso: string) {
  return new Date(iso).toLocaleString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}
