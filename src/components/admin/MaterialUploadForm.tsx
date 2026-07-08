"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";

export function MaterialUploadForm({ lessonId }: { lessonId: string }) {
  const router = useRouter();
  const [progress, setProgress] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setError(null);
    setProgress(0);

    const params = new URLSearchParams({ filename: file.name });

    const xhr = new XMLHttpRequest();
    xhr.open("POST", `/api/admin/lessons/${lessonId}/materials?${params.toString()}`);
    xhr.setRequestHeader("Content-Type", file.type || "application/octet-stream");

    xhr.upload.onprogress = (event) => {
      if (event.lengthComputable) {
        setProgress(Math.round((event.loaded / event.total) * 100));
      }
    };

    xhr.onload = () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        setProgress(100);
        e.target.value = "";
        router.refresh();
        setTimeout(() => setProgress(null), 1000);
      } else {
        try {
          setError(JSON.parse(xhr.responseText).error ?? "Erro ao enviar material");
        } catch {
          setError("Erro ao enviar material");
        }
        setProgress(null);
      }
    };

    xhr.onerror = () => {
      setError("Erro de conexão ao enviar o material.");
      setProgress(null);
    };

    xhr.send(file);
  }

  return (
    <div className="space-y-2">
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
    </div>
  );
}
