"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useSyncExternalStore } from "react";
import {
  Bell, Clock3, Home, LayoutGrid, LogOut, Moon, Network, RotateCcw, Route, ShieldCheck, Sparkles, Sun, User,
} from "lucide-react";
import { Title, Tricolour, cn } from "@/components/ui/primitives";
import { useSession } from "@/lib/state/store";
import { CITIZEN } from "@/lib/data/citizen";

export function Wordmark({
  className,
  sub,
  onDark,
}: {
  className?: string;
  sub?: string;
  onDark?: boolean;
}) {
  return (
    <span className={cn("inline-flex items-baseline gap-2", className)}>
      <span
        className={cn(
          "serif text-[20px] font-bold tracking-[-0.015em]",
          onDark ? "text-[var(--masthead-ink)]" : "text-[var(--ink)]",
        )}
      >
        Gov<span className={onDark ? "text-[var(--saffron)]" : "text-[var(--accent)]"}>.in</span>
      </span>
      {sub && (
        <span className={cn("text-[11.5px]", onDark ? "text-[var(--masthead-muted)]" : "text-[var(--muted)]")}>
          {sub}
        </span>
      )}
    </span>
  );
}

/** The mark. Deliberately not the State Emblem — this is an independent build. */
export function Seal({ size = 34, onDark }: { size?: number; onDark?: boolean }) {
  return (
    <span
      className={cn(
        "grid shrink-0 place-items-center border",
        onDark ? "border-[var(--masthead-line)] bg-[#0a1830]" : "border-[var(--accent-line)] bg-[var(--accent-soft)]",
      )}
      style={{ width: size, height: size }}
      aria-hidden
    >
      <ShieldCheck
        size={Math.round(size * 0.55)}
        strokeWidth={2}
        className={onDark ? "text-[var(--saffron)]" : "text-[var(--accent)]"}
      />
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
      className="grid h-9 w-9 place-items-center rounded-[3px] text-[var(--muted)] transition-colors hover:bg-[var(--line-2)] hover:text-[var(--ink)]"
      aria-label={dark ? "Switch to light theme" : "Switch to dark theme"}
    >
      {dark ? <Sun size={17} strokeWidth={1.8} /> : <Moon size={17} strokeWidth={1.8} />}
    </button>
  );
}

