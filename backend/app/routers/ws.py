"""
One WebSocket per drone carries everything the dashboard needs:

  * inbound: joystick commands from the frontend, as JSON
        {"type": "command", "action": "avancer", "speed": 80}
        {"type": "command", "action": "stop"}
  * outbound: whatever telemetry_service / video_service broadcast --
        {"type": "telemetry", "data": {...}}
        {"type": "frame", "data": {...}}
        {"type": "alerte", "data": {...}}
        {"type": "connection", "data": {"connected": true, "simulated": false}}

Outbound messages are pushed by the background loops (see
services/telemetry_service.py and services/video_service.py) calling
`ws_manager.manager.broadcast(...)` directly -- this endpoint's own loop
only has to sit and read whatever the client sends.

Auth here is intentionally light: a JWT can be passed as
`?token=...` on the connection URL (WebSocket handshakes can't carry
an Authorization header from a browser). If present it's verified and
the resulting user is attached to every command for the historique
log; if absent the connection is still accepted (this is meant to run
on a private control-network) but commands are logged without a user.
For an internet-facing deployment, require the token instead of
falling through.
"""

import json
import logging

from fastapi import APIRouter, WebSocket, WebSocketDisconnect
from jose import JWTError, jwt

from ..config import get_settings
from ..database import SessionLocal
from ..models import Utilisateur
from ..services.control_service import execute_command
from ..ws_manager import manager

logger = logging.getLogger("dh_mil.ws")
settings = get_settings()

router = APIRouter(tags=["realtime"])


def _user_id_from_token(token: str | None) -> int | None:
    if not token:
        return None
    try:
        payload = jwt.decode(token, settings.jwt_secret_key, algorithms=[settings.jwt_algorithm])
        return int(payload.get("sub"))
    except (JWTError, TypeError, ValueError):
        return None


@router.websocket("/ws/drone/{drone_id}")
async def drone_socket(websocket: WebSocket, drone_id: int):
    token = websocket.query_params.get("token")
    user_id = _user_id_from_token(token)

    await manager.connect(drone_id, websocket)
    try:
        while True:
            raw = await websocket.receive_text()
            try:
                message = json.loads(raw)
            except json.JSONDecodeError:
                continue

            if message.get("type") != "command":
                continue

            action = message.get("action")
            if action not in {"avancer", "reculer", "gauche", "droite", "stop"}:
                continue
            speed = message.get("speed")
            if not isinstance(speed, (int, float)):
                speed = None

            db = SessionLocal()
            try:
                if user_id is not None and db.get(Utilisateur, user_id) is None:
                    user_id = None
                result = await execute_command(db, drone_id, action, user_id=user_id, speed=speed)
            finally:
                db.close()

            await websocket.send_text(json.dumps({"type": "command_result", "data": result}))
    except WebSocketDisconnect:
        pass
    except Exception:  # noqa: BLE001 - never let a bad frame take the room down
        logger.exception("WebSocket error for drone %s", drone_id)
    finally:
        manager.disconnect(drone_id, websocket)
