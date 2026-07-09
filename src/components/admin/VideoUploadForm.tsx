"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Upload } from "tus-js-client";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

function getVideoDuration(file: File): Promise<number | null> {
  return new Promise((resolve) => {
    const video = document.createElement("video");
    video.preload = "metadata";
    video.onloadedmetadata = () => {
      URL.revokeObjectURL(video.src);
      resolve(Number.isFinite(video.duration) ? Math.round(video.duration) : null);
    };
    video.onerror = () => resolve(null);
    video.src = URL.createObjectURL(file);
  });
}

const STATUS_LABELS: Record<string, string> = {
  READY: "Disponível",
  UPLOADING: "Enviando para o Bunny...",
  PROCESSING: "Processando no Bunny (pode levar alguns minutos)",
  FAILED: "Falha no processamento",
  PENDING: "Nenhum vídeo enviado",
};

export function VideoUploadForm({
  lessonId,
  currentStatus,
  currentFileName,
  provider,
}: {
  lessonId: string;
  currentStatus: string;
  currentFileName: string | null;
  provider: string;
}) {
  const router = useRouter();
  const [progress, setProgress] = useState<number | null>(null);
  const [status, setStatus] = useState(currentStatus);
  const [fileName, setFileName] = useState(currentFileName);
  const [error, setError] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isCheckingStatus, setIsCheckingStatus] = useState(false);

  function uploadLocal(file: File, durationSec: number | null) {
    const params = new URLSearchParams({ filename: file.name });
    if (durationSec) params.set("duration", String(durationSec));

    const xhr = new XMLHttpRequest();
    xhr.open("POST", `/api/admin/lessons/${lessonId}/video?${params.toString()}`);
    xhr.setRequestHeader("Content-Type", file.type || "application/octet-stream");
    xhr.timeout = 0;

    xhr.upload.onprogress = (event) => {
      if (event.lengthComputable) {
        setProgress(Math.round((event.loaded / event.total) * 100));
      }
    };

    xhr.onload = () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        setStatus("READY");
        setProgress(100);
        setFileName(file.name);
        router.refresh();
      } else {
        try {
          setError(JSON.parse(xhr.responseText).error ?? "Erro ao enviar vídeo");
        } catch {
          setError("Erro ao enviar vídeo");
        }
        setProgress(null);
      }
    };

    xhr.onerror = () => {
      setError("Erro de conexão ao enviar o vídeo. Se o arquivo for muito grande, tente novamente.");
      setProgress(null);
    };

    // Envia o arquivo direto como corpo da requisição (stream), em vez de FormData,
    // para não precisar carregar o vídeo inteiro na memória do servidor.
    xhr.send(file);
  }

  async function uploadBunny(file: File, durationSec: number | null) {
    const initRes = await fetch(`/api/admin/lessons/${lessonId}/video/init`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ fileName: file.name, fileSizeBytes: file.size }),
    });

    if (!initRes.ok) {
      const data = await initRes.json().catch(() => ({}));
      setError(data.error ?? "Erro ao iniciar upload no Bunny");
      setProgress(null);
      return;
    }

    const { uploadUrl, headers } = await initRes.json();

    const upload = new Upload(file, {
      endpoint: uploadUrl,
      retryDelays: [0, 3000, 5000, 10000],
      headers,
      metadata: { filetype: file.type, title: file.name },
      onError: () => {
        setError("Erro ao enviar o vídeo para o Bunny. Tente novamente.");
        setProgress(null);
      },
      onProgress: (bytesUploaded, bytesTotal) => {
        setProgress(Math.round((bytesUploaded / bytesTotal) * 100));
      },
      onSuccess: async () => {
        await fetch(`/api/admin/lessons/${lessonId}/video/finalize`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ durationSec }),
        });
        setStatus("PROCESSING");
        setProgress(100);
        setFileName(file.name);
        router.refresh();
      },
    });

    upload.start();
  }

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setError(null);
    setProgress(0);

    const durationSec = await getVideoDuration(file);

    if (provider === "bunny") {
      await uploadBunny(file, durationSec);
    } else {
      uploadLocal(file, durationSec);
    }

    e.target.value = "";
  }

  async function handleDelete() {
    if (!confirm("Remover permanentemente este vídeo? Essa ação não pode ser desfeita.")) return;
    setIsDeleting(true);
    await fetch(`/api/admin/lessons/${lessonId}/video`, { method: "DELETE" });
    setStatus("PENDING");
    setFileName(null);
    setProgress(null);
    setIsDeleting(false);
    router.refresh();
  }

  async function handleCheckStatus() {
    setIsCheckingStatus(true);
    const res = await fetch(`/api/admin/lessons/${lessonId}/video/status`);
    const data = await res.json().catch(() => ({}));
    if (data.status) setStatus(data.status);
    setIsCheckingStatus(false);
    router.refresh();
  }

  return (
    <div className="space-y-3">
      <p className="text-sm">
        Status atual: <span className="font-medium">{STATUS_LABELS[status] ?? status}</span>
      </p>
      <Input type="file" accept="video/*" onChange={handleFileChange} />
      {progress !== null && (
        <div className="space-y-1">
          <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
            <div className="h-full bg-primary transition-all" style={{ width: `${progress}%` }} />
          </div>
          <p className="text-xs text-muted-foreground">
            {progress < 100 ? `Enviando... ${progress}%` : "Envio concluído."}
          </p>
        </div>
      )}
      {error && <p className="text-sm text-destructive">{error}</p>}

      {provider === "bunny" && status === "PROCESSING" && (
        <Button variant="outline" size="sm" onClick={handleCheckStatus} disabled={isCheckingStatus}>
          {isCheckingStatus ? "Verificando..." : "Verificar status"}
        </Button>
      )}

      {fileName && (
        <ul className="space-y-1">
          <li className="flex items-center justify-between rounded-md border p-2">
            <span className="truncate text-sm">{fileName}</span>
            <Button variant="ghost" size="sm" onClick={handleDelete} disabled={isDeleting}>
              {isDeleting ? "Removendo..." : "Remover"}
            </Button>
          </li>
        </ul>
      )}
    </div>
  );
}
