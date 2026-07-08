"use server";

import { requireAdmin } from "@/lib/permissions";
import { prisma } from "@/lib/prisma";
import { createStudentSchema } from "@/lib/validators/user";
import { sendStudentCredentialsEmail } from "@/lib/email";
import bcrypt from "bcryptjs";
import crypto from "node:crypto";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";

function generateTemporaryPassword() {
  return crypto.randomBytes(6).toString("base64url");
}

export async function createStudent(formData: FormData) {
  const admin = await requireAdmin();

  const parsed = createStudentSchema.parse({
    name: formData.get("name"),
    email: formData.get("email"),
  });

  const courseIds = formData.getAll("courseIds") as string[];

  const temporaryPassword = generateTemporaryPassword();
  const passwordHash = await bcrypt.hash(temporaryPassword, 10);

  const student = await prisma.user.create({
    data: {
      name: parsed.name,
      email: parsed.email,
      passwordHash,
      role: "STUDENT",
    },
  });

  if (courseIds.length > 0) {
    await prisma.enrollment.createMany({
      data: courseIds.map((courseId) => ({ userId: student.id, courseId, grantedById: admin.id })),
      skipDuplicates: true,
    });
  }

  await sendStudentCredentialsEmail({
    name: student.name,
    email: student.email,
    temporaryPassword,
  });

  redirect(`/admin/alunos/${student.id}`);
}

export async function grantEnrollment(userId: string, formData: FormData) {
  const admin = await requireAdmin();
  const courseId = formData.get("courseId") as string;
  if (!courseId) return;

  await prisma.enrollment.upsert({
    where: { userId_courseId: { userId, courseId } },
    update: {},
    create: { userId, courseId, grantedById: admin.id },
  });

  revalidatePath(`/admin/alunos/${userId}`);
}

export async function revokeEnrollment(userId: string, courseId: string) {
  await requireAdmin();
  await prisma.enrollment.delete({ where: { userId_courseId: { userId, courseId } } });
  revalidatePath(`/admin/alunos/${userId}`);
}
