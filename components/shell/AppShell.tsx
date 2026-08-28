"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useSyncExternalStore } from "react";
import {
  Bell, Clock3, Home, LayoutGrid, LogOut, Moon, Plus, Route, ShieldCheck, Sparkles, Sun, Trash2, User, Network, RotateCcw,
} from "lucide-react";
import { Badge, cn } from "@/components/ui/primitives";
import { useSession } from "@/lib/state/store";
import { CITIZEN } from "@/lib/data/citizen";

export function Wordmark({ className, sub }: { className?: string; sub?: string }) {
  return (
    <span className={cn("inline-flex items-baseline gap-2", className)}>
      <span className="text-[19px] font-semibold tracking-[-0.02em] text-[var(--ink)]">
        Gov<span className="text-[var(--accent)]">.in</span>
      </span>
      {sub && <span className="text-[11.5px] text-[var(--muted)]">{sub}</span>}
    </span>
  );
}

const NAV = [
  { href: "/home", label: "Home", icon: Home },
  { href: "/services", label: "Services", icon: LayoutGrid },
  { href: "/journeys", label: "Journeys", icon: Route },
  { href: "/inbox", label: "Inbox", icon: Bell, badge: true },
  { href: "/timeline", label: "Timeline", icon: Clock3 },
  { href: "/profile", label: "Profile", icon: User },
];

const MOBILE_NAV = [
  { href: "/home", label: "Home", icon: Home },
  { href: "/services", label: "Services", icon: LayoutGrid },
  { href: "/ai", label: "AI mode", icon: Sparkles },
  { href: "/inbox", label: "Inbox", icon: Bell, badge: true },
  { href: "/profile", label: "Profile", icon: User },
];

/* ------------------------------------------------------------
   Theme. The DOM class is the source of truth, not React state,
   because the stylesheet already honours the system preference
   with no class at all. Reading it through an external store
   keeps the two from disagreeing.
   ------------------------------------------------------------ */

const themeListeners = new Set<() => void>();

function subscribeTheme(cb: () => void) {
  themeListeners.add(cb);
  const mq = window.matchMedia("(prefers-color-scheme: dark)");
  mq.addEventListener("change", cb);
  return () => {
    themeListeners.delete(cb);
    mq.removeEventListener("change", cb);
  };
}

function isDark() {
  const el = document.documentElement;
  if (el.classList.contains("dark")) return true;
  if (el.classList.contains("light")) return false;
  return window.matchMedia("(prefers-color-scheme: dark)").matches;
}

function applyTheme(dark: boolean) {
  const el = document.documentElement;
  el.classList.toggle("dark", dark);
  el.classList.toggle("light", !dark);
  try {
    localStorage.setItem("gov.in.theme", dark ? "dark" : "light");
  } catch {
    /* storage blocked — the choice still applies for this page */
  }
  themeListeners.forEach((cb) => cb());
}

function useTheme() {
  const dark = useSyncExternalStore(subscribeTheme, isDark, () => false);

  useEffect(() => {
    // Re-apply a previous explicit choice. No preference means the stylesheet
    // follows the system, which is the behaviour we want by default.
    let saved: string | null = null;
    try {
      saved = localStorage.getItem("gov.in.theme");
    } catch {
      /* ignore */
    }
    if (saved) applyTheme(saved === "dark");
  }, []);

  return { dark, toggle: () => applyTheme(!dark) };
}

/** Icon-only, for the landing header where there is no room for a label. */
export function ThemeToggle() {
  const { dark, toggle } = useTheme();
  return (
    <button
      onClick={toggle}
      className="grid h-9 w-9 place-items-center rounded-[10px] text-[var(--muted)] transition-colors hover:bg-[var(--line-2)] hover:text-[var(--ink)]"
      aria-label={dark ? "Switch to light theme" : "Switch to dark theme"}
    >
      {dark ? <Sun size={17} strokeWidth={1.8} /> : <Moon size={17} strokeWidth={1.8} />}
    </button>
  );
}

/** Labelled, for the rail — a setting the citizen can find, not a mystery icon. */
function ThemeRow() {
  const { dark, toggle } = useTheme();
  return (
    <button
      onClick={toggle}
      className="flex items-center gap-2.5 rounded-[10px] px-2.5 py-2 text-[14px] text-[var(--ink-2)] transition-colors hover:bg-[var(--line-2)] hover:text-[var(--ink)] lg:w-full"
    >
      {dark ? <Sun size={17} strokeWidth={1.8} /> : <Moon size={17} strokeWidth={1.8} />}
      <span className="hidden lg:inline">{dark ? "Light mode" : "Dark mode"}</span>
    </button>
  );
}

