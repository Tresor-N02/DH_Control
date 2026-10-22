"""
Server-side obstacle avoidance.

The ESP32 ground module already refuses to drive forward when its own
ultrasonic sensor is within `DISTANCE_SECURITE` (see the reference
firmware) -- this is a *second*, independent check on the backend
using the last ultrasonic reading it has stored, so a stale or
compromised frontend can't push a forward command straight through.
Defense in depth: either layer can veto the move.
"""

from ..config import get_settings

settings = get_settings()


def is_forward_blocked(last_distance_cm: float | None) -> bool:
    """True when the last known ultrasonic reading is inside the safety margin."""
    if last_distance_cm is None:
        return False
    return 0 <= last_distance_cm <= settings.obstacle_safe_distance_cm
