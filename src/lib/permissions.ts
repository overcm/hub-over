import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";

export async function requireUser() {
  const session = await auth();
  if (!session?.user) redirect("/login");
  return session.user;
}

export async function requireAdmin() {
  const user = await requireUser();
  if (user.role !== "ADMIN") redirect("/");
  return user;
}

export async function requireEnrollment(courseId: string) {
  const user = await requireUser();
  if (user.role === "ADMIN") return user;

  const enrollment = await prisma.enrollment.findUnique({
    where: { userId_courseId: { userId: user.id, courseId } },
  });

  if (!enrollment || (enrollment.expiresAt && enrollment.expiresAt < new Date())) {
    redirect("/");
  }

  return user;
}
