"""
One place that turns a requested action ("avancer", "gauche", ...) into
an actual outcome, whether it arrived via REST (routers/control.py) or
over the drone's WebSocket (routers/ws.py). Keeping this out of both
routers avoids the two entry points quietly drifting apart.

Safety note: the ESP32 ground module already refuses to move forward
when its own ultrasonic sensor is too close (see the reference
firmware). The check below against the *last stored* telemetry reading
is a second, independent guard on the backend -- not a replacement for
the firmware's -- so a stale command already in flight, or a client
that bypasses this API, still can't push the rover into an obstacle
that the backend already knows about.

Dead-man's switch: the firmware has no command timeout -- once told to
move, it keeps moving until told to stop (or its own ultrasonic check
fires). If a browser tab crashes or WiFi drops while the rover is
mid-command, nothing here would otherwise stop it. `_last_command_at`
timestamps every executed movement command; telemetry_service checks
it every tick and force-stops a drone that's supposedly moving but
hasn't heard from a client in COMMAND_WATCHDOG_SECONDS.
"""

import time

from sqlalchemy.orm import Session

from ..config import get_settings
from ..models import Drone, EtatDrone, Historique, ModeDrone, Telemetrie
from .esp32_client import ground_module
from .obstacle import is_forward_blocked
from .simulator import get_simulated_state

settings = get_settings()

_MOVING_ACTIONS = {"avancer", "reculer", "gauche", "droite"}
_last_command_at: dict[int, float] = {}


def seconds_since_last_command(drone_id: int) -> float | None:
    last = _last_command_at.get(drone_id)
    return None if last is None else time.monotonic() - last


def _last_known_distance(db: Session, drone_id: int) -> float | None:
    last = (
        db.query(Telemetrie)
        .filter(Telemetrie.id_drone == drone_id)
        .order_by(Telemetrie.id_telemetrie.desc())
        .first()
    )
    return float(last.distance_obstacle) if last and last.distance_obstacle is not None else None


async def execute_command(
    db: Session,
    drone_id: int,
    action: str,
    user_id: int | None = None,
    speed: int | None = None,
) -> dict:
    drone = db.get(Drone, drone_id)
    if drone is None:
        return {"action": action, "executed": False, "blocked_reason": "Drone introuvable", "distance_obstacle_cm": None}

    if drone.mode == ModeDrone.AERIEN:
        return {
            "action": action,
            "executed": False,
            "blocked_reason": "Mode aérien : aucun contrôleur de vol n'est encore relié au backend",
            "distance_obstacle_cm": None,
        }

    last_distance = _last_known_distance(db, drone_id)
    if action == "avancer" and is_forward_blocked(last_distance):
        db.add(
            Historique(
                id_utilisateur=user_id,
                id_drone=drone_id,
                action=f"Commande '{action}' refusée (backend) - obstacle à {last_distance:.0f} cm",
            )
        )
        db.commit()
        return {
            "action": action,
            "executed": False,
            "blocked_reason": "Obstacle détecté - avance bloquée",
            "distance_obstacle_cm": last_distance,
        }

    executed, reply = await ground_module.send_command(action, speed)

    simulated = False
    if not executed and reply.startswith("unreachable") and settings.simulation_mode:
        # The real board can't be reached; let the simulated rover respond
        # instead so a demo/dev session still behaves like a real one.
        get_simulated_state(drone_id).apply_command(action)
        executed = True
        simulated = True
        reply = f"(simulé) {action}"

    drone.etat = EtatDrone.ARRETE if action == "stop" else (EtatDrone.EN_DEPLACEMENT if executed else drone.etat)
    db.add(
        Historique(
            id_utilisateur=user_id,
            id_drone=drone_id,
            action=f"Commande '{action}'{' (simulée)' if simulated else ''} -> {reply}",
        )
    )
    db.commit()

    if executed and action in _MOVING_ACTIONS:
        _last_command_at[drone_id] = time.monotonic()
    elif action == "stop":
        _last_command_at.pop(drone_id, None)

    return {
        "action": action,
        "executed": executed,
        "blocked_reason": None if executed else reply,
        "distance_obstacle_cm": last_distance,
    }
