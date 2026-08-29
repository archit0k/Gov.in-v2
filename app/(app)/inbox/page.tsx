"use client";

import Link from "next/link";
import { useState } from "react";
import { ArrowRight, CheckCheck } from "lucide-react";
import { Page, PageHead } from "@/components/shell/AppShell";
import { Badge, Button, Card, EmptyState, ServiceMark, cn, timeAgo } from "@/components/ui/primitives";
import { useSession } from "@/lib/state/store";
import type { InboxCategory } from "@/lib/types";

const TABS: { id: InboxCategory | "all"; label: string }[] = [
  { id: "all", label: "Everything" },
  { id: "action", label: "Action required" },
  { id: "important", label: "Important" },
  { id: "update", label: "Updates" },
  { id: "security", label: "Security" },
  { id: "done", label: "Completed" },
];

const TONE: Record<InboxCategory, "danger" | "warn" | "info" | "neutral" | "ok" | "accent"> = {
  action: "danger",
  important: "warn",
  update: "info",
  info: "neutral",
  security: "accent",
  done: "ok",
};

export default function InboxPage() {
  const { state, dispatch, unread, ready } = useSession();
  const [tab, setTab] = useState<InboxCategory | "all">("all");

  const items = tab === "all" ? state.inbox : state.inbox.filter((n) => n.category === tab);

  return (
    <Page>
      <PageHead
        title="Government inbox"
        sub="Every department writes here. Each message carries its case, so nothing ever ends with 'log in to the portal to check'."
        right={
          unread > 0 ? (
            <Button variant="secondary" size="sm" onClick={() => dispatch({ type: "readAll" })}>
              <CheckCheck size={14} /> Mark all read
            </Button>
          ) : undefined
        }
      />

      <div className="mb-5 flex flex-wrap gap-1.5">
        {TABS.map((t) => {
          const n = t.id === "all" ? state.inbox.length : state.inbox.filter((x) => x.category === t.id).length;
          if (n === 0 && t.id !== "all" && tab !== t.id) return null;
          return (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={cn(
                "rounded-full border px-3 py-1.5 text-[12.5px] transition-colors",
                tab === t.id
                  ? "border-[var(--accent)] bg-[var(--accent-soft)] text-[var(--accent)]"
                  : "border-[var(--line)] text-[var(--ink-2)] hover:border-[var(--faint)]",
              )}
            >
              {t.label} <span className="tnum text-[var(--faint)]">{n}</span>
            </button>
          );
        })}
      </div>

      {ready && items.length === 0 ? (
        <EmptyState title="Nothing here" body="When a department has something to tell you, it will appear here with the case attached." />
      ) : (
        <Card className="divide-y divide-[var(--line-2)] overflow-hidden">
          {items.map((n) => (
            <article
              key={n.id}
              className={cn("flex gap-3.5 p-4 transition-colors", !n.read && "bg-[var(--panel-2)]")}
              // Reading is what a click on the row means. It is also offered as
              // a real button below, because a click handler on an <article> is
              // unreachable without a mouse.
              onClick={() => !n.read && dispatch({ type: "readInbox", id: n.id })}
            >
              <div className="relative shrink-0">
                <ServiceMark id={n.serviceId} size={36} />
                {!n.read && <span className="absolute -right-0.5 -top-0.5 h-2 w-2 rounded-full bg-[var(--danger)]" />}
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <h3 className="text-[14.5px] font-medium leading-snug">{n.title}</h3>
                  <Badge tone={TONE[n.category]}>{n.category === "done" ? "completed" : n.category}</Badge>
                  {n.dueLabel && <span className="text-[11.5px] text-[var(--warn)]">{n.dueLabel}</span>}
                  <span className="ml-auto shrink-0 text-[11.5px] text-[var(--faint)]">{timeAgo(n.at)}</span>
                </div>
                <p className="mt-1 max-w-[76ch] text-[13.5px] leading-relaxed text-[var(--muted)]">{n.body}</p>
                <div className="mt-2 flex flex-wrap items-center gap-3">
                  {n.action && (
                    <Link
                      href={n.action.href}
                      onClick={() => !n.read && dispatch({ type: "readInbox", id: n.id })}
                      className="inline-flex items-center gap-1.5 text-[13px] font-medium text-[var(--accent)] hover:underline"
                    >
                      {n.action.label} <ArrowRight size={13} />
                    </Link>
                  )}
                  {!n.read && (
                    <button
                      onClick={() => dispatch({ type: "readInbox", id: n.id })}
                      className="text-[13px] text-[var(--muted)] hover:text-[var(--ink)] hover:underline"
                    >
                      Mark read
                    </button>
                  )}
                  {n.caseId && <span className="mono text-[11.5px] text-[var(--faint)]">{n.caseId}</span>}
                </div>
              </div>
            </article>
          ))}
        </Card>
      )}
    </Page>
  );
}
