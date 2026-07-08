"use server";

import { signIn } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { AuthError } from "next-auth";
import { redirect } from "next/navigation";

export async function loginAction(_prevState: string | undefined, formData: FormData) {
  const email = formData.get("email") as string;

  try {
    await signIn("credentials", {
      email,
      password: formData.get("password"),
      redirect: false,
    });
  } catch (error) {
    if (error instanceof AuthError) {
      return "E-mail ou senha inválidos.";
    }
    throw error;
  }

  const user = await prisma.user.findUnique({ where: { email }, select: { role: true } });
  redirect(user?.role === "ADMIN" ? "/admin" : "/");
}
