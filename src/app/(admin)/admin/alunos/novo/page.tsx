import { createStudent } from "../actions";
import { prisma } from "@/lib/prisma";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BackLink } from "@/components/layout/BackLink";

export default async function NewStudentPage() {
  const courses = await prisma.course.findMany({
    orderBy: { title: "asc" },
    select: { id: true, title: true },
  });

  return (
    <div className="max-w-lg space-y-4">
      <BackLink href="/admin/alunos" label="Voltar para alunos" />
      <Card>
        <CardHeader>
          <CardTitle>Novo aluno</CardTitle>
        </CardHeader>
        <CardContent>
          <form action={createStudent} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Nome</Label>
              <Input id="name" name="name" required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">E-mail</Label>
              <Input id="email" name="email" type="email" required />
            </div>

            <div className="space-y-2">
              <Label>Conteúdos liberados (opcional)</Label>
              {courses.length === 0 ? (
                <p className="text-sm text-muted-foreground">Nenhum conteúdo criado ainda.</p>
              ) : (
                <div className="max-h-48 space-y-1 overflow-y-auto rounded-md border p-2">
                  {courses.map((course) => (
                    <label
                      key={course.id}
                      className="flex items-center gap-2 rounded-md p-1.5 text-sm hover:bg-muted"
                    >
                      <input
                        type="checkbox"
                        name="courseIds"
                        value={course.id}
                        className="h-4 w-4"
                      />
                      <span>{course.title}</span>
                    </label>
                  ))}
                </div>
              )}
            </div>

            <Button type="submit">Criar aluno</Button>
            <p className="text-xs text-muted-foreground">
              Uma senha temporária será gerada e enviada por e-mail (ou exibida no log do servidor, se o
              Resend ainda não estiver configurado).
            </p>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
