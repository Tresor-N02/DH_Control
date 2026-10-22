import { useCallback, useEffect, useRef, useState } from "react";
import { CameraOff } from "lucide-react";
import { useDrone } from "../../context/useDrone";
import VideoToolbar from "./VideoToolbar";
import DetectionBox from "./DetectionBox";
export default function VideoFeed() {
  const {
    videoFrame,
    detections,
    detectorAvailable,
    frameStale,
    frameAge,
    videoSimulated,
  } = useDrone();
  const containerRef = useRef(null);
  const [showDetections, setShowDetections] = useState(true);
  const [showReticle, setShowReticle] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [ratio, setRatio] = useState(4 / 3);
  const [size, setSize] = useState({ width: 0, height: 0 });
  const [fullscreenError, setFullscreenError] = useState("");
  useEffect(() => {
    const change = () =>
      setIsFullscreen(document.fullscreenElement === containerRef.current);
    document.addEventListener("fullscreenchange", change);
    const observer = new ResizeObserver(([entry]) =>
      setSize({
        width: entry.contentRect.width,
        height: entry.contentRect.height,
      }),
    );
    observer.observe(containerRef.current);
    return () => {
      document.removeEventListener("fullscreenchange", change);
      observer.disconnect();
    };
  }, []);
  const toggleFullscreen = useCallback(async () => {
    try {
      if (document.fullscreenElement) await document.exitFullscreen();
      else if (containerRef.current?.requestFullscreen)
        await containerRef.current.requestFullscreen();
      else throw new Error("unsupported");
      setFullscreenError("");
    } catch {
      setFullscreenError("Plein écran indisponible sur cet appareil.");
    }
  }, []);
  const width = Math.min(size.width, size.height * ratio);
  return (
    <div
      ref={containerRef}
      className="relative flex h-full min-h-72 items-center justify-center overflow-hidden rounded-xl bg-black"
    >
      {videoFrame ? (
        <div className="relative" style={{ width, height: width / ratio }}>
          <img
            src={videoFrame}
            onLoad={(e) =>
              setRatio(
                e.currentTarget.naturalWidth / e.currentTarget.naturalHeight,
              )
            }
            className={`block h-full w-full ${frameStale ? "opacity-40" : ""}`}
            alt="Vue complète de la caméra du drone"
          />
          {!frameStale &&
            showDetections &&
            detections.map((d, i) => (
              <DetectionBox
                key={i}
                left={`${d.x * 100}%`}
                top={`${d.y * 100}%`}
                width={`${d.w * 100}%`}
                height={`${d.h * 100}%`}
                label={`${d.objet} ${Math.round(d.confiance * 100)} %`}
              />
            ))}
          {showReticle && (
            <div
              aria-hidden="true"
              className="pointer-events-none absolute left-1/2 top-1/2 h-10 w-10 -translate-x-1/2 -translate-y-1/2 rounded-full border border-cyan-400"
            />
          )}
        </div>
      ) : (
        <div className="flex flex-col items-center gap-2 text-slate-400">
          <CameraOff size={32} />
          <p>En attente d’une image caméra…</p>
        </div>
      )}
      <div className="pointer-events-none absolute left-3 top-3 right-16 space-y-2 text-xs">
        <p
          className={`w-fit rounded-lg bg-slate-950/90 px-3 py-2 ${frameStale ? "text-amber-200" : "text-cyan-200"}`}
        >
          {frameStale
            ? "Caméra indisponible · image non actualisée"
            : videoSimulated
              ? "Image simulée"
              : "Caméra en direct"}
          {frameAge != null ? ` · ${frameAge} s` : ""}
        </p>
        {detectorAvailable === false && (
          <p className="w-fit rounded-lg bg-slate-950/90 p-2 text-amber-200">
            Détection YOLO indisponible
          </p>
        )}
      </div>
      {fullscreenError && (
        <p
          role="status"
          className="absolute bottom-3 left-3 text-sm text-amber-200"
        >
          {fullscreenError}
        </p>
      )}
      <VideoToolbar
        videoFrame={frameStale ? null : videoFrame}
        showDetections={showDetections}
        onToggleDetections={() => setShowDetections(!showDetections)}
        showReticle={showReticle}
        onToggleReticle={() => setShowReticle(!showReticle)}
        isFullscreen={isFullscreen}
        onToggleFullscreen={toggleFullscreen}
      />
    </div>
  );
}