export function AppShell({ children }: { children: React.ReactNode }) {
  const path = usePathname();
  const router = useRouter();
  const { unread, dispatch } = useSession();

  const isActive = (href: string) => path === href || path.startsWith(href + "/");

  function signOut() {
    dispatch({ type: "signOut" });
    router.push("/");
  }

  return (
    <div className="flex min-h-dvh flex-col">
      {/* ===================== Masthead =====================
          One heavy band across the top, the way a government
          publication is headed. It does not scroll away, because
          the thing it identifies does not change. */}
      <header className="bg-[var(--masthead)]">
        <div className="mx-auto flex max-w-[1240px] items-center gap-3 px-5 py-3 sm:px-8">
          <Link href="/home" className="flex items-center gap-3">
            <Seal onDark />
            <span className="flex flex-col leading-none">
              <Wordmark onDark />
              <span className="mt-1 hidden text-[11px] tracking-[0.02em] text-[var(--masthead-muted)] sm:block">
                Shared citizen infrastructure
              </span>
            </span>
          </Link>

          <span className="ml-auto hidden items-center gap-2.5 border-l border-[var(--masthead-line)] pl-4 md:flex">
            <span className="grid h-8 w-8 place-items-center border border-[var(--masthead-line)] bg-[#0a1830] text-[11.5px] font-semibold text-[var(--masthead-ink)]">
              {CITIZEN.photoInitials}
            </span>
            <span className="flex flex-col leading-tight">
              <span className="text-[12.5px] text-[var(--masthead-ink)]">{CITIZEN.name}</span>
              <span className="text-[10.5px] text-[var(--masthead-muted)]">Demo citizen · fictional</span>
            </span>
          </span>

          <div className="ml-auto flex items-center gap-0.5 md:ml-2">
            <MastheadButton onClick={() => { dispatch({ type: "reset" }); router.push("/home"); }} label="Reset demo">
              <RotateCcw size={16} strokeWidth={1.9} />
            </MastheadButton>
            <MastheadThemeButton />
            <MastheadButton onClick={signOut} label="Sign out">
              <LogOut size={16} strokeWidth={1.9} />
            </MastheadButton>
          </div>
        </div>
      </header>

      <Tricolour />

      {/* ===================== Navigation band ===================== */}
      <nav
        aria-label="Primary"
        className="sticky top-0 z-30 hidden border-b border-[var(--line)] bg-[var(--panel)] lg:block"
      >
        <div className="mx-auto flex max-w-[1240px] items-stretch gap-1 px-5 sm:px-8">
          {NAV.map(({ href, label, icon: Icon, badge }) => {
            const active = isActive(href);
            return (
              <Link
                key={href}
                href={href}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "-mb-px flex items-center gap-2 border-b-2 px-3 py-3 text-[14px] transition-colors",
                  active
                    ? "border-[var(--accent)] font-semibold text-[var(--accent)]"
                    : "border-transparent text-[var(--ink-2)] hover:text-[var(--ink)]",
                )}
              >
                <Icon size={16} strokeWidth={active ? 2.2 : 1.8} />
                {label}
                {badge && unread > 0 && (
                  <span className="tnum ml-0.5 grid h-[17px] min-w-[17px] place-items-center bg-[var(--danger)] px-1 text-[10px] font-bold text-white">
                    {unread}
                  </span>
                )}
              </Link>
            );
          })}

          <span className="mx-2 my-2.5 w-px bg-[var(--line)]" />

          <Link
            href="/ai"
            className={cn(
              "-mb-px flex items-center gap-2 border-b-2 px-3 py-3 text-[14px] transition-colors",
              path.startsWith("/ai")
                ? "border-[var(--accent)] font-semibold text-[var(--accent)]"
                : "border-transparent text-[var(--ink-2)] hover:text-[var(--ink)]",
            )}
          >
            <Sparkles size={16} strokeWidth={path.startsWith("/ai") ? 2.2 : 1.8} />
            AI mode
          </Link>

          <Link
            href="/architecture"
            className={cn(
              "-mb-px ml-auto flex items-center gap-2 border-b-2 px-3 py-3 text-[14px] transition-colors",
              path === "/architecture"
                ? "border-[var(--accent)] font-semibold text-[var(--accent)]"
                : "border-transparent text-[var(--muted)] hover:text-[var(--ink)]",
            )}
          >
            <Network size={16} strokeWidth={1.8} />
            How this works
          </Link>
        </div>
      </nav>

      <main id="main" className="min-w-0 flex-1 pb-[76px] lg:pb-0">
        {children}
      </main>

      {/* ===================== Mobile tab bar ===================== */}
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
                active ? "font-semibold text-[var(--accent)]" : "text-[var(--muted)]",
              )}
            >
              <span className="relative">
                <Icon size={21} strokeWidth={active ? 2.1 : 1.8} />
                {badge && unread > 0 && (
                  <span className="tnum absolute -right-2 -top-1 grid h-4 min-w-4 place-items-center bg-[var(--danger)] px-1 text-[9.5px] font-bold text-white">
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

function MastheadButton({
  onClick,
  label,
  children,
}: {
  onClick: () => void;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      aria-label={label}
      title={label}
      className="grid h-9 w-9 place-items-center text-[var(--masthead-muted)] transition-colors hover:bg-[#0a1830] hover:text-[var(--masthead-ink)]"
    >
      {children}
    </button>
  );
}

function MastheadThemeButton() {
  const { dark, toggle } = useTheme();
  return (
    <button
      onClick={toggle}
      aria-label={dark ? "Switch to light theme" : "Switch to dark theme"}
      title={dark ? "Light theme" : "Dark theme"}
      className="grid h-9 w-9 place-items-center text-[var(--masthead-muted)] transition-colors hover:bg-[#0a1830] hover:text-[var(--masthead-ink)]"
    >
      {dark ? <Sun size={16} strokeWidth={1.9} /> : <Moon size={16} strokeWidth={1.9} />}
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
    <div className={cn("mx-auto w-full px-5 py-8 sm:px-8 lg:py-10", wide ? "max-w-[1240px]" : "max-w-[940px]", className)}>
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
    <header className="mb-8 border-b border-[var(--line)] pb-5">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div className="min-w-0">
          {eyebrow && <div className="mb-2.5">{eyebrow}</div>}
          <Title size="lg">{title}</Title>
          {sub && <p className="mt-2 max-w-[68ch] text-[14.5px] leading-relaxed text-[var(--muted)]">{sub}</p>}
        </div>
        {right}
      </div>
    </header>
  );
}
