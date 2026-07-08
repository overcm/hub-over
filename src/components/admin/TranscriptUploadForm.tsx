"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { FileText } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export function TranscriptUploadForm({
  lessonId,
  currentFileName,
}: {
  lessonId: string;
  currentFileName: string | null;
}) {
  const router = useRouter();
  const [progress, setProgress] = useState<number | null>(null);
  const [fileName, setFileName] = useState(currentFileName);
  const [error, setError] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setError(null);
    setProgress(0);

    const params = new URLSearchParams({ filename: file.name });

    const xhr = new XMLHttpRequest();
    xhr.open("POST", `/api/admin/lessons/${lessonId}/transcript?${params.toString()}`);
    xhr.setRequestHeader("Content-Type", file.type || "application/octet-stream");

    xhr.upload.onprogress = (event) => {
      if (event.lengthComputable) {
        setProgress(Math.round((event.loaded / event.total) * 100));
      }
    };

    xhr.onload = () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        setProgress(100);
        setFileName(file.name);
        e.target.value = "";
        router.refresh();
        setTimeout(() => setProgress(null), 1000);
      } else {
        try {
          setError(JSON.parse(xhr.responseText).error ?? "Erro ao enviar transcrição");
        } catch {
          setError("Erro ao enviar transcrição");
        }
        setProgress(null);
      }
    };

    xhr.onerror = () => {
      setError("Erro de conexão ao enviar a transcrição.");
      setProgress(null);
    };

    xhr.send(file);
  }

  async function handleDelete() {
    setIsDeleting(true);
    await fetch(`/api/admin/lessons/${lessonId}/transcript`, { method: "DELETE" });
    setFileName(null);
    setIsDeleting(false);
    router.refresh();
  }

  return (
    <div className="space-y-3">
      <Input type="file" onChange={handleFileChange} disabled={progress !== null && progress < 100} />
      {progress !== null && (
        <div className="space-y-1">
          <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
            <div className="h-full bg-primary transition-all" style={{ width: `${progress}%` }} />
          </div>
          <p className="text-xs text-muted-foreground">
            {progress < 100 ? `Enviando... ${progress}%` : "Enviado."}
          </p>
        </div>
      )}
      {error && <p className="text-sm text-destructive">{error}</p>}

      {fileName && (
        <div className="flex items-center justify-between rounded-md border p-2">
          <span className="flex min-w-0 items-center gap-2 truncate text-sm">
            <FileText size={16} className="shrink-0 text-muted-foreground" />
            <span className="truncate">{fileName}</span>
          </span>
          <Button variant="ghost" size="sm" onClick={handleDelete} disabled={isDeleting}>
            {isDeleting ? "Removendo..." : "Remover"}
          </Button>
        </div>
      )}
    </div>
  );
}
