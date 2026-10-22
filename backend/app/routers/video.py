from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session

from .. import models, schemas
from ..database import get_db
from ..security import get_current_user
from ..services.yolo_detector import get_detector

router = APIRouter(prefix="/api/video", tags=["video"])


@router.get("/detections/{camera_id}", response_model=list[schemas.DetectionOut])
def recent_detections(
    camera_id: int,
    limit: int = Query(default=50, le=500),
    db: Session = Depends(get_db),
    _=Depends(get_current_user),
):
    return (
        db.query(models.Detection)
        .filter(models.Detection.id_camera == camera_id)
        .order_by(models.Detection.id_detection.desc())
        .limit(limit)
        .all()
    )


@router.get("/status")
def detector_status(_=Depends(get_current_user)):
    """Lets the frontend show 'detection unavailable' instead of silently
    showing zero detections when ultralytics/YOLO weights aren't installed."""
    detector = get_detector()
    return {"available": detector.is_available(), "error": detector.load_error()}
