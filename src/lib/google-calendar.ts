import crypto from "node:crypto";
import { getSettings, updateSettings } from "@/lib/settings";

const GOOGLE_OAUTH_SCOPES = [
  "https://www.googleapis.com/auth/calendar.events",
  "openid",
  "email",
].join(" ");

function getRedirectUri() {
  const baseUrl = process.env.NEXTAUTH_URL ?? "http://localhost:3000";
  return `${baseUrl}/api/google/callback`;
}

export function getGoogleAuthUrl() {
  const clientId = process.env.GOOGLE_CLIENT_ID;
  if (!clientId) throw new Error("GOOGLE_CLIENT_ID não configurado");

  const params = new URLSearchParams({
    client_id: clientId,
    redirect_uri: getRedirectUri(),
    response_type: "code",
    scope: GOOGLE_OAUTH_SCOPES,
    access_type: "offline",
    prompt: "consent",
  });

  return `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`;
}

export async function exchangeCodeForTokens(code: string) {
  const clientId = process.env.GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
  if (!clientId || !clientSecret) throw new Error("Credenciais do Google não configuradas");

  const res = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      client_id: clientId,
      client_secret: clientSecret,
      code,
      redirect_uri: getRedirectUri(),
      grant_type: "authorization_code",
    }),
  });

  if (!res.ok) {
    throw new Error(`Falha ao trocar código por token: ${await res.text()}`);
  }

  return res.json() as Promise<{
    access_token: string;
    refresh_token?: string;
    expires_in: number;
  }>;
}

async function refreshAccessToken(refreshToken: string) {
  const clientId = process.env.GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
  if (!clientId || !clientSecret) throw new Error("Credenciais do Google não configuradas");

  const res = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      client_id: clientId,
      client_secret: clientSecret,
      refresh_token: refreshToken,
      grant_type: "refresh_token",
    }),
  });

  if (!res.ok) {
    throw new Error(`Falha ao renovar token do Google: ${await res.text()}`);
  }

  return res.json() as Promise<{ access_token: string; expires_in: number }>;
}

export async function getGoogleAccountEmail(accessToken: string) {
  const res = await fetch("https://www.googleapis.com/oauth2/v2/userinfo", {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  if (!res.ok) return null;
  const data = await res.json();
  return (data.email as string) ?? null;
}

async function getValidAccessToken(): Promise<string> {
  const settings = await getSettings();
  if (!settings.googleRefreshToken) {
    throw new Error("Google Calendar não está conectado");
  }

  const isExpired =
    !settings.googleTokenExpiry || settings.googleTokenExpiry.getTime() < Date.now() + 60_000;

  if (!isExpired && settings.googleAccessToken) {
    return settings.googleAccessToken;
  }

  const refreshed = await refreshAccessToken(settings.googleRefreshToken);
  const expiry = new Date(Date.now() + refreshed.expires_in * 1000);

  await updateSettings({
    googleAccessToken: refreshed.access_token,
    googleTokenExpiry: expiry,
  });

  return refreshed.access_token;
}

export async function isGoogleCalendarConnected() {
  const settings = await getSettings();
  return Boolean(settings.googleRefreshToken);
}

export async function createMentoringEvent(params: {
  title: string;
  description?: string;
  startDateTime: string;
  endDateTime: string;
  attendeeEmails: string[];
  timeZone?: string;
}) {
  const accessToken = await getValidAccessToken();

  const body = {
    summary: params.title,
    description: params.description,
    start: { dateTime: params.startDateTime, timeZone: params.timeZone ?? "America/Sao_Paulo" },
    end: { dateTime: params.endDateTime, timeZone: params.timeZone ?? "America/Sao_Paulo" },
    attendees: params.attendeeEmails.map((email) => ({ email })),
    // Google Calendar colorId "5" = Banana (amarelo)
    colorId: "5",
    conferenceData: {
      createRequest: {
        requestId: crypto.randomUUID(),
        conferenceSolutionKey: { type: "hangoutsMeet" },
      },
    },
  };

  const res = await fetch(
    "https://www.googleapis.com/calendar/v3/calendars/primary/events?conferenceDataVersion=1&sendUpdates=all",
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    },
  );

  if (!res.ok) {
    throw new Error(`Falha ao criar evento no Google Calendar: ${await res.text()}`);
  }

  const event = await res.json();
  return {
    eventId: event.id as string,
    htmlLink: event.htmlLink as string,
    meetLink: (event.hangoutLink as string | undefined) ?? null,
  };
}

export async function disconnectGoogleCalendar() {
  await updateSettings({
    googleAccountEmail: null,
    googleAccessToken: null,
    googleRefreshToken: null,
    googleTokenExpiry: null,
  });
}
