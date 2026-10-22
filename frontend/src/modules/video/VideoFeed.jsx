import { useCallback, useEffect, useRef, useState } from "react";
import { CameraOff } from "lucide-react";

import { useDrone } from "../../context/DroneContext";
import VideoOverlay from "./VideoOverlay";
import VideoToolbar from "./VideoToolbar";

export default function VideoFeed() {
  const { videoFrame, connected } = useDrone();
  const containerRef = useRef(null);

  const [showDetections, setShowDetections] = useState(true);
  const [showReticle, setShowReticle] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Fullscreen can also be exited with Escape, outside any click handler,
  // so the displayed state has to follow the browser's own event rather
  // than just assuming a toggle succeeded.
  useEffect(() => {
    const handleChange = () => setIsFullscreen(Boolean(document.fullscreenElement));
    document.addEventListener("fullscreenchange", handleChange);
    return () => document.removeEventListener("fullscreenchange", handleChange);
  }, []);

  // The ref stays local to this component; children only ever get a plain
  // callback, never the ref itself.
  const toggleFullscreen = useCallback(() => {
    if (document.fullscreenElement) {
      document.exitFullscreen();
    } else {
      containerRef.current?.requestFullscreen?.();
    }
  }, []);

  return (
    <div ref={containerRef} className="relative h-full overflow-hidden rounded-xl bg-black">
      {videoFrame ? (
        <img src={videoFrame} className="h-full w-full object-cover" alt="Flux caméra du drone" />
      ) : (
        <div className="flex h-full w-full flex-col items-center justify-center gap-2 text-slate-500">
          <CameraOff size={32} />
          <p className="text-sm">{connected ? "En attente d'image..." : "Caméra indisponible"}</p>
        </div>
      )}

      <VideoToolbar
        videoFrame={videoFrame}
        showDetections={showDetections}
        onToggleDetections={() => setShowDetections((v) => !v)}
        showReticle={showReticle}
        onToggleReticle={() => setShowReticle((v) => !v)}
        isFullscreen={isFullscreen}
        onToggleFullscreen={toggleFullscreen}
      />
      <VideoOverlay showDetections={showDetections} showReticle={showReticle} />
    </div>
  );
}
