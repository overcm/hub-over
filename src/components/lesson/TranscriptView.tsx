import { Download, FileText } from "lucide-react";

export function TranscriptView({
  transcriptFileUrl,
  transcriptFileName,
}: {
  transcriptFileUrl: string | null;
  transcriptFileName: string | null;
}) {
  if (!transcriptFileUrl) {
    return <p className="text-sm text-muted-foreground">Transcrição ainda não disponível.</p>;
  }

  return (
    <a
      href={transcriptFileUrl}
      download={transcriptFileName ?? undefined}
      className="flex items-center justify-between gap-3 rounded-md border p-4 transition-colors hover:bg-muted"
    >
      <span className="flex min-w-0 items-center gap-3">
        <FileText size={20} className="shrink-0 text-muted-foreground" />
        <span className="min-w-0">
          <span className="block truncate text-sm font-medium">
            {transcriptFileName ?? "Transcrição"}
          </span>
          <span className="text-xs text-muted-foreground">Clique para baixar</span>
        </span>
      </span>
      <Download size={18} className="shrink-0 text-muted-foreground" />
    </a>
  );
}
