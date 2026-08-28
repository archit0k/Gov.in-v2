"use client";

import { Suspense } from "react";
import { useParams } from "next/navigation";
import { AiMode } from "@/components/ai/AiMode";

export default function AiConversationPage() {
  const { id } = useParams<{ id: string }>();
  return (
    <Suspense fallback={null}>
      <AiMode conversationId={id} />
    </Suspense>
  );
}
