import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  updateLesson,
  deleteLesson,
  createChapter,
  deleteChapter,
  deleteMaterial,
  createMaterialNote,
  toggleComingSoonLesson,
} from "../../../../../actions";
import { VideoUploadForm } from "@/components/admin/VideoUploadForm";
import { MaterialUploadForm } from "@/components/admin/MaterialUploadForm";
import { ImageUploadForm } from "@/components/admin/ImageUploadForm";
import { Linkify } from "@/components/lesson/Linkify";
import { ConfirmSubmitButton } from "@/components/admin/ConfirmSubmitButton";
import { formatDuration as formatSeconds } from "@/lib/utils";
import { BackLink } from "@/components/layout/BackLink";

export default async function LessonEditPage({
  params,
}: {
  params: Promise<{ courseId: string; moduleId: string; lessonId: string }>;
}) {
  const { courseId, moduleId, lessonId } = await params;

  const lesson = await prisma.lesson.findUnique({
    where: { id: lessonId },
    include: {
      chapters: { orderBy: { startSec: "asc" } },
      materials: { orderBy: { createdAt: "asc" } },
    },
  });

  if (!lesson) notFound();

  return (
    <div className="max-w-2xl space-y-6">
      <BackLink href={`/admin/cursos/${courseId}`} label="Voltar para o conteúdo" />
      <Card>
        <CardHeader>
          <CardTitle>Editar aula</CardTitle>
        </CardHeader>
        <CardContent>
          <form
            id="lesson-metadata-form"
            action={updateLesson.bind(null, courseId, lessonId)}
            className="space-y-4"
          >
            <div className="space-y-2">
              <Label htmlFor="title">Título</Label>
              <Input id="title" name="title" defaultValue={lesson.title} required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Descrição</Label>
              <Textarea
                id="description"
                name="description"
                rows={3}
                defaultValue={lesson.description ?? ""}
              />
            </div>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Imagem de capa da aula</CardTitle>
        </CardHeader>
        <CardContent>
          <ImageUploadForm
            uploadUrl={`/api/admin/lessons/${lesson.id}/thumbnail`}
            currentUrl={lesson.thumbnailUrl}
            currentFocalPoint={{ x: lesson.thumbnailFocalX, y: lesson.thumbnailFocalY }}
            label="Capa da aula"
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Vídeo da aula</CardTitle>
        </CardHeader>
        <CardContent>
          <VideoUploadForm
            lessonId={lesson.id}
            currentStatus={lesson.videoStatus}
            currentFileName={lesson.videoFileName}
            provider={process.env.VIDEO_PROVIDER ?? "local"}
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Materiais complementares</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {lesson.materials.length === 0 ? (
            <p className="text-sm text-muted-foreground">Nenhum material enviado ainda.</p>
          ) : (
            <ul className="space-y-2">
              {lesson.materials.map((material) => (
                <li key={material.id} className="rounded-md border p-2">
                  <div className="flex items-start justify-between gap-2">
                    {material.fileUrl ? (
                      <a
                        href={material.fileUrl}
                        target="_blank"
                        className="truncate text-sm hover:underline"
                      >
                        {material.title}
                      </a>
                    ) : (
                      <p className="text-sm font-medium">{material.title}</p>
                    )}
                    <form action={deleteMaterial.bind(null, material.id)}>
                      <ConfirmSubmitButton
                        variant="ghost"
                        size="sm"
                        confirmMessage={`Remover o material "${material.title}"? Essa ação não pode ser desfeita.`}
                      >
                        Remover
                      </ConfirmSubmitButton>
                    </form>
                  </div>
                  {material.content && (
                    <Linkify
                      text={material.content}
                      className="mt-1 whitespace-pre-wrap text-sm text-muted-foreground"
                    />
                  )}
                </li>
              ))}
            </ul>
          )}

          <MaterialUploadForm lessonId={lessonId} />

          <form action={createMaterialNote.bind(null, lessonId)} className="space-y-2 border-t pt-3">
            <p className="text-xs text-muted-foreground">Ou adicione uma anotação em texto (ex: resumo da reunião):</p>
            <Input name="title" placeholder="Título da anotação" required />
            <Textarea name="content" placeholder="Escreva os detalhes aqui..." rows={4} required />
            <Button type="submit" variant="outline" className="w-full">
              Adicionar anotação
            </Button>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Capítulos</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {lesson.chapters.map((chapter) => (
            <div key={chapter.id} className="flex items-center justify-between rounded-md border p-2">
              <span className="text-sm">
                {formatSeconds(chapter.startSec)}
                {chapter.endSec ? ` – ${formatSeconds(chapter.endSec)}` : ""} — {chapter.title}
              </span>
              <form action={deleteChapter.bind(null, chapter.id)}>
                <ConfirmSubmitButton
                  variant="ghost"
                  size="sm"
                  confirmMessage={`Remover o capítulo "${chapter.title}"?`}
                >
                  Remover
                </ConfirmSubmitButton>
              </form>
            </div>
          ))}

          <form action={createChapter.bind(null, lessonId)} className="space-y-2">
            <Input name="title" placeholder="Título do tema" required />
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-6">
              <div className="col-span-2 sm:col-span-3">
                <p className="mb-1 text-xs text-muted-foreground">Início (h / min / s)</p>
                <div className="flex gap-1">
                  <Input name="startHours" type="number" min={0} placeholder="h" />
                  <Input name="startMinutes" type="number" min={0} max={59} placeholder="min" />
                  <Input name="startSeconds" type="number" min={0} max={59} placeholder="s" required />
                </div>
              </div>
              <div className="col-span-2 sm:col-span-3">
                <p className="mb-1 text-xs text-muted-foreground">Fim (h / min / s) — opcional</p>
                <div className="flex gap-1">
                  <Input name="endHours" type="number" min={0} placeholder="h" />
                  <Input name="endMinutes" type="number" min={0} max={59} placeholder="min" />
                  <Input name="endSeconds" type="number" min={0} max={59} placeholder="s" />
                </div>
              </div>
            </div>
            <Button type="submit" className="w-full">
              Adicionar capítulo
            </Button>
          </form>
        </CardContent>
      </Card>

      <div className="flex flex-wrap gap-2">
        <Button
          type="submit"
          form="lesson-metadata-form"
          name="intent"
          value="save"
          variant="outline"
        >
          Salvar
        </Button>
        <Button type="submit" form="lesson-metadata-form" name="intent" value="publish">
          Salvar e publicar
        </Button>
        <form action={toggleComingSoonLesson.bind(null, courseId, lessonId, !lesson.comingSoon)}>
          <Button variant="outline" type="submit">
            {lesson.comingSoon ? "Remover \"Em breve\"" : "Marcar como \"Em breve\""}
          </Button>
        </form>
      </div>

      <Card className="border-destructive/30">
        <CardHeader>
          <CardTitle className="text-base text-destructive">Excluir aula</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="mb-3 text-sm text-muted-foreground">
            Essa ação remove a aula, o vídeo, os materiais e os capítulos permanentemente.
          </p>
          <form action={deleteLesson.bind(null, courseId, moduleId, lessonId)}>
            <ConfirmSubmitButton
              variant="destructive"
              confirmMessage={`Excluir permanentemente a aula "${lesson.title}"? Isso remove o vídeo, os materiais e os capítulos. Essa ação não pode ser desfeita.`}
            >
              Excluir aula
            </ConfirmSubmitButton>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
