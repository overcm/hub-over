"use client";

import { createContext, useContext, useRef, useState } from "react";
import { VideoPlayer, type VideoPlayerHandle, type PlayerChapter } from "@/components/player/VideoPlayer";
import { ChapterList } from "@/components/player/ChapterList";
import { useVideoProgress } from "@/components/player/useVideoProgress";

interface LessonPlayerContextValue {
  seekTo: (seconds: number) => void;
  currentTime: number;
}

const LessonPlayerContext = createContext<LessonPlayerContextValue>({
  seekTo: () => {},
  currentTime: 0,
});

export function useLessonPlayer() {
  return useContext(LessonPlayerContext);
}

export function LessonPlayerSection({
  lessonId,
  src,
  type,
  poster,
  chapters,
  initialPositionSec,
  heatmap,
}: {
  lessonId: string;
  src: string;
  type: "hls" | "mp4";
  poster?: string;
  chapters: PlayerChapter[];
  initialPositionSec?: number;
  heatmap?: number[];
}) {
  const playerRef = useRef<VideoPlayerHandle>(null);
  const [currentTime, setCurrentTime] = useState(0);
  const reportProgress = useVideoProgress(lessonId);

  function seekTo(seconds: number) {
    playerRef.current?.seekTo(seconds);
  }

  return (
    <LessonPlayerContext.Provider value={{ seekTo, currentTime }}>
      <div className={chapters.length > 0 ? "grid grid-cols-1 gap-4 lg:grid-cols-3" : undefined}>
        <div className={chapters.length > 0 ? "lg:col-span-2" : undefined}>
          <VideoPlayer
            ref={playerRef}
            src={src}
            type={type}
            poster={poster}
            chapters={chapters}
            initialPositionSec={initialPositionSec}
            heatmap={heatmap}
            onTimeUpdate={(time, duration) => {
              setCurrentTime(time);
              reportProgress(time, duration);
            }}
          />
        </div>
        {chapters.length > 0 && (
          <div className="self-start rounded-lg border p-2 lg:sticky lg:top-4">
            <p className="mb-2 px-1 text-sm font-medium">Capítulos</p>
            <ChapterList chapters={chapters} currentTime={currentTime} onSelect={seekTo} />
          </div>
        )}
      </div>
    </LessonPlayerContext.Provider>
  );
}
