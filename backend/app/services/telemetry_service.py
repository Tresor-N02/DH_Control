"""
The telemetry loop is the backend's heartbeat for one drone: every
`TELEMETRY_POLL_INTERVAL_SECONDS` it asks the ground module for its
current ultrasonic distance + GPS fix, stores a `Telemetrie` row, works
out whether that counts as an obstacle, raises an `Alerte` when a new
obstacle appears, and pushes the result to anyone with that drone's
WebSocket open.

Started once per drone at app startup (see main.py) and left running
for the lifetime of the process.
"""

import asyncio
import logging

from ..config import get_settings
from ..database import SessionLocal
from ..models import Alerte, Drone, EtatDrone, Telemetrie
from .control_service import execute_command, seconds_since_last_command
from .esp32_client import ground_module
from .obstacle import is_forward_blocked
from .simulator import get_simulated_state
from ..ws_manager import manager

logger = logging.getLogger("dh_mil.telemetry")
settings = get_settings()

# Battery/signal aren't reported by the reference firmware over WiFi today
# (no hardware fuel gauge in the provided sketches) -- tracked here so the
# existing BatteryCard/SignalCard keep working the same way they already
# did in the simulated frontend, until real sensors are wired up.
_last_signal: dict[int, int] = {}


async def _read_status(drone_id: int) -> tuple[dict, bool]:
    """Returns (status_dict, is_real). Tries the real board first; falls
    back to the simulator only if SIMULATION_MODE is enabled."""
    status = await ground_module.get_status()
    if status is not None:
        return status, True

    if settings.simulation_mode:
        state = get_simulated_state(drone_id)
        return state.step(), False

    return {}, False


async def telemetry_tick(drone_id: int) -> None:
    status, is_real = await _read_status(drone_id)
    db = SessionLocal()
    try:
        drone = db.get(Drone, drone_id)
        if drone is None:
            return

        if not status:
            # Neither the real board nor the simulator produced anything --
            # the drone is genuinely unreachable and simulation is off.
            if drone.etat != EtatDrone.ERREUR:
                drone.etat = EtatDrone.ERREUR
                db.commit()
            await manager.broadcast(drone_id, "connection", {"connected": False, "simulated": False})
            return

        distance = status.get("distance_cm")
        obstacle = is_forward_blocked(distance)

        was_obstacle = (
            db.query(Telemetrie)
            .filter(Telemetrie.id_drone == drone_id)
            .order_by(Telemetrie.id_telemetrie.desc())
            .first()
        )
        newly_obstructed = obstacle and not (was_obstacle and was_obstacle.obstacle_detecte)

        signal = _last_signal.get(drone_id, 97)
        battery = status.get("_battery", was_obstacle.batterie if was_obstacle else 100.0)

        row = Telemetrie(
            id_drone=drone_id,
            batterie=battery,
            altitude=status.get("altitude") or 0,
            vitesse=status.get("vitesse") or 0,
            temperature=status.get("temperature"),
            signal=signal,
            latitude=status.get("latitude"),
            longitude=status.get("longitude"),
            distance_obstacle=distance,
            obstacle_detecte=obstacle,
        )
        db.add(row)

        if drone.etat == EtatDrone.ERREUR:
            drone.etat = EtatDrone.EN_DEPLACEMENT if status.get("vitesse") else EtatDrone.PRET

        if newly_obstructed:
            alerte = Alerte(
                id_drone=drone_id,
                type="OBSTACLE",
                message=f"Obstacle détecté à {distance:.0f} cm - avance bloquée",
            )
            db.add(alerte)

        db.commit()
        db.refresh(row)

        if drone.etat == EtatDrone.EN_DEPLACEMENT:
            age = seconds_since_last_command(drone_id)
            if age is None or age > settings.command_watchdog_seconds:
                logger.warning(
                    "Watchdog: drone %s marked EN_DEPLACEMENT with no command in %s -- forcing stop",
                    drone_id,
                    "ever" if age is None else f"{age:.1f}s",
                )
                await execute_command(db, drone_id, "stop", user_id=None)

        await manager.broadcast(drone_id, "connection", {"connected": True, "simulated": not is_real})
        await manager.broadcast(
            drone_id,
            "telemetry",
            {
                "id_telemetrie": row.id_telemetrie,
                "batterie": float(row.batterie),
                "altitude": float(row.altitude),
                "vitesse": float(row.vitesse),
                "temperature": float(row.temperature) if row.temperature is not None else None,
                "signal": row.signal,
                "latitude": float(row.latitude) if row.latitude is not None else None,
                "longitude": float(row.longitude) if row.longitude is not None else None,
                "distance_obstacle": float(row.distance_obstacle) if row.distance_obstacle is not None else None,
                "obstacle_detecte": row.obstacle_detecte,
                "date_heure": row.date_heure.isoformat(),
            },
        )
        if newly_obstructed:
            await manager.broadcast(
                drone_id,
                "alerte",
                {"type": "OBSTACLE", "message": f"Obstacle détecté à {distance:.0f} cm", "statut": "NOUVELLE"},
            )
    finally:
        db.close()


async def telemetry_loop(drone_id: int) -> None:
    logger.info("Telemetry loop started for drone %s", drone_id)
    while True:
        try:
            await telemetry_tick(drone_id)
        except Exception:  # noqa: BLE001 - one bad tick must never kill the loop
            logger.exception("Telemetry tick failed for drone %s", drone_id)
        await asyncio.sleep(settings.telemetry_poll_interval_seconds)
