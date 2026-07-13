import { Search } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { SpeakerListItem } from "@/components/admin/SpeakerListItem";
import { AddSpeakerButton } from "@/components/admin/AddSpeakerButton";

type SpeakerStatus = "RADAR" | "CONTACTED" | "SCHEDULED" | "DONE";

const COLUMNS: { status: SpeakerStatus; label: string }[] = [
  { status: "SCHEDULED", label: "Marcado" },
  { status: "RADAR", label: "No radar" },
  { status: "CONTACTED", label: "Conversei / tenho orçamento" },
  { status: "DONE", label: "Já deu a mentoria" },
];

export default async function AdminSpeakersPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const { q } = await searchParams;

  const speakers = await prisma.guestSpeaker.findMany({
    where: q ? { name: { contains: q, mode: "insensitive" } } : undefined,
    orderBy: [{ order: "asc" }, { createdAt: "asc" }],
  });

  const byStatus = COLUMNS.map((column) => ({
    ...column,
    speakers: speakers.filter((s) => s.status === column.status),
  }));

  return (
    <div className="max-w-2xl space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-xs font-semibold tracking-widest text-primary uppercase">Mentores</p>
          <h1 className="mt-1 text-3xl font-semibold tracking-tight">Prospecção de mentores</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Clique no nome de uma pessoa para ver e editar preço, temas, case e mover entre etapas.
          </p>
        </div>
        <AddSpeakerButton />
      </div>

      <form className="relative">
        <Search
          size={16}
          className="pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 text-muted-foreground"
        />
        <Input name="q" defaultValue={q ?? ""} placeholder="Buscar pelo nome..." className="pl-9" />
      </form>

      {byStatus.map((column) => (
        <Card key={column.status}>
          <CardHeader className="flex flex-row items-center gap-2">
            <CardTitle className="text-base">{column.label}</CardTitle>
            <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-muted px-1 text-xs font-medium text-muted-foreground">
              {column.speakers.length}
            </span>
          </CardHeader>
          <CardContent className="space-y-2">
            {column.speakers.length === 0 ? (
              <p className="text-sm text-muted-foreground">Nenhuma pessoa aqui ainda.</p>
            ) : (
              column.speakers.map((speaker) => (
                <SpeakerListItem key={speaker.id} speaker={speaker} />
              ))
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
