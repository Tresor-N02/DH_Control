import { Box, Stack, Typography } from "@mui/material";
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
  const [size, setSize] = useState({
    width: 0,
    height: 0,
  });
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
    <Box
      ref={containerRef}
      sx={{
        position: "relative",
        display: "flex",
        height: "100%",
        minHeight: 288,
        alignItems: "center",
        justifyContent: "center",
        overflow: "hidden",
        bgcolor: "#000",
        color: "#fff",
      }}
    >
      {videoFrame ? (
        <Box
          sx={{
            position: "relative",
            width,
            height: width / ratio,
          }}
        >
          <Box
            component="img"
            src={videoFrame}
            onLoad={(e) =>
              setRatio(
                e.currentTarget.naturalWidth / e.currentTarget.naturalHeight,
              )
            }
            alt="Vue complète de la caméra du drone"
            sx={{
              display: "block",
              width: "100%",
              height: "100%",
              opacity: frameStale ? 0.4 : 1,
            }}
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
            <Box
              aria-hidden="true"
              sx={{
                position: "absolute",
                left: "50%",
                top: "50%",
                transform: "translate(-50%, -50%)",
                width: 40,
                height: 40,
                borderRadius: "50%",
                border: "1px solid #22d3ee",
                pointerEvents: "none",
              }}
            />
          )}
        </Box>
      ) : (
        <Stack
          spacing={1}
          sx={{
            alignItems: "center",
            color: "#94a3b8",
            px: 2,
          }}
        >
          <CameraOff size={32} />
          <Typography>En attente d’une image caméra…</Typography>
        </Stack>
      )}
      <Stack
        spacing={1}
        sx={{
          position: "absolute",
          left: 12,
          top: 12,
          right: 64,
          pointerEvents: "none",
        }}
      >
        <Typography
          variant="body2"
          sx={{
            width: "fit-content",
            borderRadius: 1,
            bgcolor: "rgba(2,6,23,0.9)",
            px: 1.5,
            py: 1,
            color: frameStale ? "#fde68a" : "#a5f3fc",
          }}
        >
          {frameStale
            ? "Caméra indisponible · image non actualisée"
            : videoSimulated
              ? "Image simulée"
              : "Caméra en direct"}
          {frameAge != null ? ` · ${frameAge} s` : ""}
        </Typography>
        {detectorAvailable === false && (
          <Typography
            variant="body2"
            sx={{
              width: "fit-content",
              borderRadius: 1,
              bgcolor: "rgba(2,6,23,0.9)",
              p: 1,
              color: "#fde68a",
            }}
          >
            Détection YOLO indisponible
          </Typography>
        )}
      </Stack>
      {fullscreenError && (
        <Typography
          role="status"
          variant="body2"
          sx={{
            position: "absolute",
            bottom: 12,
            left: 12,
            color: "#fde68a",
          }}
        >
          {fullscreenError}
        </Typography>
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
    </Box>
  );
}
