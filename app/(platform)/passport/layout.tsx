"use client";

import { PlatformShell } from "@/components/platform/PlatformShell";

const NAV = [
  { href: "/passport", label: "Overview" },
  { href: "/passport/apply", label: "Apply or renew" },
  { href: "/passport/appointments", label: "Appointments" },
  { href: "/passport/documents", label: "Fees & documents" },
  { href: "/passport/track", label: "Track" },
  { href: "/passport/help", label: "Help" },
];

export default function PassportLayout({ children }: { children: React.ReactNode }) {
  return (
    <PlatformShell
      id="passport"
      nav={NAV}
      searchPlaceholder="Search Passport Seva"
      searchExamples={["renew my passport", "police verification", "what do I carry"]}
    >
      {children}
    </PlatformShell>
  );
}
