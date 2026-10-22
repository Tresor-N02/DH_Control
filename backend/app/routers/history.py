from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session

from .. import models, schemas
from ..database import get_db
from ..security import get_current_user

router = APIRouter(prefix="/api/history", tags=["history"])


@router.get("", response_model=list[schemas.HistoriqueOut])
def list_history(
    drone_id: int | None = None,
    limit: int = Query(default=100, le=1000),
    db: Session = Depends(get_db),
    _=Depends(get_current_user),
):
    query = db.query(models.Historique)
    if drone_id is not None:
        query = query.filter(models.Historique.id_drone == drone_id)
    return query.order_by(models.Historique.id_historique.desc()).limit(limit).all()
