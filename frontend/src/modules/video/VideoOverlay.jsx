import { useDrone } from "../../context/DroneContext";
import RecordingBadge from "./RecordingBadge";
import DetectionBox from "./DetectionBox";

export default function VideoOverlay({ showDetections = true, showReticle = true }) {
  const { detections, detectorAvailable, connected, simulated } = useDrone();

  return (
    <>
      <div className="absolute left-4 top-4">
        <RecordingBadge live={connected} simulated={simulated} />
      </div>

      {detectorAvailable === false && (
        <div className="absolute right-4 top-4 z-20 rounded-full bg-slate-900/80 px-3 py-1 text-xs text-yellow-400">
          Détection YOLO indisponible
        </div>
      )}

      {showDetections &&
        detections.map((detection, index) => (
          <DetectionBox
            key={index}
            left={`${detection.x * 100}%`}
            top={`${detection.y * 100}%`}
            width={`${detection.w * 100}%`}
            height={`${detection.h * 100}%`}
            label={`${detection.objet} ${Math.round(detection.confiance * 100)}%`}
          />
        ))}

      {showReticle && (
        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
          <div className="h-10 w-10 rounded-full border border-cyan-400" />
        </div>
      )}
    </>
  );
}
