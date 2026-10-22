from datetime import datetime, timezone

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from .. import models, schemas
from ..database import get_db
from ..security import get_current_user

router = APIRouter(prefix="/api/missions", tags=["missions"])


@router.get("", response_model=list[schemas.MissionOut])
def list_missions(drone_id: int | None = None, db: Session = Depends(get_db), _=Depends(get_current_user)):
    query = db.query(models.Mission)
    if drone_id is not None:
        query = query.filter(models.Mission.id_drone == drone_id)
    return query.order_by(models.Mission.id_mission.desc()).all()


@router.post("", response_model=schemas.MissionOut, status_code=status.HTTP_201_CREATED)
def create_mission(
    drone_id: int,
    payload: schemas.MissionCreate,
    db: Session = Depends(get_db),
    user: models.Utilisateur = Depends(get_current_user),
):
    if db.get(models.Drone, drone_id) is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Drone introuvable")

    mission = models.Mission(id_drone=drone_id, titre=payload.titre)
    db.add(mission)
    db.flush()
    db.add(
        models.Historique(
            id_utilisateur=user.id_utilisateur,
            id_drone=drone_id,
            id_mission=mission.id_mission,
            action=f"Mission créée : {payload.titre}",
        )
    )
    db.commit()
    db.refresh(mission)
    return mission


@router.patch("/{mission_id}/demarrer", response_model=schemas.MissionOut)
def demarrer_mission(mission_id: int, db: Session = Depends(get_db), user: models.Utilisateur = Depends(get_current_user)):
    mission = db.get(models.Mission, mission_id)
    if mission is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Mission introuvable")

    mission.statut = models.StatutMission.EN_COURS
    mission.date_debut = datetime.now(timezone.utc)
    drone = db.get(models.Drone, mission.id_drone)
    if drone is not None:
        drone.etat = models.EtatDrone.EN_MISSION
    db.add(
        models.Historique(
            id_utilisateur=user.id_utilisateur,
            id_drone=mission.id_drone,
            id_mission=mission_id,
            action="Mission démarrée",
        )
    )
    db.commit()
    db.refresh(mission)
    return mission


@router.patch("/{mission_id}/terminer", response_model=schemas.MissionOut)
def terminer_mission(mission_id: int, db: Session = Depends(get_db), user: models.Utilisateur = Depends(get_current_user)):
    mission = db.get(models.Mission, mission_id)
    if mission is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Mission introuvable")

    mission.statut = models.StatutMission.TERMINEE
    mission.date_fin = datetime.now(timezone.utc)
    drone = db.get(models.Drone, mission.id_drone)
    if drone is not None:
        drone.etat = models.EtatDrone.PRET
    db.add(
        models.Historique(
            id_utilisateur=user.id_utilisateur,
            id_drone=mission.id_drone,
            id_mission=mission_id,
            action="Mission terminée",
        )
    )
    db.commit()
    db.refresh(mission)
    return mission
