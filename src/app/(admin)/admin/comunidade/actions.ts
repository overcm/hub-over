"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/permissions";
import { updateSettings } from "@/lib/settings";

export async function updateCommunitySettings(formData: FormData) {
  await requireAdmin();

  const whatsappCommunityUrl = (formData.get("whatsappCommunityUrl") as string)?.trim() || null;
  const communityGuidelines = (formData.get("communityGuidelines") as string)?.trim() || null;

  await updateSettings({ whatsappCommunityUrl, communityGuidelines });

  revalidatePath("/admin/comunidade");
  revalidatePath("/comunidade");
}