export function AppShell({ children }: { children: React.ReactNode }) {
  const path = usePathname();
  const router = useRouter();
  const { unread, dispatch, state } = useSession();
  const conversations = state.conversations.slice(0, 12);

  const isActive = (href: string) => path === href || path.startsWith(href + "/");

  function signOut() {
    dispatch({ type: "signOut" });
    router.push("/");
  }

  return (
    <div className="flex min-h-dvh flex-col lg:flex-row">
      {/* ================= Desktop rail ================= */}
      <aside className="sticky top-0 z-30 hidden h-dvh w-[236px] shrink-0 flex-col border-r border-[var(--line)] bg-[var(--panel)] px-4 py-5 lg:flex">
        <Link href="/home" className="mb-7 flex items-center gap-2 px-2">
          <span className="grid h-8 w-8 place-items-center rounded-[9px] bg-[var(--accent)] text-[var(--accent-ink)]">
            <ShieldCheck size={17} strokeWidth={2.2} />
          </span>
          <Wordmark />
        </Link>

        <nav className="flex flex-col gap-0.5">
          {NAV.map(({ href, label, icon: Icon, badge }) => {
            const active = isActive(href);
            return (
              <Link
                key={href}
                href={href}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "flex items-center gap-2.5 rounded-[10px] px-2.5 py-2 text-[14px] transition-colors",
                  active
                    ? "bg-[var(--accent-soft)] font-medium text-[var(--accent)]"
                    : "text-[var(--ink-2)] hover:bg-[var(--line-2)] hover:text-[var(--ink)]",
                )}
              >
                <Icon size={17} strokeWidth={active ? 2.1 : 1.8} />
                {label}
                {badge && unread > 0 && (
                  <span className="ml-auto">
                    <Badge tone="danger">{unread}</Badge>
                  </span>
                )}
              </Link>
            );
          })}
        </nav>

        {/* AI mode and its history. Conversations are per-citizen and never
            carry permissions from one to the next. */}
        <div className="mt-5 flex min-h-0 flex-1 flex-col">
          <Link
            href="/ai"
            className={cn(
              "flex items-center gap-2.5 rounded-[10px] px-2.5 py-2 text-[14px] transition-colors",
              path.startsWith("/ai")
                ? "bg-[var(--accent-soft)] font-medium text-[var(--accent)]"
                : "text-[var(--ink-2)] hover:bg-[var(--line-2)] hover:text-[var(--ink)]",
            )}
          >
            <Sparkles size={17} strokeWidth={path.startsWith("/ai") ? 2.1 : 1.8} />
            AI mode
            <Plus size={14} className="ml-auto text-[var(--faint)]" />
          </Link>

          {conversations.length > 0 && (
            <div className="mt-2 min-h-0 flex-1 overflow-y-auto">
              <p className="px-2.5 pb-1.5 text-[10.5px] font-semibold uppercase tracking-[0.09em] text-[var(--faint)]">
                Conversations
              </p>
              <div className="grid gap-0.5">
                {conversations.map((c) => (
                  <div key={c.id} className="group/conv relative">
                    <Link
                      href={`/ai/${c.id}`}
                      className={cn(
                        "block truncate rounded-[8px] py-1.5 pl-2.5 pr-7 text-[13px] transition-colors",
                        path === `/ai/${c.id}`
                          ? "bg-[var(--line-2)] text-[var(--ink)]"
                          : "text-[var(--muted)] hover:bg-[var(--line-2)] hover:text-[var(--ink)]",
                      )}
                      title={c.title}
                    >
                      {c.title}
                    </Link>
                    <button
                      onClick={() => dispatch({ type: "deleteConversation", conversationId: c.id })}
                      aria-label={`Delete conversation: ${c.title}`}
                      className="absolute right-1 top-1/2 hidden -translate-y-1/2 rounded-[6px] p-1 text-[var(--faint)] hover:text-[var(--danger)] group-hover/conv:block"
                    >
                      <Trash2 size={12} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="mt-auto flex flex-col gap-2">
          <Link
            href="/architecture"
            className={cn(
              "flex items-center gap-2.5 rounded-[10px] px-2.5 py-2 text-[14px] transition-colors",
              path === "/architecture"
                ? "bg-[var(--accent-soft)] font-medium text-[var(--accent)]"
                : "text-[var(--ink-2)] hover:bg-[var(--line-2)] hover:text-[var(--ink)]",
            )}
          >
            <Network size={17} strokeWidth={1.8} />
            How this works
          </Link>

          <ThemeRow />

          <div className="rounded-[12px] border border-[var(--line)] bg-[var(--panel-2)] p-3">
            <div className="flex items-center gap-2.5">
              <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-[var(--accent)] text-[12px] font-semibold text-[var(--accent-ink)]">
                {CITIZEN.photoInitials}
              </span>
              <div className="min-w-0">
                <p className="truncate text-[13px] font-medium leading-tight">{CITIZEN.name}</p>
                <p className="truncate text-[11px] text-[var(--muted)]">Demo citizen · fictional</p>
              </div>
            </div>
            <div className="mt-2.5 grid grid-cols-2 gap-1.5">
              <button
                onClick={() => {
                  dispatch({ type: "reset" });
                  router.push("/home");
                }}
                title="Clear everything this session did and restore the seeded state"
                className="flex items-center justify-center gap-1.5 rounded-[8px] border border-[var(--line)] py-1.5 text-[11.5px] text-[var(--muted)] transition-colors hover:text-[var(--ink)]"
              >
                <RotateCcw size={12} /> Reset
              </button>
              <button
                onClick={signOut}
                title="Return to the sign-in screen. Your journeys and cases are kept."
                className="flex items-center justify-center gap-1.5 rounded-[8px] border border-[var(--line)] py-1.5 text-[11.5px] text-[var(--muted)] transition-colors hover:text-[var(--ink)]"
              >
                <LogOut size={12} /> Sign out
              </button>
            </div>
          </div>
        </div>
      </aside>

      {/* ================= Mobile top bar ================= */}
      <header className="sticky top-0 z-30 flex items-center gap-1 border-b border-[var(--line)] bg-[var(--panel)] px-3 py-2 lg:hidden">
        <Link href="/home" className="mr-auto flex items-center gap-2 px-1 py-1.5">
          <span className="grid h-8 w-8 place-items-center rounded-[9px] bg-[var(--accent)] text-[var(--accent-ink)]">
            <ShieldCheck size={17} strokeWidth={2.2} />
          </span>
          <Wordmark />
        </Link>
        <IconLink href="/timeline" label="Timeline" active={isActive("/timeline")}>
          <Clock3 size={19} strokeWidth={1.8} />
        </IconLink>
        <IconLink href="/architecture" label="How this works" active={path === "/architecture"}>
          <Network size={19} strokeWidth={1.8} />
        </IconLink>
        <ThemeIconButton />
        <button
          onClick={signOut}
          aria-label="Sign out"
          className="grid h-11 w-11 place-items-center rounded-[10px] text-[var(--muted)] active:bg-[var(--line-2)]"
        >
          <LogOut size={19} strokeWidth={1.8} />
        </button>
      </header>

      <main className="min-w-0 flex-1 pb-[76px] lg:pb-0">{children}</main>

      {/* ================= Mobile bottom bar =================
          Thumb-reachable, labelled, and every target is at least 44px.
          A phone is the only device most citizens will ever use for this. */}
      <nav
        aria-label="Primary"
        className="fixed inset-x-0 bottom-0 z-40 grid grid-cols-5 border-t border-[var(--line)] bg-[var(--panel)] pb-[env(safe-area-inset-bottom)] lg:hidden"
      >
        {MOBILE_NAV.map(({ href, label, icon: Icon, badge }) => {
          const active = isActive(href);
          return (
            <Link
              key={href}
              href={href}
              aria-current={active ? "page" : undefined}
              className={cn(
                "relative flex min-h-[56px] flex-col items-center justify-center gap-1 px-1 py-1.5 text-[10.5px] transition-colors",
                active ? "font-medium text-[var(--accent)]" : "text-[var(--muted)]",
              )}
            >
              <span className="relative">
                <Icon size={21} strokeWidth={active ? 2.1 : 1.8} />
                {badge && unread > 0 && (
                  <span className="absolute -right-2 -top-1 grid h-4 min-w-4 place-items-center rounded-full bg-[var(--danger)] px-1 text-[9.5px] font-semibold text-white">
                    {unread}
                  </span>
                )}
              </span>
              {label}
            </Link>
          );
        })}
      </nav>
    </div>
  );
}

function IconLink({
  href,
  label,
  active,
  children,
}: {
  href: string;
  label: string;
  active: boolean;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      aria-label={label}
      className={cn(
        "grid h-11 w-11 place-items-center rounded-[10px] transition-colors active:bg-[var(--line-2)]",
        active ? "text-[var(--accent)]" : "text-[var(--muted)]",
      )}
    >
      {children}
    </Link>
  );
}

function ThemeIconButton() {
  const { dark, toggle } = useTheme();
  return (
    <button
      onClick={toggle}
      aria-label={dark ? "Switch to light theme" : "Switch to dark theme"}
      className="grid h-11 w-11 place-items-center rounded-[10px] text-[var(--muted)] active:bg-[var(--line-2)]"
    >
      {dark ? <Sun size={19} strokeWidth={1.8} /> : <Moon size={19} strokeWidth={1.8} />}
    </button>
  );
}

export function Page({
  children,
  className,
  wide,
}: {
  children: React.ReactNode;
  className?: string;
  wide?: boolean;
}) {
  return (
    <div className={cn("mx-auto w-full px-5 py-8 sm:px-8 lg:py-12", wide ? "max-w-[1180px]" : "max-w-[900px]", className)}>
      {children}
    </div>
  );
}

export function PageHead({
  eyebrow,
  title,
  sub,
  right,
}: {
  eyebrow?: React.ReactNode;
  title: string;
  sub?: string;
  right?: React.ReactNode;
}) {
  return (
    <header className="mb-8 flex flex-wrap items-end justify-between gap-4">
      <div className="min-w-0">
        {eyebrow && <div className="mb-2">{eyebrow}</div>}
        <h1 className="text-[27px] font-semibold leading-tight tracking-[-0.02em] text-[var(--ink)]">{title}</h1>
        {sub && <p className="mt-1.5 max-w-[62ch] text-[14.5px] leading-relaxed text-[var(--muted)]">{sub}</p>}
      </div>
      {right}
    </header>
  );
}
