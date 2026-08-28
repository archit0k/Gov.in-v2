"use client";

import { Faq } from "@/components/platform/Faq";
import { PASSPORT_FAQ } from "@/lib/data/domains";

export default function PassportHelp() {
  return (
    <Faq
      items={PASSPORT_FAQ}
      note="Passport Seva answers questions about passports. Anything about how your data was used, or a decision you want to contest, is handled by the shared infrastructure rather than by this department."
    />
  );
}
