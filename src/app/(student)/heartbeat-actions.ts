"use server";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function pingHeartbeat() {
  const session = await auth();
  if (!session?.user) return;

  await prisma.user.update({
    where: { id: session.user.id },
    data: { lastSeenAt: new Date() },
  });
}
