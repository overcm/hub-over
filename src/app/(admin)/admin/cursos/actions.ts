"use server";

import { requireAdmin } from "@/lib/permissions";
import { prisma } from "@/lib/prisma";
import {
  courseSchema,
  moduleSchema,
  lessonSchema,
  chapterSchema,
  hmsToSeconds,
} from "@/lib/validators/course";
import slugify from "slugify";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { getStorageProvider } from "@/lib/storage";
import { getVideoProvider } from "@/lib/video";

async function uniqueSlug(base: string, exists: (slug: string) => Promise<boolean>) {
  const baseSlug = slugify(base, { lower: true, strict: true });
  let slug = baseSlug;
  let i = 1;
  while (await exists(slug)) {
    slug = `${baseSlug}-${i}`;
    i++;
  }
  return slug;
}

export async function createCourse(formData: FormData) {
  const user = await requireAdmin();

  const parsed = courseSchema.parse({
    title: formData.get("title"),
    description: formData.get("description") || undefined,
  });

  const slug = await uniqueSlug(
    parsed.title,
    async (s) => (await prisma.course.findUnique({ where: { slug: s } })) !== null,
  );

  const course = await prisma.course.create({
    data: { ...parsed, slug, createdById: user.id },
  });

  redirect(`/admin/cursos/${course.id}`);
}

export async function updateCourse(courseId: string, formData: FormData) {
  await requireAdmin();
  const parsed = courseSchema.parse({
    title: formData.get("title"),
    description: formData.get("description") || undefined,
  });
  await prisma.course.update({ where: { id: courseId }, data: parsed });
  revalidatePath(`/admin/cursos/${courseId}`);
  revalidatePath("/", "layout");
}

export async function togglePublishCourse(courseId: string, published: boolean) {
  await requireAdmin();
  await prisma.course.update({ where: { id: courseId }, data: { published } });
  revalidatePath(`/admin/cursos/${courseId}`);
}

export async function toggleComingSoonCourse(courseId: string, comingSoon: boolean) {
  await requireAdmin();
  await prisma.course.update({ where: { id: courseId }, data: { comingSoon } });
  revalidatePath(`/admin/cursos/${courseId}`);
  revalidatePath("/", "layout");
}

export async function deleteCourse(courseId: string) {
  await requireAdmin();

  const lessons = await prisma.lesson.findMany({
    where: { module: { courseId } },
    include: { materials: true },
  });

  const storage = getStorageProvider();

  await Promise.all(
    lessons.map(async (lesson) => {
      if (lesson.videoAssetId) {
        const provider = getVideoProvider(lesson.videoProvider);
        await provider.deleteVideo(lesson.videoAssetId).catch(() => {});
      }
      await Promise.all(
        lesson.materials.filter((m) => m.fileUrl).map((m) => storage.delete(m.fileUrl!)),
      );
    }),
  );

  await prisma.course.delete({ where: { id: courseId } });
  redirect("/admin/cursos");
}

export async function createModule(courseId: string, formData: FormData) {
  await requireAdmin();
  const parsed = moduleSchema.parse({ title: formData.get("title") });

  const lastModule = await prisma.module.findFirst({
    where: { courseId },
    orderBy: { order: "desc" },
  });

  await prisma.module.create({
    data: { title: parsed.title, courseId, order: (lastModule?.order ?? -1) + 1 },
  });

  revalidatePath(`/admin/cursos/${courseId}`);
}

export async function renameModule(courseId: string, moduleId: string, formData: FormData) {
  await requireAdmin();
  const parsed = moduleSchema.parse({ title: formData.get("title") });
  await prisma.module.update({ where: { id: moduleId }, data: { title: parsed.title } });
  revalidatePath(`/admin/cursos/${courseId}`);
}

export async function toggleComingSoonModule(
  courseId: string,
  moduleId: string,
  comingSoon: boolean,
) {
  await requireAdmin();
  await prisma.module.update({ where: { id: moduleId }, data: { comingSoon } });
  revalidatePath(`/admin/cursos/${courseId}`);
  revalidatePath("/", "layout");
}

export async function deleteModule(courseId: string, moduleId: string) {
  await requireAdmin();
  await prisma.module.delete({ where: { id: moduleId } });
  revalidatePath(`/admin/cursos/${courseId}`);
}

