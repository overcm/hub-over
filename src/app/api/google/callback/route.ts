import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/permissions";
import { updateSettings } from "@/lib/settings";
import { exchangeCodeForTokens, getGoogleAccountEmail } from "@/lib/google-calendar";

export async function GET(req: NextRequest) {
  await requireAdmin();

  const code = req.nextUrl.searchParams.get("code");
  const error = req.nextUrl.searchParams.get("error");
  const baseUrl = process.env.NEXTAUTH_URL ?? "http://localhost:3000";

  if (error || !code) {
    return NextResponse.redirect(`${baseUrl}/admin/mentoria?error=google_denied`);
  }

  try {
    const tokens = await exchangeCodeForTokens(code);
    const email = await getGoogleAccountEmail(tokens.access_token);

    await updateSettings({
      googleAccountEmail: email,
      googleAccessToken: tokens.access_token,
      googleRefreshToken: tokens.refresh_token ?? undefined,
      googleTokenExpiry: new Date(Date.now() + tokens.expires_in * 1000),
    });
  } catch (err) {
    console.error("[google-oauth] falha ao conectar", err);
    return NextResponse.redirect(`${baseUrl}/admin/mentoria?error=google_failed`);
  }

  return NextResponse.redirect(`${baseUrl}/admin/mentoria?connected=1`);
}
