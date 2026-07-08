"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/permissions";
import { prisma } from "@/lib/prisma";
import { createMentoringEvent, disconnectGoogleCalendar } from "@/lib/google-calendar";

export async function disconnectGoogleAction() {
  await requireAdmin();
  await disconnectGoogleCalendar();
  revalidatePath("/admin/mentoria");
}

type ActionResult = { error?: string; success?: string; htmlLink?: string; meetLink?: string | null };

export async function createMentoringEventAction(
  _prevState: ActionResult | undefined,
  formData: FormData,
): Promise<ActionResult> {
  await requireAdmin();

  const title = (formData.get("title") as string)?.trim();
  const date = formData.get("date") as string;
  const startTime = formData.get("startTime") as string;
  const durationMinutes = Number(formData.get("durationMinutes"));
  const description = (formData.get("description") as string)?.trim();
  const studentIds = formData.getAll("studentIds") as string[];

  if (!title) return { error: "Informe um título para a mentoria" };
  if (!date || !startTime) return { error: "Informe data e horário" };
  if (!durationMinutes || durationMinutes <= 0) return { error: "Duração inválida" };
  if (studentIds.length === 0) return { error: "Selecione pelo menos um aluno" };

  const students = await prisma.user.findMany({
    where: { id: { in: studentIds }, role: "STUDENT" },
    select: { email: true },
  });
  const attendeeEmails = students.map((s) => s.email);

  // Brasil não observa horário de verão desde 2019, então -03:00 é fixo.
  const startDateTime = `${date}T${startTime}:00`;
  const startInstant = new Date(`${startDateTime}-03:00`);
  const endInstant = new Date(startInstant.getTime() + durationMinutes * 60_000);
  const endDateTime = new Date(endInstant.getTime() - 3 * 60 * 60 * 1000)
    .toISOString()
    .slice(0, 19);

  try {
    const event = await createMentoringEvent({
      title,
      description: description || undefined,
      startDateTime,
      endDateTime,
      attendeeEmails,
    });

    revalidatePath("/admin/mentoria");
    return {
      success: `Mentoria criada e enviada para ${attendeeEmails.length} aluno(s).`,
      htmlLink: event.htmlLink,
      meetLink: event.meetLink,
    };
  } catch (err) {
    console.error("[mentoria] erro ao criar evento", err);
    return { error: "Não foi possível criar a mentoria. Verifique a conexão com o Google." };
  }
}
