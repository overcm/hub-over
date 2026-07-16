"use client";

import { useEffect } from "react";

const HEARTBEAT_INTERVAL_MS = 2 * 60 * 1000;

export function HeartbeatTracker() {
  useEffect(() => {
    const send = () => {
      fetch("/api/heartbeat", { method: "POST" });
    };

    const sendIfVisible = () => {
      if (document.visibilityState === "visible") send();
    };

    send();
    const interval = setInterval(sendIfVisible, HEARTBEAT_INTERVAL_MS);
    document.addEventListener("visibilitychange", sendIfVisible);

    return () => {
      clearInterval(interval);
      document.removeEventListener("visibilitychange", sendIfVisible);
    };
  }, []);

  return null;
}
