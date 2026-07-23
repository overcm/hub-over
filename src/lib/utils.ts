import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import { intervalToDuration, formatDuration as formatDurationFns } from "date-fns"
import { ptBR } from "date-fns/locale"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatLoginDuration(start: Date, end: Date) {
  const totalMs = end.getTime() - start.getTime();
  if (totalMs < 60_000) return "menos de 1 minuto";

  const duration = intervalToDuration({ start, end });
  return formatDurationFns(duration, { locale: ptBR, format: ["days", "hours", "minutes"] });
}

export function formatDurationSeconds(totalSeconds: number) {
  if (totalSeconds < 60) return "menos de 1 minuto";

  const duration = {
    hours: Math.floor(totalSeconds / 3600),
    minutes: Math.floor((totalSeconds % 3600) / 60),
  };
  return formatDurationFns(duration, { locale: ptBR, format: ["hours", "minutes"] });
}

export function formatDuration(totalSeconds: number) {
  if (!Number.isFinite(totalSeconds)) return "0:00";
  const h = Math.floor(totalSeconds / 3600);
  const m = Math.floor((totalSeconds % 3600) / 60);
  const s = Math.floor(totalSeconds % 60);
  const mm = h > 0 ? m.toString().padStart(2, "0") : m;
  const ss = s.toString().padStart(2, "0");
  return h > 0 ? `${h}:${mm}:${ss}` : `${mm}:${ss}`;
}
