import { prisma } from "@/lib/prisma";

const SETTINGS_ID = "singleton";

export async function getSettings() {
  const settings = await prisma.settings.findUnique({ where: { id: SETTINGS_ID } });
  return (
    settings ?? {
      id: SETTINGS_ID,
      whatsappCommunityUrl: null,
      communityGuidelines: null,
      googleAccountEmail: null,
      googleAccessToken: null,
      googleRefreshToken: null,
      googleTokenExpiry: null,
    }
  );
}

export async function updateSettings(data: {
  whatsappCommunityUrl?: string | null;
  communityGuidelines?: string | null;
  googleAccountEmail?: string | null;
  googleAccessToken?: string | null;
  googleRefreshToken?: string | null;
  googleTokenExpiry?: Date | null;
}) {
  return prisma.settings.upsert({
    where: { id: SETTINGS_ID },
    create: { id: SETTINGS_ID, ...data },
    update: data,
  });
}
