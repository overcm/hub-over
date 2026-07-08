"use client";

import {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
} from "react";
import { Play, Pause, Maximize, Minimize, RotateCcw, RotateCw } from "lucide-react";
import { ChapterMarkers } from "./ChapterMarkers";
import { cn, formatDuration } from "@/lib/utils";

export interface VideoPlayerHandle {
  seekTo: (seconds: number) => void;
}

export interface PlayerChapter {
  id: string;
  title: string;
  startSec: number;
  endSec: number | null;
}

interface VideoPlayerProps {
  src: string;
  type: "hls" | "mp4";
  poster?: string;
  chapters: PlayerChapter[];
  initialPositionSec?: number;
  heatmap?: number[];
  onTimeUpdate?: (currentTime: number, duration: number) => void;
}

const CONTROLS_HIDE_DELAY = 2500;

export const VideoPlayer = forwardRef<VideoPlayerHandle, VideoPlayerProps>(function VideoPlayer(
  { src, type, poster, chapters, initialPositionSec, heatmap, onTimeUpdate },
  ref,
) {
  const containerRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const hideTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [playing, setPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [controlsVisible, setControlsVisible] = useState(true);

  useImperativeHandle(ref, () => ({
    seekTo: (seconds: number) => {
      if (videoRef.current) {
        videoRef.current.currentTime = seconds;
        videoRef.current.play().catch(() => {});
      }
    },
  }));

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    let hlsInstance: import("hls.js").default | undefined;

    if (type === "hls" && !video.canPlayType("application/vnd.apple.mpegurl")) {
      import("hls.js").then(({ default: Hls }) => {
        if (Hls.isSupported()) {
          hlsInstance = new Hls();
          hlsInstance.loadSource(src);
          hlsInstance.attachMedia(video);
        }
      });
    } else {
      video.src = src;
    }

    return () => {
      hlsInstance?.destroy();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [src, type]);

  useEffect(() => {
    const video = videoRef.current;
    if (!video || !initialPositionSec) return;
    const handleLoaded = () => {
      video.currentTime = initialPositionSec;
    };
    video.addEventListener("loadedmetadata", handleLoaded);
    return () => video.removeEventListener("loadedmetadata", handleLoaded);
  }, [initialPositionSec]);

  useEffect(() => {
    function handleFullscreenChange() {
      setIsFullscreen(document.fullscreenElement === containerRef.current);
    }
    document.addEventListener("fullscreenchange", handleFullscreenChange);
    return () => document.removeEventListener("fullscreenchange", handleFullscreenChange);
  }, []);

  useEffect(() => {
    return () => {
      if (hideTimerRef.current) clearTimeout(hideTimerRef.current);
    };
  }, []);

  function scheduleHide() {
    if (hideTimerRef.current) clearTimeout(hideTimerRef.current);
    hideTimerRef.current = setTimeout(() => {
      // Lê o estado real do <video> no momento em que o timer dispara,
      // em vez de depender do valor de `playing` capturado quando o timer foi criado.
      if (videoRef.current && !videoRef.current.paused) {
        setControlsVisible(false);
      }
    }, CONTROLS_HIDE_DELAY);
  }

  function handleActivity() {
    setControlsVisible(true);
    scheduleHide();
  }

  function handleTimeUpdate() {
    const video = videoRef.current;
    if (!video) return;
    setCurrentTime(video.currentTime);
    setDuration(video.duration);
    onTimeUpdate?.(video.currentTime, video.duration);
  }

  function togglePlay() {
    const video = videoRef.current;
    if (!video) return;
    if (video.paused) {
      video.play();
      setPlaying(true);
    } else {
      video.pause();
      setPlaying(false);
      setControlsVisible(true);
    }
    handleActivity();
  }

  function skip(deltaSec: number) {
    const video = videoRef.current;
    if (!video) return;
    video.currentTime = Math.min(Math.max(video.currentTime + deltaSec, 0), duration || Infinity);
    handleActivity();
  }

  function handleSeek(e: React.MouseEvent<HTMLDivElement>) {
    const video = videoRef.current;
    if (!video || !duration) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const ratio = (e.clientX - rect.left) / rect.width;
    video.currentTime = ratio * duration;
  }

  function handleFullscreen() {
    if (document.fullscreenElement) {
      document.exitFullscreen();
    } else {
      containerRef.current?.requestFullscreen?.();
    }
  }

  return (
    <div
      ref={containerRef}
      className={cn(
        "group relative flex items-center justify-center overflow-hidden rounded-lg bg-black",
        isFullscreen && "h-full",
      )}
      onMouseMove={handleActivity}
      onMouseLeave={() => playing && setControlsVisible(false)}
    >
      <video
        ref={videoRef}
        poster={poster}
        className={cn(isFullscreen ? "h-full w-full object-contain" : "aspect-video w-full")}
        onTimeUpdate={handleTimeUpdate}
        onPlay={() => setPlaying(true)}
        onPause={() => {
          setPlaying(false);
          setControlsVisible(true);
        }}
        onClick={togglePlay}
      />

      <div
        className={cn(
          "absolute inset-x-0 bottom-0 flex flex-col gap-2 bg-gradient-to-t from-black/85 via-black/40 to-transparent px-3 pt-10 pb-3 transition-opacity duration-300",
          controlsVisible ? "opacity-100" : "pointer-events-none opacity-0",
        )}
      >
        <ChapterMarkers
          chapters={chapters}
          duration={duration}
          currentTime={currentTime}
          heatmap={heatmap}
          onSeek={handleSeek}
        />

        <div className="flex items-center gap-3 text-white">
          <button onClick={() => skip(-10)} aria-label="Voltar 10 segundos">
            <RotateCcw size={16} />
          </button>
          <button onClick={togglePlay} aria-label={playing ? "Pausar" : "Reproduzir"}>
            {playing ? <Pause size={18} /> : <Play size={18} />}
          </button>
          <button onClick={() => skip(10)} aria-label="Avançar 10 segundos">
            <RotateCw size={16} />
          </button>
          <span className="text-xs tabular-nums">
            {formatDuration(currentTime)} / {formatDuration(duration)}
          </span>
          <button
            className="ml-auto"
            onClick={handleFullscreen}
            aria-label={isFullscreen ? "Minimizar" : "Tela cheia"}
          >
            {isFullscreen ? <Minimize size={18} /> : <Maximize size={18} />}
          </button>
        </div>
      </div>
    </div>
  );
});
