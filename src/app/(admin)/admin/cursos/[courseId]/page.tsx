import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  createModule,
  renameModule,
  createBlankLesson,
  deleteModule,
  togglePublishCourse,
  togglePublishLesson,
  toggleComingSoonCourse,
  toggleComingSoonModule,
  toggleComingSoonLesson,
  deleteCourse,
  updateCourse,
} from "../actions";
import { BackLink } from "@/components/layout/BackLink";
import { ImageUploadForm } from "@/components/admin/ImageUploadForm";

export default async function CourseDetailPage({
  params,
}: {
  params: Promise<{ courseId: string }>;
}) {
  const { courseId } = await params;

  const course = await prisma.course.findUnique({
    where: { id: courseId },
    include: {
      modules: {
        orderBy: { order: "asc" },
        include: { lessons: { orderBy: { order: "asc" } } },
      },
    },
  });

  if (!course) notFound();

  return (
    <div className="space-y-6">
      <div>
        <BackLink href="/admin/cursos" label="Voltar para conteúdos" />
      </div>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold">{course.title}</h1>
          <p className="text-sm text-muted-foreground">{course.description}</p>
        </div>
        <div className="flex gap-2">
          <form action={toggleComingSoonCourse.bind(null, course.id, !course.comingSoon)}>
            <Button variant="outline" type="submit">
              {course.comingSoon ? "Remover \"Em breve\"" : "Marcar como \"Em breve\""}
            </Button>
          </form>
          <form action={togglePublishCourse.bind(null, course.id, !course.published)}>
            <Button variant="outline" type="submit">
              {course.published ? "Despublicar" : "Publicar conteúdo"}
            </Button>
          </form>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Nome e subtítulo</CardTitle>
        </CardHeader>
        <CardContent>
          <form action={updateCourse.bind(null, course.id)} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="course-title">Título do conteúdo</Label>
              <Input id="course-title" name="title" defaultValue={course.title} required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="course-description">Subtítulo</Label>
              <Textarea
                id="course-description"
                name="description"
                rows={2}
                defaultValue={course.description ?? ""}
              />
            </div>
            <Button type="submit">Salvar</Button>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Imagem de capa</CardTitle>
        </CardHeader>
        <CardContent>
          <ImageUploadForm
            uploadUrl={`/api/admin/courses/${course.id}/cover`}
            currentUrl={course.coverImageUrl}
            currentFocalPoint={{ x: course.coverFocalX, y: course.coverFocalY }}
            label="Capa do conteúdo"
          />
        </CardContent>
      </Card>

      {course.modules.map((module) => (
        <Card key={module.id}>
          <CardHeader className="flex flex-row items-center justify-between gap-2">
            <form
              action={renameModule.bind(null, course.id, module.id)}
              className="flex flex-1 items-center gap-2"
            >
              <Input
                name="title"
                defaultValue={module.title}
                required
                className="h-8 max-w-xs border-transparent bg-transparent px-1 text-base font-semibold shadow-none hover:border-input focus-visible:border-input"
              />
              <Button variant="ghost" size="sm" type="submit">
                Salvar nome
              </Button>
              {module.comingSoon && <Badge variant="secondary">Em breve</Badge>}
            </form>
            <div className="flex items-center gap-2">
              <form
                action={toggleComingSoonModule.bind(null, course.id, module.id, !module.comingSoon)}
              >
                <Button variant="ghost" size="sm" type="submit">
                  {module.comingSoon ? "Remover \"Em breve\"" : "Marcar \"Em breve\""}
                </Button>
              </form>
              <form action={deleteModule.bind(null, course.id, module.id)}>
                <Button variant="ghost" size="sm" type="submit">
                  Remover módulo
                </Button>
              </form>
            </div>
          </CardHeader>
          <CardContent className="space-y-2">
            {module.lessons.map((lesson) => (
              <div
                key={lesson.id}
                className="flex items-center justify-between rounded-md border p-2"
              >
                <Link
                  href={`/admin/cursos/${course.id}/modulos/${module.id}/aulas/${lesson.id}`}
                  className="text-sm hover:underline"
                >
                  {lesson.title}
                </Link>
                <div className="flex items-center gap-2">
                  {lesson.comingSoon && <Badge variant="secondary">Em breve</Badge>}
                  <Badge variant={lesson.published ? "default" : "secondary"}>
                    {lesson.published ? "Publicada" : "Rascunho"}
                  </Badge>
                  <form
                    action={toggleComingSoonLesson.bind(
                      null,
                      course.id,
                      lesson.id,
                      !lesson.comingSoon,
                    )}
                  >
                    <Button variant="ghost" size="sm" type="submit">
                      {lesson.comingSoon ? "Remover \"Em breve\"" : "Marcar \"Em breve\""}
                    </Button>
                  </form>
                  <form
                    action={togglePublishLesson.bind(
                      null,
                      course.id,
                      lesson.id,
                      !lesson.published,
                    )}
                  >
                    <Button variant="ghost" size="sm" type="submit">
                      {lesson.published ? "Despublicar" : "Publicar"}
                    </Button>
                  </form>
                </div>
              </div>
            ))}

            <form action={createBlankLesson.bind(null, course.id, module.id)}>
              <Button variant="link" size="sm" type="submit" className="h-auto px-0">
                + Adicionar aula
              </Button>
            </form>
          </CardContent>
        </Card>
      ))}

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Novo módulo</CardTitle>
        </CardHeader>
        <CardContent>
          <form action={createModule.bind(null, course.id)} className="flex gap-2">
            <Input name="title" placeholder="Título do módulo" required />
            <Button type="submit">Adicionar</Button>
          </form>
        </CardContent>
      </Card>

      <Card className="border-destructive/30">
        <CardHeader>
          <CardTitle className="text-base text-destructive">Excluir conteúdo</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="mb-3 text-sm text-muted-foreground">
            Essa ação remove o conteúdo, todos os módulos, aulas, vídeos e materiais permanentemente.
          </p>
          <form action={deleteCourse.bind(null, course.id)}>
            <Button variant="destructive" type="submit">
              Excluir conteúdo
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
