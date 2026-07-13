import { prisma } from "@/lib/prisma";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { SpeakerListItem } from "@/components/admin/SpeakerListItem";
import { createSpeaker } from "./actions";

type SpeakerStatus = "RADAR" | "CONTACTED" | "SCHEDULED" | "DONE";

const COLUMNS: { status: SpeakerStatus; label: string }[] = [
  { status: "RADAR", label: "No radar" },
  { status: "CONTACTED", label: "Conversei / tenho orçamento" },
  { status: "SCHEDULED", label: "Marcado" },
  { status: "DONE", label: "Já deu a mentoria" },
];

export default async function AdminSpeakersPage() {
  const speakers = await prisma.guestSpeaker.findMany({
    orderBy: [{ order: "asc" }, { createdAt: "asc" }],
  });

  const byStatus = COLUMNS.map((column) => ({
    ...column,
    speakers: speakers.filter((s) => s.status === column.status),
  }));

  return (
    <div className="max-w-2xl space-y-6">
      <div>
        <p className="text-xs font-semibold tracking-widest text-primary uppercase">Mentores</p>
        <h1 className="mt-1 text-3xl font-semibold tracking-tight">Prospecção de mentores</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Clique no nome de uma pessoa para ver e editar preço, temas, case e mover entre etapas.
        </p>
      </div>

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

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Adicionar pessoa</CardTitle>
        </CardHeader>
        <CardContent>
          <form action={createSpeaker} className="space-y-2">
            <Input name="name" placeholder="Nome" required />
            <Input name="price" placeholder="Preço (ex: R$ 500)" />
            <Textarea name="topics" placeholder="Quais temas vai falar" rows={2} />
            <Textarea name="caseSummary" placeholder="Case / experiência" rows={2} />
            <Button type="submit" className="w-full">
              Adicionar
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
