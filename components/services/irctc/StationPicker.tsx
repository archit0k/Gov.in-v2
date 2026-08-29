"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { MapPin, X } from "lucide-react";
import { cn } from "@/components/ui/primitives";
import { STATION_MAP, searchStations, type Station } from "@/lib/services/irctc/network";

/* Station entry is the first thing that fails on the real site: you have to
   already know the code. This accepts a code, a station name or a city, and
   shows what it matched so nobody has to guess. */

export function StationPicker({
  id,
  label,
  value,
  onChange,
  exclude,
  autoFocus,
}: {
  id: string;
  label: string;
  value: string;
  onChange: (code: string) => void;
  exclude?: string;
  autoFocus?: boolean;
}) {
  const selected = value ? STATION_MAP[value] : undefined;
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(0);
  const boxRef = useRef<HTMLDivElement>(null);

  const results = useMemo(
    () => searchStations(query).filter((s) => s.code !== exclude),
    [query, exclude],
  );

  useEffect(() => {
    function away(e: MouseEvent) {
      if (boxRef.current && !boxRef.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", away);
    return () => document.removeEventListener("mousedown", away);
  }, []);

  function pick(s: Station) {
    onChange(s.code);
    setQuery("");
    setOpen(false);
  }

  return (
    <div className="grid gap-2" ref={boxRef}>
      <label htmlFor={id} className="text-[13.5px] font-medium text-[var(--ink)]">
        {label}
      </label>

      {selected ? (
        <div className="flex h-12 items-center gap-2.5 rounded-[var(--r-md)] border border-[var(--line)] bg-[var(--panel)] px-3.5">
          <MapPin size={15} className="shrink-0 text-[var(--muted)]" />
          <span className="min-w-0 flex-1">
            <span className="block truncate text-[14.5px] leading-tight text-[var(--ink)]">{selected.name}</span>
            <span className="mono block text-[11.5px] text-[var(--muted)]">
              {selected.code} · {selected.state}
            </span>
          </span>
          <button
            type="button"
            onClick={() => {
              onChange("");
              setTimeout(() => setOpen(true), 0);
            }}
            aria-label={`Clear ${label}`}
            className="grid h-8 w-8 shrink-0 place-items-center rounded-[var(--r-sm)] text-[var(--muted)] transition-colors hover:bg-[var(--line-2)] hover:text-[var(--ink)]"
          >
            <X size={15} />
          </button>
        </div>
      ) : (
        <div className="relative">
          <input
            id={id}
            autoFocus={autoFocus}
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setOpen(true);
              setActive(0);
            }}
            onFocus={() => setOpen(true)}
            onKeyDown={(e) => {
              if (e.key === "ArrowDown") { e.preventDefault(); setActive((a) => Math.min(a + 1, results.length - 1)); }
              if (e.key === "ArrowUp") { e.preventDefault(); setActive((a) => Math.max(a - 1, 0)); }
              if (e.key === "Enter" && results[active]) { e.preventDefault(); pick(results[active]); }
              if (e.key === "Escape") setOpen(false);
            }}
            placeholder="Station, city or code"
            autoComplete="off"
            role="combobox"
            aria-expanded={open}
            aria-controls={`${id}-list`}
            className="h-12 w-full rounded-[var(--r-md)] border border-[var(--line)] bg-[var(--panel)] px-3.5 text-[14.5px] outline-none transition-colors placeholder:text-[var(--faint)] focus:border-[var(--accent)] focus:ring-4 focus:ring-[var(--accent-soft)]"
          />

          {open && results.length > 0 && (
            <ul
              id={`${id}-list`}
              role="listbox"
              className="absolute inset-x-0 top-[calc(100%+4px)] z-30 max-h-[290px] overflow-y-auto rounded-[var(--r-md)] border border-[var(--line)] bg-[var(--panel)] py-1 shadow-[var(--shadow-2)]"
            >
              {results.map((s, i) => (
                <li key={s.code}>
                  <button
                    type="button"
                    role="option"
                    aria-selected={i === active}
                    onMouseEnter={() => setActive(i)}
                    onClick={() => pick(s)}
                    className={cn(
                      "flex w-full items-center gap-3 px-3.5 py-2.5 text-left transition-colors",
                      i === active ? "bg-[var(--accent-soft)]" : "hover:bg-[var(--line-2)]",
                    )}
                  >
                    <span className="mono w-[52px] shrink-0 text-[12px] font-semibold text-[var(--accent)]">
                      {s.code}
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-[14px] leading-tight">{s.name}</span>
                      <span className="block truncate text-[11.5px] text-[var(--muted)]">
                        {s.city}, {s.state}
                      </span>
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          )}

          {open && query.trim() !== "" && results.length === 0 && (
            <div className="absolute inset-x-0 top-[calc(100%+4px)] z-30 rounded-[var(--r-md)] border border-[var(--line)] bg-[var(--panel)] px-3.5 py-3 text-[13px] leading-relaxed text-[var(--muted)] shadow-[var(--shadow-2)]">
              No station matches &ldquo;{query}&rdquo;. This prototype carries {Object.keys(STATION_MAP).length} of
              the busiest stations, not the full network of about 7,300.
            </div>
          )}
        </div>
      )}
    </div>
  );
}
