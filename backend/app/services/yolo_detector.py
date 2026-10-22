"""
Object detection over frames pulled from the ESP32-CAM, using a
pre-trained Ultralytics YOLO model (defaults to the small/fast
`yolov8n.pt`, trained on the 80-class COCO dataset -- swap
YOLO_MODEL in .env for a different Ultralytics checkpoint, e.g. a
custom-trained .pt file, without touching this module).

The model loads lazily on first use and only once per process. If
`ultralytics` isn't installed, or the weights can't be fetched (no
internet on first run), detection is disabled but the rest of the API
-- video relay, GPS, ultrasonic, commands -- keeps working normally;
`is_available()` lets callers/health checks report this state instead
of crashing.

Testing note: this module's logic (frame decode, box normalization,
graceful degradation when the import fails) is exercised by the rest
of the backend's test pass, but actually running inference through a
real `ultralytics`/`torch` install wasn't done in the sandbox this was
built in -- installing the full torch stack there hit a disk-space
wall pulling in CUDA dependencies (PyPI's default `torch` wheel wants
them even for CPU use; the lightweight CPU-only index lives at
download.pytorch.org, a host outside that sandbox's network allowlist).
Please run the one-liner in the backend README's YOLO section after
`pip install -r requirements.txt` to confirm this loads on your machine.
"""

import logging
from dataclasses import dataclass
from functools import lru_cache

import cv2
import numpy as np

from ..config import get_settings

logger = logging.getLogger("dh_mil.yolo")
settings = get_settings()


@dataclass
class Detection:
    label: str
    confidence: float
    # Normalized (0..1) box, relative to the frame -- matches how the
    # frontend's <DetectionBox> already expects to position an overlay.
    x: float
    y: float
    w: float
    h: float


class YoloDetector:
    def __init__(self) -> None:
        self._model = None
        self._load_error: str | None = None
        self._try_load()

    def _try_load(self) -> None:
        try:
            from ultralytics import YOLO  # imported lazily: heavy, optional dependency

            self._model = YOLO(settings.yolo_model)
            logger.info("YOLO model '%s' loaded.", settings.yolo_model)
        except Exception as exc:  # noqa: BLE001 - any load failure should degrade, not crash the API
            self._load_error = str(exc)
            logger.warning("YOLO model unavailable (%s). Detection disabled.", exc)

    def is_available(self) -> bool:
        return self._model is not None

    def load_error(self) -> str | None:
        return self._load_error

    def detect(self, jpeg_bytes: bytes) -> list[Detection]:
        if self._model is None:
            return []

        frame = cv2.imdecode(np.frombuffer(jpeg_bytes, dtype=np.uint8), cv2.IMREAD_COLOR)
        if frame is None:
            return []

        results = self._model(frame, verbose=False, conf=settings.yolo_confidence_threshold)
        detections: list[Detection] = []
        for result in results:
            names = result.names
            for box in result.boxes:
                x1, y1, x2, y2 = box.xyxyn[0].tolist()  # already normalized 0..1
                detections.append(
                    Detection(
                        label=names[int(box.cls[0])],
                        confidence=float(box.conf[0]),
                        x=x1,
                        y=y1,
                        w=x2 - x1,
                        h=y2 - y1,
                    )
                )
        return detections


@lru_cache
def get_detector() -> YoloDetector:
    return YoloDetector()
