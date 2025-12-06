import { useMemo } from "react";
import { useTheme } from "../context/ThemeContext";

interface BlobStyle {
  width: number;
  height: number;
  left: string;
  top: string;
  animationDelay: string;
  animationDuration: string;
}

export function BackgroundBlobs() {
  const { blobCount, colorTheme } = useTheme();

  // Generate random blob positions that don't overlap too much
  const blobs = useMemo(() => {
    const generatedBlobs: BlobStyle[] = [];
    const occupiedAreas: { x: number; y: number; r: number }[] = [];

    for (let i = 0; i < blobCount; i++) {
      let attempts = 0;
      let validPosition = false;
      let x = 0,
        y = 0;
      const size = 400 + Math.random() * 300; // 400-700px
      const radius = size / 2;

      while (!validPosition && attempts < 50) {
        x = Math.random() * 100; // 0-100% horizontal
        y = Math.random() * 60; // 0-60% vertical (keep blobs in top viewport area)

        // Check collision with existing blobs
        validPosition = true;
        for (const area of occupiedAreas) {
          const dx = x - area.x;
          const dy = y - area.y;
          const distance = Math.sqrt(dx * dx + dy * dy);
          const minDistance = (radius / 10 + area.r) * 0.6; // Allow some overlap

          if (distance < minDistance) {
            validPosition = false;
            break;
          }
        }
        attempts++;
      }

      occupiedAreas.push({ x, y, r: radius / 10 });

      generatedBlobs.push({
        width: size,
        height: size * (0.8 + Math.random() * 0.4), // Slightly varied aspect ratio
        left: `${x - 10}%`,
        top: `${y}%`,
        animationDelay: `${-Math.random() * 10}s`,
        animationDuration: `${10 + Math.random() * 8}s`,
      });
    }

    return generatedBlobs;
  }, [blobCount, colorTheme]); // Regenerate when count or theme changes

  if (blobCount === 0) return null;

  return (
    <div className="background-blobs" aria-hidden="true">
      {blobs.map((blob, index) => (
        <div
          key={`blob-${index}-${colorTheme}`}
          className={`blob blob-dynamic blob-color-${(index % 4) + 1}`}
          style={{
            width: blob.width,
            height: blob.height,
            left: blob.left,
            top: blob.top,
            animationDelay: blob.animationDelay,
            animationDuration: blob.animationDuration,
          }}
        />
      ))}
    </div>
  );
}
