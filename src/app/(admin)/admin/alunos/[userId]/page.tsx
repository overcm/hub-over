import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { BackLink } from "@/components/layout/BackLink";
import { grantEnrollment, revokeEnrollment, deleteStudent } from "../actions";
import { ConfirmSubmitButton } from "@/components/admin/ConfirmSubmitButton";
import { formatLoginDuration } from "@/lib/utils";

function formatDateTime(date: Date) {
  return date.toLocaleString("pt-BR", {
    timeZone: "America/Sao_Paulo",
    day: "2-digit",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default async function StudentDetailPage({
  params,
}: {
  params: Promise<{ userId: string }>;
}) {
  const { userId } = await params;

  const student = await prisma.user.findUnique({
    where: { id: userId },
    include: {
      enrollments: {
        include: {
          course: {
            include: {
              modules: { include: { lessons: { where: { published: true }, select: { id: true } } } },
            },
          },
        },
      },
    },
  });

  if (!student) notFound();

  const enrolledCourseIds = new Set(student.enrollments.map((e) => e.courseId));

  const availableCourses = await prisma.course.findMany({
    where: { id: { notIn: Array.from(enrolledCourseIds) } },
    orderBy: { title: "asc" },
  });

  const allLessonIds = student.enrollments.flatMap((e) =>
    e.course.modules.flatMap((m) => m.lessons.map((l) => l.id)),
  );
  const completedRows = await prisma.lessonProgress.findMany({
    where: { userId, lessonId: { in: allLessonIds }, completed: true },
    select: { lessonId: true },
  });
  const completedSet = new Set(completedRows.map((r) => r.lessonId));

  return (
    <div className="max-w-2xl space-y-6">
      <BackLink href="/admin/alunos" label="Voltar para alunos" />
      <div>
        <h1 className="text-2xl font-semibold">{student.name}</h1>
        <p className="text-sm text-muted-foreground">{student.email}</p>
        <p className="mt-1 text-xs text-muted-foreground">
          Membro desde{" "}
          {student.createdAt.toLocaleDateString("pt-BR", {
            timeZone: "America/Sao_Paulo",
            day: "2-digit",
            month: "long",
            year: "numeric",
          })}
        </p>
        <p className="mt-1 text-xs text-muted-foreground">
          Primeiro acesso:{" "}
          {student.firstLoginAt ? formatDateTime(student.firstLoginAt) : "Ainda não acessou"}
        </p>
        <p className="mt-1 text-xs text-muted-foreground">
          Último acesso:{" "}
          {student.lastLoginAt ? formatDateTime(student.lastLoginAt) : "Ainda não acessou"}
        </p>
        {student.lastLoginAt && student.lastSeenAt && (
          <p className="mt-1 text-xs text-muted-foreground">
            Tempo no último acesso: {formatLoginDuration(student.lastLoginAt, student.lastSeenAt)}
          </p>
        )}
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Conteúdos liberados</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {student.enrollments.length === 0 ? (
            <p className="text-sm text-muted-foreground">Nenhum conteúdo liberado ainda.</p>
          ) : (
            student.enrollments.map((enrollment) => {
              const lessonIds = enrollment.course.modules.flatMap((m) => m.lessons.map((l) => l.id));
              const done = lessonIds.filter((id) => completedSet.has(id)).length;
              const percent = lessonIds.length ? Math.round((done / lessonIds.length) * 100) : 0;

              return (
                <div key={enrollment.id} className="space-y-2 rounded-md border p-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">{enrollment.course.title}</span>
                    <form action={revokeEnrollment.bind(null, userId, enrollment.courseId)}>
                      <Button variant="ghost" size="sm" type="submit">
                        Revogar
                      </Button>
                    </form>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-muted">
                      <div className="h-full rounded-full bg-primary" style={{ width: `${percent}%` }} />
                    </div>
                    <span className="text-xs text-muted-foreground">
                      {done}/{lessonIds.length} aulas ({percent}%)
                    </span>
                  </div>
                </div>
              );
            })
          )}
        </CardContent>
      </Card>

      {availableCourses.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Liberar acesso a um conteúdo</CardTitle>
          </CardHeader>
          <CardContent>
            <form action={grantEnrollment.bind(null, userId)} className="flex gap-2">
              <select
                name="courseId"
                required
                className="flex-1 rounded-md border bg-background px-3 py-2 text-sm"
              >
                <option value="">Selecione um conteúdo</option>
                {availableCourses.map((course) => (
                  <option key={course.id} value={course.id}>
                    {course.title}
                  </option>
                ))}
              </select>
              <Button type="submit">Liberar</Button>
            </form>
          </CardContent>
        </Card>
      )}

      <Card className="border-destructive/30">
        <CardHeader>
          <CardTitle className="text-base text-destructive">Remover aluno</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="mb-3 text-sm text-muted-foreground">
            Essa ação remove o aluno, suas matrículas, anotações, comentários e progresso
            permanentemente. O acesso ao hub será encerrado imediatamente.
          </p>
          <form action={deleteStudent.bind(null, userId)}>
            <ConfirmSubmitButton
              variant="destructive"
              confirmMessage={`Remover permanentemente o aluno "${student.name}"? Isso encerra o acesso dele ao hub e apaga suas matrículas, anotações, comentários e progresso.`}
            >
              Remover aluno
            </ConfirmSubmitButton>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
