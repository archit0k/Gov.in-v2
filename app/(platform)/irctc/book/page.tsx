"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { BookingFlow } from "@/components/services/irctc/BookingFlow";

function BookView() {
  const params = useSearchParams();
  return (
    <BookingFlow
      journeyId={params.get("journey") ?? undefined}
      returnTo={params.get("return") ?? undefined}
    />
  );
}

export default function BookPage() {
  return (
    <Suspense fallback={null}>
      <BookView />
    </Suspense>
  );
}
