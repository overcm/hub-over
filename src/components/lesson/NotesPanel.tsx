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
  const { seekTo, currentTime } = useLessonPlayer();
  const [notes, setNotes] = useState<Note[]>([]);
  const [content, setContent] = useState("");
  const [attachTimestamp, setAttachTimestamp] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

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
      body: JSON.stringify({
        content,
        timestampSec: attachTimestamp ? Math.floor(currentTime) : undefined,
      }),
    });
    const data = await res.json();
    setNotes((prev) => [...prev, data.note]);
    setContent("");
    setIsSaving(false);
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
        <div className="flex items-center justify-between">
          <label className="flex items-center gap-2 text-sm text-muted-foreground">
            <input
              type="checkbox"
              checked={attachTimestamp}
              onChange={(e) => setAttachTimestamp(e.target.checked)}
            />
            Vincular ao momento atual ({formatTime(currentTime)})
          </label>
          <Button type="submit" size="sm" disabled={isSaving}>
            Salvar
          </Button>
        </div>
      </form>

      <div className="space-y-2">
        {notes.map((note) => (
          <div key={note.id} className="rounded-md border p-2">
            <div className="flex items-center gap-2">
              {note.timestampSec != null && (
                <button
                  onClick={() => seekTo(note.timestampSec!)}
                  className="text-xs font-medium text-primary hover:underline"
                >
                  {formatTime(note.timestampSec)}
                </button>
              )}
            </div>
            <p className="text-sm">{note.content}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
