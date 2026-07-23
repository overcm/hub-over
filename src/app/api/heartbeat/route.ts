import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// Caps how much time a single heartbeat can add to totalActiveSeconds, so a
// long gap since the last ping (closed tab, overnight, etc.) doesn't get
// counted as active time — only the expected ~2min interval does.
const MAX_HEARTBEAT_GAP_SECONDS = 5 * 60;

export async function POST() {
  const session = await auth();
  if (!session?.user) {
    return new Response(null, { status: 401 });
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { lastSeenAt: true },
  });

  const now = new Date();
  let deltaSeconds = 0;
  if (user?.lastSeenAt) {
    const gapSeconds = (now.getTime() - user.lastSeenAt.getTime()) / 1000;
    deltaSeconds = Math.round(Math.min(Math.max(gapSeconds, 0), MAX_HEARTBEAT_GAP_SECONDS));
  }

  await prisma.user.update({
    where: { id: session.user.id },
    data: {
      lastSeenAt: now,
      totalActiveSeconds: { increment: deltaSeconds },
    },
  });

  return new Response(null, { status: 204 });
}
