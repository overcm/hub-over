"use server";

import { requireAdmin } from "@/lib/permissions";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

type SpeakerStatus = "RADAR" | "CONTACTED" | "SCHEDULED" | "DONE";
const VALID_STATUSES: SpeakerStatus[] = ["RADAR", "CONTACTED", "SCHEDULED", "DONE"];

export async function createSpeaker(formData: FormData) {
  await requireAdmin();

  const name = (formData.get("name") as string)?.trim();
  if (!name) return;

  const rawStatus = formData.get("status") as string;
  const status = VALID_STATUSES.includes(rawStatus as SpeakerStatus)
    ? (rawStatus as SpeakerStatus)
    : "RADAR";

  await prisma.guestSpeaker.create({
    data: {
      name,
      price: (formData.get("price") as string)?.trim() || null,
      topics: (formData.get("topics") as string)?.trim() || null,
      caseSummary: (formData.get("caseSummary") as string)?.trim() || null,
      status,
    },
  });

  revalidatePath("/admin/mentores");
}

export async function updateSpeaker(speakerId: string, formData: FormData) {
  await requireAdmin();

  const name = (formData.get("name") as string)?.trim();
  if (!name) return;

  await prisma.guestSpeaker.update({
    where: { id: speakerId },
    data: {
      name,
      price: (formData.get("price") as string)?.trim() || null,
      topics: (formData.get("topics") as string)?.trim() || null,
      caseSummary: (formData.get("caseSummary") as string)?.trim() || null,
    },
  });

  revalidatePath("/admin/mentores");
}

export async function moveSpeaker(speakerId: string, status: SpeakerStatus) {
  await requireAdmin();
  await prisma.guestSpeaker.update({ where: { id: speakerId }, data: { status } });
  revalidatePath("/admin/mentores");
}

export async function deleteSpeaker(speakerId: string) {
  await requireAdmin();
  await prisma.guestSpeaker.delete({ where: { id: speakerId } });
  revalidatePath("/admin/mentores");
}
