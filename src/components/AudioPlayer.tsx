import { useEffect, useRef } from "react";

interface AudioPlayerProps {
  src: string | null;
  autoPlay?: boolean;
  onEnded?: () => void;
}

export function AudioPlayer({
  src,
  autoPlay = true,
  onEnded,
}: AudioPlayerProps) {
  const audioRef = useRef<HTMLAudioElement>(null);

  useEffect(() => {
    if (src && audioRef.current && autoPlay) {
      audioRef.current.play().catch((err) => {
        console.error("Error playing audio:", err);
      });
    }
  }, [src, autoPlay]);

  if (!src) return null;

  return (
    <audio
      ref={audioRef}
      src={src}
      controls
      style={{ display: "none" }}
      onEnded={onEnded}
    />
  );
}
