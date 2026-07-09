"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

interface Comment {
  id: string;
  content: string;
  createdAt: string;
  userId: string;
  user: { name: string };
}

export function CommentsThread({
  lessonId,
  currentUserId,
  isAdmin,
}: {
  lessonId: string;
  currentUserId: string;
  isAdmin: boolean;
}) {
  const [comments, setComments] = useState<Comment[]>([]);
  const [content, setContent] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editContent, setEditContent] = useState("");

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

  function startEdit(comment: Comment) {
    setEditingId(comment.id);
    setEditContent(comment.content);
  }

  function cancelEdit() {
    setEditingId(null);
    setEditContent("");
  }

  async function saveEdit(commentId: string) {
    if (!editContent.trim()) return;
    const res = await fetch(`/api/lessons/${lessonId}/comments/${commentId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ content: editContent }),
    });
    const data = await res.json();
    setComments((prev) => prev.map((c) => (c.id === commentId ? data.comment : c)));
    cancelEdit();
  }

  async function deleteComment(commentId: string) {
    if (!confirm("Excluir este comentário?")) return;
    await fetch(`/api/lessons/${lessonId}/comments/${commentId}`, { method: "DELETE" });
    setComments((prev) => prev.filter((c) => c.id !== commentId));
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
        {comments.map((comment) => {
          const canEdit = comment.userId === currentUserId;
          const canDelete = canEdit || isAdmin;

          return editingId === comment.id ? (
            <div key={comment.id} className="space-y-2 rounded-md border p-3">
              <Textarea
                value={editContent}
                onChange={(e) => setEditContent(e.target.value)}
                rows={3}
              />
              <div className="flex justify-end gap-2">
                <Button type="button" variant="ghost" size="sm" onClick={cancelEdit}>
                  Cancelar
                </Button>
                <Button type="button" size="sm" onClick={() => saveEdit(comment.id)}>
                  Salvar
                </Button>
              </div>
            </div>
          ) : (
            <div key={comment.id} className="rounded-md border p-3">
              <p className="text-xs font-medium text-muted-foreground">{comment.user.name}</p>
              <p className="text-sm whitespace-pre-wrap">{comment.content}</p>
              {(canEdit || canDelete) && (
                <div className="mt-1 flex justify-end gap-3">
                  {canEdit && (
                    <button
                      onClick={() => startEdit(comment)}
                      className="text-xs text-muted-foreground hover:underline"
                    >
                      Editar
                    </button>
                  )}
                  {canDelete && (
                    <button
                      onClick={() => deleteComment(comment.id)}
                      className="text-xs text-destructive hover:underline"
                    >
                      Excluir
                    </button>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
