"use client";

import { Faq } from "@/components/platform/Faq";
import { IRCTC_FAQ } from "@/lib/data/domains";

export default function IrctcHelp() {
  return (
    <Faq
      items={IRCTC_FAQ}
      note="Indian Railways answers questions about trains, tickets and refunds. Anything about your identity, your co-passengers' records or a data-sharing decision belongs to the shared infrastructure."
    />
  );
}
