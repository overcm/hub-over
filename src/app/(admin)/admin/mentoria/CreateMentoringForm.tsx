"use client";

import { useActionState, useEffect, useRef, useState } from "react";
import { createMentoringEventAction } from "./actions";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";

interface Student {
  id: string;
  name: string;
  email: string;
}

interface StudentGroup {
  id: string;
  title: string;
  students: Student[];
}

function StudentGroupFieldset({ group }: { group: StudentGroup }) {
  const [allChecked, setAllChecked] = useState(false);

  function syncAllChecked() {
    const boxes = document.querySelectorAll<HTMLInputElement>(`input[data-group="${group.id}"]`);
    setAllChecked(boxes.length > 0 && Array.from(boxes).every((el) => el.checked));
  }

  function toggleAll() {
    const next = !allChecked;
    document
      .querySelectorAll<HTMLInputElement>(`input[data-group="${group.id}"]`)
      .forEach((el) => {
        el.checked = next;
      });
    setAllChecked(next);
  }

  return (
    <div>
      <div className="mb-1 flex items-center justify-between px-1">
        <p className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">
          {group.title}
        </p>
        <button
          type="button"
          onClick={toggleAll}
          className="text-xs font-medium text-primary hover:underline"
        >
          {allChecked ? "Desmarcar todos" : "Selecionar todos"}
        </button>
      </div>
      <div className="space-y-1">
        {group.students.map((student) => (
          <label
            key={student.id}
            className="flex items-center gap-2 rounded-md p-1.5 text-sm hover:bg-muted"
          >
            <input
              type="checkbox"
              name="studentIds"
              value={student.id}
              data-group={group.id}
              className="h-4 w-4"
              onChange={syncAllChecked}
            />
            <span>{student.name}</span>
            <span className="text-muted-foreground">{student.email}</span>
          </label>
        ))}
      </div>
    </div>
  );
}

export function CreateMentoringForm({ groups }: { groups: StudentGroup[] }) {
  const [state, formAction, isPending] = useActionState(createMentoringEventAction, undefined);
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (state?.success) formRef.current?.reset();
  }, [state]);

  return (
    <form ref={formRef} action={formAction} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="title">Título</Label>
        <Input id="title" name="title" placeholder="Mentoria com Fulano" required />
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        <div className="space-y-2">
          <Label htmlFor="date">Data</Label>
          <Input id="date" name="date" type="date" required />
        </div>
        <div className="space-y-2">
          <Label htmlFor="startTime">Horário</Label>
          <Input id="startTime" name="startTime" type="time" required />
        </div>
        <div className="space-y-2">
          <Label htmlFor="durationMinutes">Duração (min)</Label>
          <Input
            id="durationMinutes"
            name="durationMinutes"
            type="number"
            min={15}
            step={15}
            defaultValue={60}
            required
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">Descrição (opcional)</Label>
        <Textarea id="description" name="description" rows={3} />
      </div>

      <div className="space-y-2">
        <Label>Alunos convidados</Label>
        {groups.length === 0 ? (
          <p className="text-sm text-muted-foreground">Nenhum aluno cadastrado ainda.</p>
        ) : (
          <div className="max-h-72 space-y-3 overflow-y-auto rounded-md border p-2">
            {groups.map((group) => (
              <StudentGroupFieldset key={group.id} group={group} />
            ))}
          </div>
        )}
      </div>

      {state?.error && <p className="text-sm text-destructive">{state.error}</p>}
      {state?.success && (
        <div className="space-y-1 rounded-md border border-primary/30 bg-primary/5 p-3 text-sm">
          <p className="font-medium text-primary">{state.success}</p>
          {state.meetLink && (
            <p>
              <a href={state.meetLink} target="_blank" rel="noopener noreferrer" className="underline">
                Link do Google Meet
              </a>
            </p>
          )}
          {state.htmlLink && (
            <p>
              <a href={state.htmlLink} target="_blank" rel="noopener noreferrer" className="underline">
                Ver evento na agenda
              </a>
            </p>
          )}
        </div>
      )}

      <Button type="submit" disabled={isPending}>
        {isPending ? "Criando..." : "Criar mentoria"}
      </Button>
    </form>
  );
}
