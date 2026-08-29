"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { ApplyFlow } from "@/components/services/passport/ApplyFlow";

function ApplyView() {
  const params = useSearchParams();
  return (
    <ApplyFlow
      journeyId={params.get("journey") ?? undefined}
      returnTo={params.get("return") ?? undefined}
    />
  );
}

export default function ApplyPage() {
  return (
    <Suspense fallback={null}>
      <ApplyView />
    </Suspense>
  );
}
