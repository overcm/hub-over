import { CalendarPlus, CheckCircle2 } from "lucide-react";
import { getSettings } from "@/lib/settings";
import { prisma } from "@/lib/prisma";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { disconnectGoogleAction } from "./actions";
import { CreateMentoringForm } from "./CreateMentoringForm";

const ERROR_MESSAGES: Record<string, string> = {
  missing_credentials:
    "As credenciais do Google (GOOGLE_CLIENT_ID/GOOGLE_CLIENT_SECRET) ainda não foram configuradas no servidor.",
  google_denied: "A conexão com o Google foi cancelada.",
  google_failed: "Não foi possível conectar com o Google. Tente novamente.",
};

export default async function AdminSchedulingPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;
  const settings = await getSettings();
  const isConnected = Boolean(settings.googleRefreshToken);

  let studentGroups: { id: string; title: string; students: { id: string; name: string; email: string }[] }[] = [];

  if (isConnected) {
    const [courses, allStudents] = await Promise.all([
      prisma.course.findMany({
        orderBy: { title: "asc" },
        include: {
          enrollments: {
            include: { user: { select: { id: true, name: true, email: true } } },
          },
        },
      }),
      prisma.user.findMany({
        where: { role: "STUDENT" },
        orderBy: { name: "asc" },
        select: { id: true, name: true, email: true },
      }),
    ]);

    const enrolledIds = new Set(courses.flatMap((c) => c.enrollments.map((e) => e.userId)));
    const unassigned = allStudents.filter((s) => !enrolledIds.has(s.id));

    studentGroups = [
      ...courses
        .map((c) => ({
          id: c.id,
          title: c.title,
          students: c.enrollments.map((e) => e.user).sort((a, b) => a.name.localeCompare(b.name)),
        }))
        .filter((g) => g.students.length > 0),
      ...(unassigned.length > 0
        ? [{ id: "sem-conteudo", title: "Sem conteúdo liberado", students: unassigned }]
        : []),
    ];
  }

  return (
    <div className="max-w-2xl space-y-6">
      <div>
        <p className="text-xs font-semibold tracking-widest text-primary uppercase">Agenda</p>
        <h1 className="mt-1 text-3xl font-semibold tracking-tight">Marcar mentoria</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Conecte sua conta do Google e crie a mentoria aqui mesmo: o evento (com link do Google
          Meet) cai direto na sua agenda e na de todos os alunos convidados, de uma vez.
        </p>
      </div>

      {error && (
        <p className="rounded-md border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive">
          {ERROR_MESSAGES[error] ?? "Ocorreu um erro."}
        </p>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Conexão com o Google Calendar</CardTitle>
        </CardHeader>
        <CardContent>
          {isConnected ? (
            <div className="flex flex-wrap items-center justify-between gap-3">
              <span className="flex items-center gap-2 text-sm">
                <CheckCircle2 size={16} className="text-primary" />
                Conectado como <span className="font-medium">{settings.googleAccountEmail}</span>
              </span>
              <form action={disconnectGoogleAction}>
                <Button variant="ghost" size="sm" type="submit">
                  Desconectar
                </Button>
              </form>
            </div>
          ) : (
            <div className="space-y-3">
              <p className="text-sm text-muted-foreground">
                Sua agenda do Google ainda não está conectada.
              </p>
              <Button
                render={
                  <a href="/api/google/connect">
                    <CalendarPlus size={16} />
                    Conectar com o Google Calendar
                  </a>
                }
                nativeButton={false}
                className="flex w-full items-center justify-center gap-2 sm:w-auto"
              />
            </div>
          )}
        </CardContent>
      </Card>

      {isConnected && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Nova mentoria</CardTitle>
          </CardHeader>
          <CardContent>
            <CreateMentoringForm groups={studentGroups} />
          </CardContent>
        </Card>
      )}
    </div>
  );
}
