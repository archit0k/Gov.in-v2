"use client";

import { Suspense } from "react";
import { AiMode } from "@/components/ai/AiMode";

export default function AiPage() {
  return (
    <Suspense fallback={null}>
      <AiMode />
    </Suspense>
  );
}
