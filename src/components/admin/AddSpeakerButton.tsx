"use client";

import { Plus } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { createSpeaker } from "@/app/(admin)/admin/mentores/actions";

type SpeakerStatus = "RADAR" | "CONTACTED" | "SCHEDULED" | "DONE";

const COLUMNS: { status: SpeakerStatus; label: string }[] = [
  { status: "SCHEDULED", label: "Marcado" },
  { status: "RADAR", label: "No radar" },
  { status: "CONTACTED", label: "Conversei / tenho orçamento" },
  { status: "DONE", label: "Já deu a mentoria" },
];

export function AddSpeakerButton() {
  return (
    <Dialog>
      <DialogTrigger render={<Button className="flex items-center gap-1.5" />}>
        <Plus size={16} />
        Adicionar pessoa
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Adicionar pessoa</DialogTitle>
        </DialogHeader>

        <form action={createSpeaker} className="space-y-2">
          <Input name="name" placeholder="Nome" required />
          <select
            name="status"
            defaultValue="RADAR"
            className="flex h-8 w-full rounded-md border border-input bg-background px-3 text-sm"
          >
            {COLUMNS.map((column) => (
              <option key={column.status} value={column.status}>
                {column.label}
              </option>
            ))}
          </select>
          <Input name="price" placeholder="Preço (ex: R$ 500)" />
          <Textarea name="topics" placeholder="Quais temas vai falar" rows={2} />
          <Textarea name="caseSummary" placeholder="Case / experiência" rows={2} />
          <Button type="submit" className="w-full">
            Adicionar
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
