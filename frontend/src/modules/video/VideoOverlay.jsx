import { Box, Chip } from "@mui/material";
import { useDrone } from "../../context/useDrone";
import RecordingBadge from "./RecordingBadge";
import DetectionBox from "./DetectionBox";
export default function VideoOverlay({
  showDetections = true,
  showReticle = true,
}) {
  const { detections, detectorAvailable, connected, simulated } = useDrone();
  return (
    <>
      <Box sx={{ position: "absolute", left: 16, top: 16 }}>
        <RecordingBadge live={connected} simulated={simulated} />
      </Box>
      {detectorAvailable === false && (
        <Chip
          label="Détection YOLO indisponible"
          size="small"
          sx={{
            position: "absolute",
            right: 64,
            top: 16,
            bgcolor: "rgba(15,23,42,0.9)",
            color: "#fde68a",
          }}
        />
      )}
      {showDetections &&
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
    </>
  );
}
