"use client";

import { useState } from "react";
import type { PlayerChapter } from "./VideoPlayer";

interface ChapterMarkersProps {
  chapters: PlayerChapter[];
  duration: number;
  currentTime: number;
  heatmap?: number[];
  onSeek: (e: React.MouseEvent<HTMLDivElement>) => void;
}

const HEATMAP_WIDTH = 300;
const HEATMAP_HEIGHT = 28;

function buildSmoothPath(values: number[]) {
  const n = values.length;
  if (n === 0) return { line: "", area: "" };

  const points = values.map((v, i) => ({
    x: ((i + 0.5) / n) * HEATMAP_WIDTH,
    y: HEATMAP_HEIGHT - v * (HEATMAP_HEIGHT - 2) - 1,
  }));

  let line = `M ${points[0].x},${points[0].y}`;
  for (let i = 0; i < points.length - 1; i++) {
    const p0 = points[i];
    const p1 = points[i + 1];
    const midX = (p0.x + p1.x) / 2;
    const midY = (p0.y + p1.y) / 2;
    line += ` Q ${p0.x},${p0.y} ${midX},${midY}`;
  }
  const last = points[points.length - 1];
  line += ` L ${last.x},${last.y}`;

  const area = `${line} L ${HEATMAP_WIDTH},${HEATMAP_HEIGHT} L 0,${HEATMAP_HEIGHT} Z`;

  return { line, area };
}

export function ChapterMarkers({
  chapters,
  duration,
  currentTime,
  heatmap,
  onSeek,
}: ChapterMarkersProps) {
  const [hoveredChapter, setHoveredChapter] = useState<PlayerChapter | null>(null);
  const [hoverX, setHoverX] = useState(0);

  function handleMouseMove(e: React.MouseEvent<HTMLDivElement>) {
    if (!duration) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const ratio = (e.clientX - rect.left) / rect.width;
    const time = ratio * duration;
    setHoverX(e.clientX - rect.left);

    const chapter = chapters.find(
      (c) => time >= c.startSec && (c.endSec == null || time < c.endSec),
    );
    setHoveredChapter(chapter ?? null);
  }

  const progressRatio = duration ? currentTime / duration : 0;
  const hasHeatmap = heatmap && heatmap.some((v) => v > 0);
  const { line, area } = hasHeatmap ? buildSmoothPath(heatmap!) : { line: "", area: "" };

  return (
    <div className="group/scrubber relative">
      {hasHeatmap && (
        <div
          className="pointer-events-none absolute inset-x-0 bottom-full mb-0.5 h-6 opacity-0 transition-opacity duration-150 group-hover/scrubber:opacity-100"
        >
          <svg
            viewBox={`0 0 ${HEATMAP_WIDTH} ${HEATMAP_HEIGHT}`}
            preserveAspectRatio="none"
            className="pointer-events-none h-full w-full"
          >
            <path d={area} className="fill-white/20" />
            <path
              d={line}
              fill="none"
              className="stroke-primary"
              strokeWidth={2}
              vectorEffect="non-scaling-stroke"
            />
          </svg>
        </div>
      )}

      <div
        className="relative h-3 cursor-pointer"
        onMouseMove={handleMouseMove}
        onMouseLeave={() => setHoveredChapter(null)}
        onClick={onSeek}
      >
        {hoveredChapter && (
          <div
            className="absolute -top-8 -translate-x-1/2 rounded-md bg-black/80 px-2 py-1 text-xs whitespace-nowrap text-white shadow"
            style={{ left: hoverX }}
          >
            {hoveredChapter.title}
          </div>
        )}

        <div className="absolute top-1/2 h-1.5 w-full -translate-y-1/2 rounded-full bg-white/25">
          <div
            className="h-full rounded-full bg-primary"
            style={{ width: `${progressRatio * 100}%` }}
          />
        </div>

        {duration > 0 &&
          chapters.map((chapter) => (
            <div
              key={chapter.id}
              className="absolute top-1/2 h-2.5 w-0.5 -translate-y-1/2 bg-white/70"
              style={{ left: `${(chapter.startSec / duration) * 100}%` }}
            />
          ))}
      </div>
    </div>
  );
}
