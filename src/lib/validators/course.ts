import { z } from "zod";

export const courseSchema = z.object({
  title: z.string().min(3, "Título muito curto"),
  description: z.string().optional(),
});

export const moduleSchema = z.object({
  title: z.string().min(2, "Título muito curto"),
});

export const lessonSchema = z.object({
  title: z.string().min(2, "Título muito curto"),
  description: z.string().optional(),
});

export const chapterSchema = z.object({
  title: z.string().min(1, "Título obrigatório"),
  startSec: z.coerce.number().int().min(0),
  endSec: z.coerce.number().int().min(0).optional(),
});

export function hmsToSeconds(h: unknown, m: unknown, s: unknown) {
  const hours = Number(h) || 0;
  const minutes = Number(m) || 0;
  const seconds = Number(s) || 0;
  return hours * 3600 + minutes * 60 + seconds;
}
