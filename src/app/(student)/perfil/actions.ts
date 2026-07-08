"use server";

import bcrypt from "bcryptjs";
import { requireUser } from "@/lib/permissions";
import { prisma } from "@/lib/prisma";
import { changePasswordSchema } from "@/lib/validators/user";

type ActionResult = { error?: string; success?: string };

export async function changePasswordAction(
  _prevState: ActionResult | undefined,
  formData: FormData,
): Promise<ActionResult> {
  const user = await requireUser();

  const parsed = changePasswordSchema.safeParse({
    currentPassword: formData.get("currentPassword"),
    newPassword: formData.get("newPassword"),
    confirmPassword: formData.get("confirmPassword"),
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Dados inválidos" };
  }

  const dbUser = await prisma.user.findUnique({ where: { id: user.id } });
  if (!dbUser) return { error: "Usuário não encontrado" };

  const currentPasswordValid = await bcrypt.compare(
    parsed.data.currentPassword,
    dbUser.passwordHash,
  );
  if (!currentPasswordValid) {
    return { error: "Senha atual incorreta" };
  }

  const passwordHash = await bcrypt.hash(parsed.data.newPassword, 10);
  await prisma.user.update({ where: { id: user.id }, data: { passwordHash } });

  return { success: "Senha alterada com sucesso." };
}
