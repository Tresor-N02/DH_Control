from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session

from .. import models, schemas
from ..database import get_db
from ..security import get_current_user

router = APIRouter(prefix="/api/telemetry", tags=["telemetry"])


@router.get("/{drone_id}/latest", response_model=schemas.TelemetryOut)
def latest_telemetry(drone_id: int, db: Session = Depends(get_db), _=Depends(get_current_user)):
    """Equivalent of the provided `vue_derniere_telemetrie` SQL view, one drone at a time."""
    row = (
        db.query(models.Telemetrie)
        .filter(models.Telemetrie.id_drone == drone_id)
        .order_by(models.Telemetrie.id_telemetrie.desc())
        .first()
    )
    if row is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Aucune télémétrie pour ce drone")
    return row


@router.get("/{drone_id}/history", response_model=list[schemas.TelemetryOut])
def telemetry_history(
    drone_id: int,
    limit: int = Query(default=200, le=2000),
    db: Session = Depends(get_db),
    _=Depends(get_current_user),
):
    return (
        db.query(models.Telemetrie)
        .filter(models.Telemetrie.id_drone == drone_id)
        .order_by(models.Telemetrie.id_telemetrie.desc())
        .limit(limit)
        .all()[::-1]
    )
