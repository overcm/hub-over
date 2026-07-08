"use client";

import { useEffect, useState } from "react";
import { Star } from "lucide-react";

export function RatingStars({ lessonId }: { lessonId: string }) {
  const [stars, setStars] = useState(0);
  const [hovered, setHovered] = useState(0);

  useEffect(() => {
    fetch(`/api/lessons/${lessonId}/rating`)
      .then((r) => r.json())
      .then((data) => setStars(data.rating?.stars ?? 0));
  }, [lessonId]);

  async function handleRate(value: number) {
    setStars(value);
    await fetch(`/api/lessons/${lessonId}/rating`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ stars: value }),
    });
  }

  return (
    <div className="flex items-center gap-1">
      {[1, 2, 3, 4, 5].map((value) => (
        <button
          key={value}
          onMouseEnter={() => setHovered(value)}
          onMouseLeave={() => setHovered(0)}
          onClick={() => handleRate(value)}
          aria-label={`Avaliar com ${value} estrela(s)`}
        >
          <Star
            size={20}
            className={
              value <= (hovered || stars) ? "fill-primary text-primary" : "text-muted-foreground"
            }
          />
        </button>
      ))}
    </div>
  );
}
