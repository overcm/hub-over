"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle2, Circle } from "lucide-react";
import { Button } from "@/components/ui/button";

export function MarkCompleteButton({
  lessonId,
  initialCompleted,
}: {
  lessonId: string;
  initialCompleted: boolean;
}) {
  const router = useRouter();
  const [completed, setCompleted] = useState(initialCompleted);
  const [isSaving, setIsSaving] = useState(false);

  async function toggle() {
    setIsSaving(true);
    const next = !completed;
    await fetch(`/api/lessons/${lessonId}/progress`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ completed: next }),
    });
    setCompleted(next);
    setIsSaving(false);
    router.refresh();
  }

  return (
    <Button
      variant={completed ? "default" : "outline"}
      size="sm"
      onClick={toggle}
      disabled={isSaving}
      className="gap-1.5"
    >
      {completed ? <CheckCircle2 size={16} /> : <Circle size={16} />}
      {completed ? "Aula concluída" : "Marcar como concluída"}
    </Button>
  );
}
