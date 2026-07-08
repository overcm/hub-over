import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/permissions";
import { getGoogleAuthUrl } from "@/lib/google-calendar";

export async function GET() {
  await requireAdmin();
  const baseUrl = process.env.NEXTAUTH_URL ?? "http://localhost:3000";

  try {
    return NextResponse.redirect(getGoogleAuthUrl());
  } catch {
    return NextResponse.redirect(`${baseUrl}/admin/mentoria?error=missing_credentials`);
  }
}
