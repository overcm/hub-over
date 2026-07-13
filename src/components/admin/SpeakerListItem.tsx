"use client";

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { ConfirmSubmitButton } from "./ConfirmSubmitButton";
import { cn } from "@/lib/utils";
import { updateSpeaker, moveSpeaker, deleteSpeaker } from "@/app/(admin)/admin/mentores/actions";

type SpeakerStatus = "RADAR" | "CONTACTED" | "SCHEDULED" | "DONE";

const COLUMNS: { status: SpeakerStatus; label: string }[] = [
  { status: "RADAR", label: "No radar" },
  { status: "CONTACTED", label: "Conversei / tenho orçamento" },
  { status: "SCHEDULED", label: "Marcado" },
  { status: "DONE", label: "Já deu a mentoria" },
];

interface Speaker {
  id: string;
  name: string;
  price: string | null;
  topics: string | null;
  caseSummary: string | null;
  status: SpeakerStatus;
}

export function SpeakerListItem({ speaker }: { speaker: Speaker }) {
  return (
    <Dialog>
      <DialogTrigger
        render={
          <button className="w-full rounded-md border px-3 py-2 text-left text-sm hover:bg-muted" />
        }
      >
        {speaker.name}
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{speaker.name}</DialogTitle>
        </DialogHeader>

        <form action={updateSpeaker.bind(null, speaker.id)} className="space-y-2">
          <Input name="name" defaultValue={speaker.name} placeholder="Nome" required />
          <Input name="price" defaultValue={speaker.price ?? ""} placeholder="Preço (ex: R$ 500)" />
          <Textarea
            name="topics"
            defaultValue={speaker.topics ?? ""}
            placeholder="Quais temas vai falar"
            rows={3}
          />
          <Textarea
            name="caseSummary"
            defaultValue={speaker.caseSummary ?? ""}
            placeholder="Case / experiência"
            rows={3}
          />
          <Button type="submit" size="sm" variant="outline" className="w-full">
            Salvar
          </Button>
        </form>

        <div>
          <p className="mb-1.5 text-xs text-muted-foreground">Mover para:</p>
          <div className="flex flex-wrap gap-1">
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
      </DialogContent>
    </Dialog>
  );
}
