"""
The video loop pulls one JPEG snapshot at a time from the ESP32-CAM's
GET /capture route (there's no true MJPEG stream in the reference
firmware, so "streaming" here means "poll fast enough that it looks
live" -- CAMERA_POLL_INTERVAL_SECONDS controls that), runs it through
YOLO, stores any detections against the drone's camera row, and
broadcasts the frame (as base64) plus the detection list to that
drone's WebSocket room.

Like telemetry_service, this degrades to a placeholder frame when the
camera is unreachable and SIMULATION_MODE is on, rather than freezing
the video panel.
"""

import asyncio
import base64
import logging

from ..config import get_settings
from ..database import SessionLocal
from ..models import Alerte, Camera, Detection
from .esp32_client import camera_module
from .simulator import generate_placeholder_frame
from ..ws_manager import manager
from .yolo_detector import get_detector

logger = logging.getLogger("dh_mil.video")
settings = get_settings()


async def _read_frame() -> tuple[bytes, bool]:
    frame = await camera_module.capture_frame()
    if frame is not None:
        return frame, True
    if settings.simulation_mode:
        return generate_placeholder_frame(), False
    return b"", False


async def video_tick(drone_id: int, camera_id: int) -> None:
    frame, is_real = await _read_frame()
    if not frame:
        await manager.broadcast(drone_id, "camera_connection", {"connected": False})
        return

    detector = get_detector()
    detections = detector.detect(frame)

    db = SessionLocal()
    try:
        camera = db.get(Camera, camera_id)
        if camera is not None:
            for det in detections:
                db.add(
                    Detection(
                        id_camera=camera_id,
                        objet=det.label,
                        confiance=round(det.confidence, 4),
                        bbox_x=round(det.x, 5),
                        bbox_y=round(det.y, 5),
                        bbox_w=round(det.w, 5),
                        bbox_h=round(det.h, 5),
                    )
                )
                if det.label.lower() in settings.alert_on_class_list and det.confidence >= settings.alert_min_confidence:
                    db.add(
                        Alerte(
                            id_drone=drone_id,
                            type="DETECTION",
                            message=f"{det.label} détecté ({det.confidence * 100:.0f}%)",
                        )
                    )
            db.commit()
    finally:
        db.close()

    await manager.broadcast(
        drone_id,
        "frame",
        {
            "image_base64": base64.b64encode(frame).decode("ascii"),
            "simulated": not is_real,
            "detections": [
                {"objet": d.label, "confiance": round(d.confidence, 4), "x": d.x, "y": d.y, "w": d.w, "h": d.h}
                for d in detections
            ],
            "detector_available": detector.is_available(),
        },
    )


async def video_loop(drone_id: int, camera_id: int) -> None:
    logger.info("Video loop started for drone %s / camera %s", drone_id, camera_id)
    while True:
        try:
            await video_tick(drone_id, camera_id)
        except Exception:  # noqa: BLE001 - one bad frame must never kill the loop
            logger.exception("Video tick failed for drone %s", drone_id)
        await asyncio.sleep(settings.camera_poll_interval_seconds)
