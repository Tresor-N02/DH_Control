from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session

from .. import models, schemas
from ..database import get_db
from ..security import get_current_user

router = APIRouter(prefix="/api/alerts", tags=["alerts"])


@router.get("", response_model=list[schemas.AlerteOut])
def list_alerts(
    drone_id: int | None = None,
    statut: models.StatutAlerte | None = None,
    limit: int = Query(default=100, le=1000),
    db: Session = Depends(get_db),
    _=Depends(get_current_user),
):
    query = db.query(models.Alerte)
    if drone_id is not None:
        query = query.filter(models.Alerte.id_drone == drone_id)
    if statut is not None:
        query = query.filter(models.Alerte.statut == statut)
    return query.order_by(models.Alerte.id_alerte.desc()).limit(limit).all()


@router.patch("/{alert_id}", response_model=schemas.AlerteOut)
def update_alert_status(
    alert_id: int,
    payload: schemas.AlerteStatutUpdate,
    db: Session = Depends(get_db),
    _=Depends(get_current_user),
):
    alerte = db.get(models.Alerte, alert_id)
    if alerte is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Alerte introuvable")
    alerte.statut = payload.statut
    db.commit()
    db.refresh(alerte)
    return alerte
