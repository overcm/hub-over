import { useRef } from "react";

export function useVideoProgress(lessonId: string) {
  const lastSentAt = useRef(0);

  return function reportProgress(currentTime: number, duration: number) {
    const now = Date.now();
    if (now - lastSentAt.current < 5000) return;
    lastSentAt.current = now;

    fetch(`/api/lessons/${lessonId}/progress`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ currentTime, duration }),
    }).catch(() => {});
  };
}
