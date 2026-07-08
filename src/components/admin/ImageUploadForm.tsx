"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { ImageIcon, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { focalPointToObjectPosition } from "@/lib/focal-point";

export function ImageUploadForm({
  uploadUrl,
  currentUrl,
  currentFocalPoint,
  label,
  aspectClassName = "aspect-video",
}: {
  uploadUrl: string;
  currentUrl: string | null;
  currentFocalPoint?: { x: number | null; y: number | null } | null;
  label: string;
  aspectClassName?: string;
}) {
  const router = useRouter();
  const containerRef = useRef<HTMLDivElement>(null);
  const [preview, setPreview] = useState<string | null>(currentUrl);
  const [focalPoint, setFocalPoint] = useState(currentFocalPoint ?? null);
  const [uploading, setUploading] = useState(false);
  const [savingFocalPoint, setSavingFocalPoint] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const isDragging = useRef(false);

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setError(null);
    setUploading(true);
    setPreview(URL.createObjectURL(file));
    setFocalPoint(null);

    const params = new URLSearchParams({ filename: file.name });

    const xhr = new XMLHttpRequest();
    xhr.open("POST", `${uploadUrl}?${params.toString()}`);
    xhr.setRequestHeader("Content-Type", file.type || "application/octet-stream");

    xhr.onload = () => {
      setUploading(false);
      if (xhr.status >= 200 && xhr.status < 300) {
        try {
          const data = JSON.parse(xhr.responseText);
          if (data.focalPoint) setFocalPoint(data.focalPoint);
        } catch {
          // ignora — apenas não teremos o ponto focal até o próximo refresh
        }
        e.target.value = "";
        router.refresh();
      } else {
        try {
          setError(JSON.parse(xhr.responseText).error ?? "Erro ao enviar imagem");
        } catch {
          setError("Erro ao enviar imagem");
        }
        setPreview(currentUrl);
      }
    };

    xhr.onerror = () => {
      setUploading(false);
      setError("Erro de conexão ao enviar a imagem.");
      setPreview(currentUrl);
    };

    xhr.send(file);
  }

  async function handleRemove() {
    setUploading(true);
    await fetch(uploadUrl, { method: "DELETE" });
    setPreview(null);
    setFocalPoint(null);
    setUploading(false);
    router.refresh();
  }

  function focalPointFromEvent(clientX: number, clientY: number) {
    const rect = containerRef.current?.getBoundingClientRect();
    if (!rect) return null;
    const x = Math.min(1, Math.max(0, (clientX - rect.left) / rect.width));
    const y = Math.min(1, Math.max(0, (clientY - rect.top) / rect.height));
    return { x, y };
  }

  async function commitFocalPoint(point: { x: number; y: number }) {
    setSavingFocalPoint(true);
    try {
      const res = await fetch(uploadUrl, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(point),
      });
      if (res.ok) router.refresh();
    } finally {
      setSavingFocalPoint(false);
    }
  }

  function handlePointerDown(e: React.PointerEvent<HTMLDivElement>) {
    if (!preview) return;
    isDragging.current = true;
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
    const point = focalPointFromEvent(e.clientX, e.clientY);
    if (point) setFocalPoint(point);
  }

  function handlePointerMove(e: React.PointerEvent<HTMLDivElement>) {
    if (!isDragging.current) return;
    const point = focalPointFromEvent(e.clientX, e.clientY);
    if (point) setFocalPoint(point);
  }

  function handlePointerUp(e: React.PointerEvent<HTMLDivElement>) {
    if (!isDragging.current) return;
    isDragging.current = false;
    const point = focalPointFromEvent(e.clientX, e.clientY);
    if (point) commitFocalPoint(point);
  }

  return (
    <div className="space-y-3">
      <div
        ref={containerRef}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        className={`relative flex ${aspectClassName} w-full max-w-sm items-center justify-center overflow-hidden rounded-lg border border-border bg-muted ${
          preview ? "cursor-crosshair touch-none select-none" : ""
        }`}
      >
        {preview ? (
          <>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={preview}
              alt={label}
              draggable={false}
              style={{ objectPosition: focalPointToObjectPosition(focalPoint?.x, focalPoint?.y) }}
              className="h-full w-full object-cover"
            />
            <div
              className="pointer-events-none absolute h-5 w-5 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-white bg-primary/80 shadow"
              style={{
                left: `${((focalPoint?.x ?? 0.5) * 100).toFixed(2)}%`,
                top: `${((focalPoint?.y ?? 0.5) * 100).toFixed(2)}%`,
              }}
            />
          </>
        ) : (
          <ImageIcon className="text-muted-foreground/40" size={32} />
        )}
        {preview && !uploading && (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={handleRemove}
            className="absolute top-2 right-2 h-7 w-7 rounded-full bg-black/60 p-0 text-white hover:bg-black/80"
          >
            <X size={14} />
          </Button>
        )}
      </div>
      <Input type="file" accept="image/*" onChange={handleFileChange} disabled={uploading} />
      {uploading && <p className="text-xs text-muted-foreground">Enviando imagem...</p>}
      {error && <p className="text-sm text-destructive">{error}</p>}
      {preview && (
        <p className="text-xs text-muted-foreground">
          Clique ou arraste na imagem para escolher o ponto que deve ficar visível nas miniaturas.
          {savingFocalPoint && " Salvando..."}
        </p>
      )}
    </div>
  );
}
