"use client";

import { PlatformShell } from "@/components/platform/PlatformShell";

const NAV = [
  { href: "/irctc", label: "Overview" },
  { href: "/irctc/book", label: "Book" },
  { href: "/irctc/trips", label: "My trips" },
  { href: "/irctc/pnr", label: "PNR status" },
  { href: "/irctc/refunds", label: "Refunds" },
  { href: "/irctc/help", label: "Help" },
];

export default function IrctcLayout({ children }: { children: React.ReactNode }) {
  return (
    <PlatformShell
      id="irctc"
      nav={NAV}
      searchPlaceholder="Search Indian Railways"
      searchExamples={["book a train", "pnr status", "cancellation charges"]}
    >
      {children}
    </PlatformShell>
  );
}