export async function createBlankLesson(courseId: string, moduleId: string) {
  await requireAdmin();

  const slug = await uniqueSlug(
    "nova-aula",
    async (s) =>
      (await prisma.lesson.findUnique({ where: { moduleId_slug: { moduleId, slug: s } } })) !== null,
  );

  const lastLesson = await prisma.lesson.findFirst({
    where: { moduleId },
    orderBy: { order: "desc" },
  });

  const lesson = await prisma.lesson.create({
    data: {
      title: "Nova aula",
      slug,
      moduleId,
      order: (lastLesson?.order ?? -1) + 1,
    },
  });

  redirect(`/admin/cursos/${courseId}/modulos/${moduleId}/aulas/${lesson.id}`);
}

export async function updateLesson(
  courseId: string,
  lessonId: string,
  formData: FormData,
) {
  await requireAdmin();
  const parsed = lessonSchema.parse({
    title: formData.get("title"),
    description: formData.get("description") || undefined,
  });

  const publish = formData.get("intent") === "publish";

  await prisma.lesson.update({
    where: { id: lessonId },
    data: { ...parsed, ...(publish ? { published: true } : {}) },
  });

  redirect(`/admin/cursos/${courseId}`);
}

export async function togglePublishLesson(courseId: string, lessonId: string, published: boolean) {
  await requireAdmin();
  await prisma.lesson.update({ where: { id: lessonId }, data: { published } });
  revalidatePath(`/admin/cursos/${courseId}`);
}

export async function toggleComingSoonLesson(
  courseId: string,
  lessonId: string,
  comingSoon: boolean,
) {
  await requireAdmin();
  await prisma.lesson.update({ where: { id: lessonId }, data: { comingSoon } });
  revalidatePath(`/admin/cursos/${courseId}`);
  revalidatePath("/", "layout");
}

export async function deleteLesson(courseId: string, moduleId: string, lessonId: string) {
  await requireAdmin();

  const lesson = await prisma.lesson.findUnique({
    where: { id: lessonId },
    include: { materials: true },
  });

  if (lesson?.videoAssetId) {
    const provider = getVideoProvider(lesson.videoProvider);
    await provider.deleteVideo(lesson.videoAssetId).catch(() => {});
  }

  const storage = getStorageProvider();
  await Promise.all(
    lesson?.materials.filter((m) => m.fileUrl).map((m) => storage.delete(m.fileUrl!)) ?? [],
  );

  await prisma.lesson.delete({ where: { id: lessonId } });
  redirect(`/admin/cursos/${courseId}`);
}

export async function createChapter(lessonId: string, formData: FormData) {
  await requireAdmin();

  const startSec = hmsToSeconds(
    formData.get("startHours"),
    formData.get("startMinutes"),
    formData.get("startSeconds"),
  );

  const hasEnd = [formData.get("endHours"), formData.get("endMinutes"), formData.get("endSeconds")].some(
    (v) => v !== null && v !== "",
  );
  const endSec = hasEnd
    ? hmsToSeconds(formData.get("endHours"), formData.get("endMinutes"), formData.get("endSeconds"))
    : undefined;

  const parsed = chapterSchema.parse({
    title: formData.get("title"),
    startSec,
    endSec,
  });

  await prisma.chapter.create({
    data: { ...parsed, lessonId },
  });

  revalidatePath(`/admin`, "layout");
}

export async function deleteChapter(chapterId: string) {
  await requireAdmin();
  await prisma.chapter.delete({ where: { id: chapterId } });
  revalidatePath(`/admin`, "layout");
}

export async function deleteMaterial(materialId: string) {
  await requireAdmin();
  const material = await prisma.lessonMaterial.findUnique({ where: { id: materialId } });
  if (!material) return;

  if (material.fileUrl) {
    const storage = getStorageProvider();
    await storage.delete(material.fileUrl);
  }
  await prisma.lessonMaterial.delete({ where: { id: materialId } });

  revalidatePath(`/admin`, "layout");
}

export async function createMaterialNote(lessonId: string, formData: FormData) {
  await requireAdmin();

  const title = (formData.get("title") as string)?.trim();
  const content = (formData.get("content") as string)?.trim();
  if (!title || !content) return;

  await prisma.lessonMaterial.create({
    data: { lessonId, title, content },
  });

  revalidatePath(`/admin`, "layout");
}
