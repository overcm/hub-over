"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useLessonPlayer } from "./LessonPlayerContext";

interface Note {
  id: string;
  content: string;
  timestampSec: number | null;
}

function formatTime(seconds: number) {
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${s.toString().padStart(2, "0")}`;
}

export function NotesPanel({ lessonId }: { lessonId: string }) {
  const { seekTo } = useLessonPlayer();
  const [notes, setNotes] = useState<Note[]>([]);
  const [content, setContent] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editContent, setEditContent] = useState("");

  useEffect(() => {
    fetch(`/api/lessons/${lessonId}/notes`)
      .then((r) => r.json())
      .then((data) => setNotes(data.notes ?? []));
  }, [lessonId]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!content.trim()) return;

    setIsSaving(true);
    const res = await fetch(`/api/lessons/${lessonId}/notes`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ content }),
    });
    const data = await res.json();
    setNotes((prev) => [...prev, data.note]);
    setContent("");
    setIsSaving(false);
  }

  function startEdit(note: Note) {
    setEditingId(note.id);
    setEditContent(note.content);
  }

  function cancelEdit() {
    setEditingId(null);
    setEditContent("");
  }

  async function saveEdit(noteId: string) {
    if (!editContent.trim()) return;
    const res = await fetch(`/api/lessons/${lessonId}/notes/${noteId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ content: editContent }),
    });
    const data = await res.json();
    setNotes((prev) => prev.map((n) => (n.id === noteId ? data.note : n)));
    cancelEdit();
  }

  async function deleteNote(noteId: string) {
    if (!confirm("Excluir esta anotação?")) return;
    await fetch(`/api/lessons/${lessonId}/notes/${noteId}`, { method: "DELETE" });
    setNotes((prev) => prev.filter((n) => n.id !== noteId));
  }

  return (
    <div className="space-y-4">
      <form onSubmit={handleSubmit} className="space-y-2">
        <Textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Escreva uma anotação..."
          rows={3}
        />
        <div className="flex justify-end">
          <Button type="submit" size="sm" disabled={isSaving}>
            Salvar
          </Button>
        </div>
      </form>

      <div className="space-y-2">
        {notes.map((note) =>
          editingId === note.id ? (
            <div key={note.id} className="space-y-2 rounded-md border p-2">
              <Textarea
                value={editContent}
                onChange={(e) => setEditContent(e.target.value)}
                rows={3}
              />
              <div className="flex justify-end gap-2">
                <Button type="button" variant="ghost" size="sm" onClick={cancelEdit}>
                  Cancelar
                </Button>
                <Button type="button" size="sm" onClick={() => saveEdit(note.id)}>
                  Salvar
                </Button>
              </div>
            </div>
          ) : (
            <div key={note.id} className="rounded-md border p-2">
              {note.timestampSec != null && (
                <button
                  onClick={() => seekTo(note.timestampSec!)}
                  className="mb-1 text-xs font-medium text-primary hover:underline"
                >
                  {formatTime(note.timestampSec)}
                </button>
              )}
              <p className="text-sm whitespace-pre-wrap">{note.content}</p>
              <div className="mt-1 flex justify-end gap-3">
                <button
                  onClick={() => startEdit(note)}
                  className="text-xs text-muted-foreground hover:underline"
                >
                  Editar
                </button>
                <button
                  onClick={() => deleteNote(note.id)}
                  className="text-xs text-destructive hover:underline"
                >
                  Excluir
                </button>
              </div>
            </div>
          ),
        )}
      </div>
    </div>
  );
}
