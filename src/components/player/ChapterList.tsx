"use client";

import type { PlayerChapter } from "./VideoPlayer";
import { formatDuration } from "@/lib/utils";

export function ChapterList({
  chapters,
  currentTime,
  onSelect,
}: {
  chapters: PlayerChapter[];
  currentTime: number;
  onSelect: (seconds: number) => void;
}) {
  if (chapters.length === 0) return null;

  return (
    <div className="max-h-[168px] space-y-1 overflow-y-auto">
      {chapters.map((chapter) => {
        const isActive = currentTime >= chapter.startSec && (chapter.endSec == null || currentTime < chapter.endSec);
        return (
          <button
            key={chapter.id}
            onClick={() => onSelect(chapter.startSec)}
            className={`flex w-full items-center gap-3 rounded-md px-3 py-2 text-left text-sm hover:bg-muted ${
              isActive ? "bg-muted font-medium" : ""
            }`}
          >
            <span className="tabular-nums text-muted-foreground">{formatDuration(chapter.startSec)}</span>
            <span>{chapter.title}</span>
          </button>
        );
      })}
    </div>
  );
}
