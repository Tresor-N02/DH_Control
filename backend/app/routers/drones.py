from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from .. import models, schemas
from ..database import get_db
from ..security import get_current_user

router = APIRouter(prefix="/api/drones", tags=["drones"])


@router.get("", response_model=list[schemas.DroneOut])
def list_drones(db: Session = Depends(get_db), _=Depends(get_current_user)):
    return db.query(models.Drone).all()


@router.get("/{drone_id}", response_model=schemas.DroneOut)
def get_drone(drone_id: int, db: Session = Depends(get_db), _=Depends(get_current_user)):
    drone = db.get(models.Drone, drone_id)
    if drone is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Drone introuvable")
    return drone


@router.get("/{drone_id}/camera", response_model=schemas.CameraOut)
def get_drone_camera(drone_id: int, db: Session = Depends(get_db), _=Depends(get_current_user)):
    camera = db.query(models.Camera).filter(models.Camera.id_drone == drone_id).first()
    if camera is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Aucune caméra pour ce drone")
    return camera


@router.patch("/{drone_id}/mode", response_model=schemas.DroneOut)
def set_mode(
    drone_id: int,
    payload: schemas.DroneModeUpdate,
    db: Session = Depends(get_db),
    user: models.Utilisateur = Depends(get_current_user),
):
    """Bascule AERIEN <-> TERRESTRE (ControleTerrestre.changerMode() / Drone.basculerMode() in the class diagram)."""
    drone = db.get(models.Drone, drone_id)
    if drone is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Drone introuvable")

    drone.mode = payload.mode
    db.add(
        models.Historique(
            id_utilisateur=user.id_utilisateur,
            id_drone=drone_id,
            action=f"Changement de mode -> {payload.mode.value}",
        )
    )
    db.commit()
    db.refresh(drone)
    return drone


@router.patch("/{drone_id}/etat", response_model=schemas.DroneOut)
def set_etat(
    drone_id: int,
    payload: schemas.DroneEtatUpdate,
    db: Session = Depends(get_db),
    user: models.Utilisateur = Depends(get_current_user),
):
    drone = db.get(models.Drone, drone_id)
    if drone is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Drone introuvable")

    drone.etat = payload.etat
    db.add(
        models.Historique(
            id_utilisateur=user.id_utilisateur,
            id_drone=drone_id,
            action=f"Changement d'état -> {payload.etat.value}",
        )
    )
    db.commit()
    db.refresh(drone)
    return drone
