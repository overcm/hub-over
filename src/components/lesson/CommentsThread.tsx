"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

interface Comment {
  id: string;
  content: string;
  createdAt: string;
  user: { name: string };
}

export function CommentsThread({ lessonId }: { lessonId: string }) {
  const [comments, setComments] = useState<Comment[]>([]);
  const [content, setContent] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    fetch(`/api/lessons/${lessonId}/comments`)
      .then((r) => r.json())
      .then((data) => setComments(data.comments ?? []));
  }, [lessonId]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!content.trim()) return;

    setIsSaving(true);
    const res = await fetch(`/api/lessons/${lessonId}/comments`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ content }),
    });
    const data = await res.json();
    setComments((prev) => [...prev, data.comment]);
    setContent("");
    setIsSaving(false);
  }

  return (
    <div className="space-y-4">
      <form onSubmit={handleSubmit} className="space-y-2">
        <Textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Escreva um comentário..."
          rows={3}
        />
        <Button type="submit" size="sm" disabled={isSaving}>
          Comentar
        </Button>
      </form>

      <div className="space-y-3">
        {comments.map((comment) => (
          <div key={comment.id} className="rounded-md border p-3">
            <p className="text-xs font-medium text-muted-foreground">{comment.user.name}</p>
            <p className="text-sm">{comment.content}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
