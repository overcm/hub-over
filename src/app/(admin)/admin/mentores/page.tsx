import { prisma } from "@/lib/prisma";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ConfirmSubmitButton } from "@/components/admin/ConfirmSubmitButton";
import { cn } from "@/lib/utils";
import { createSpeaker, updateSpeaker, moveSpeaker, deleteSpeaker } from "./actions";

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
    <div className="space-y-6">
      <div>
        <p className="text-xs font-semibold tracking-widest text-primary uppercase">Mentores</p>
        <h1 className="mt-1 text-3xl font-semibold tracking-tight">Prospecção de mentores</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Organize as pessoas convidadas para dar mentoria: quem está no radar, quem já foi
          contatado, quem está marcado e quem já apresentou.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {byStatus.map((column) => (
          <div key={column.status} className="space-y-3">
            <div className="flex items-center gap-2">
              <h2 className="text-sm font-semibold tracking-tight">{column.label}</h2>
              <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-muted px-1 text-xs font-medium text-muted-foreground">
                {column.speakers.length}
              </span>
            </div>

            {column.speakers.map((speaker) => (
              <Card key={speaker.id}>
                <CardContent className="space-y-2 p-3">
                  <form action={updateSpeaker.bind(null, speaker.id)} className="space-y-2">
                    <Input name="name" defaultValue={speaker.name} placeholder="Nome" required />
                    <Input
                      name="price"
                      defaultValue={speaker.price ?? ""}
                      placeholder="Preço (ex: R$ 500)"
                    />
                    <Textarea
                      name="topics"
                      defaultValue={speaker.topics ?? ""}
                      placeholder="Quais temas vai falar"
                      rows={2}
                    />
                    <Textarea
                      name="caseSummary"
                      defaultValue={speaker.caseSummary ?? ""}
                      placeholder="Case / experiência"
                      rows={2}
                    />
                    <Button type="submit" size="sm" variant="outline" className="w-full">
                      Salvar
                    </Button>
                  </form>

                  <div className="flex flex-wrap gap-1 pt-1">
                    {COLUMNS.map((target) => (
                      <form key={target.status} action={moveSpeaker.bind(null, speaker.id, target.status)}>
                        <button
                          type="submit"
                          disabled={target.status === speaker.status}
                          className={cn(
                            "rounded-full px-2 py-0.5 text-xs transition-colors",
                            target.status === speaker.status
                              ? "bg-primary text-primary-foreground"
                              : "bg-muted text-muted-foreground hover:bg-muted/70",
                          )}
                        >
                          {target.label}
                        </button>
                      </form>
                    ))}
                  </div>

                  <form action={deleteSpeaker.bind(null, speaker.id)}>
                    <ConfirmSubmitButton
                      variant="ghost"
                      size="sm"
                      className="w-full text-destructive"
                      confirmMessage={`Remover "${speaker.name}" da lista? Essa ação não pode ser desfeita.`}
                    >
                      Remover
                    </ConfirmSubmitButton>
                  </form>
                </CardContent>
              </Card>
            ))}

            {column.status === "RADAR" && (
              <Card className="border-dashed">
                <CardHeader>
                  <CardTitle className="text-sm">Adicionar pessoa</CardTitle>
                </CardHeader>
                <CardContent>
                  <form action={createSpeaker} className="space-y-2">
                    <Input name="name" placeholder="Nome" required />
                    <Input name="price" placeholder="Preço (ex: R$ 500)" />
                    <Textarea name="topics" placeholder="Quais temas vai falar" rows={2} />
                    <Textarea name="caseSummary" placeholder="Case / experiência" rows={2} />
                    <Button type="submit" size="sm" className="w-full">
                      Adicionar
                    </Button>
                  </form>
                </CardContent>
              </Card>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
