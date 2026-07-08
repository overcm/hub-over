import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { bucketIndexFor, withBucketSet } from "@/lib/heatmap";

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id: lessonId } = await params;
  const { currentTime, duration } = await req.json();

  if (typeof currentTime !== "number" || typeof duration !== "number") {
    return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
  }

  const bucketIndex = bucketIndexFor(currentTime, duration);

  const existing = await prisma.lessonProgress.findUnique({
    where: { lessonId_userId: { lessonId, userId: session.user.id } },
  });

  const completed = existing?.completed || (duration > 0 && currentTime >= duration * 0.9);
  const watchedBuckets = withBucketSet(existing?.watchedBuckets ?? 0, bucketIndex);

  await prisma.lessonProgress.upsert({
    where: { lessonId_userId: { lessonId, userId: session.user.id } },
    update: {
      lastPositionSec: Math.floor(currentTime),
      watchedBuckets,
      completed,
      completedAt: completed ? new Date() : undefined,
    },
    create: {
      lessonId,
      userId: session.user.id,
      lastPositionSec: Math.floor(currentTime),
      watchedBuckets,
      completed,
      completedAt: completed ? new Date() : undefined,
    },
  });

  return NextResponse.json({ ok: true, completed });
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id: lessonId } = await params;
  const { completed } = await req.json();

  if (typeof completed !== "boolean") {
    return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
  }

  await prisma.lessonProgress.upsert({
    where: { lessonId_userId: { lessonId, userId: session.user.id } },
    update: { completed, completedAt: completed ? new Date() : null },
    create: { lessonId, userId: session.user.id, completed, completedAt: completed ? new Date() : null },
  });

  return NextResponse.json({ ok: true, completed });
}
