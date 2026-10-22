from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from .. import models, schemas
from ..database import get_db
from ..security import get_current_user
from ..services.control_service import execute_command

router = APIRouter(prefix="/api/control", tags=["control"])


@router.post("/{drone_id}/command", response_model=schemas.CommandResponse)
async def send_command(
    drone_id: int,
    payload: schemas.CommandRequest,
    db: Session = Depends(get_db),
    user: models.Utilisateur = Depends(get_current_user),
):
    """
    REST fallback for the joystick (useful for testing with curl/Postman,
    or for any client that isn't holding a WebSocket open). The live
    frontend joystick uses the WebSocket at /ws/drone/{drone_id} instead,
    for lower latency -- both paths call the exact same executor.
    """
    result = await execute_command(db, drone_id, payload.action, user_id=user.id_utilisateur, speed=payload.speed)
    return schemas.CommandResponse(**result)
