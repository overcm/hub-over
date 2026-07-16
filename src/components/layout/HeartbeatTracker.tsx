"use client";

import { useEffect, useTransition } from "react";
import { pingHeartbeat } from "@/app/(student)/heartbeat-actions";

const HEARTBEAT_INTERVAL_MS = 2 * 60 * 1000;

export function HeartbeatTracker() {
  const [, startTransition] = useTransition();

  useEffect(() => {
    const send = () => startTransition(() => { pingHeartbeat(); });

    const pingIfVisible = () => {
      if (document.visibilityState === "visible") send();
    };

    send();
    const interval = setInterval(pingIfVisible, HEARTBEAT_INTERVAL_MS);
    document.addEventListener("visibilitychange", pingIfVisible);

    return () => {
      clearInterval(interval);
      document.removeEventListener("visibilitychange", pingIfVisible);
    };
  }, []);

  return null;
}
