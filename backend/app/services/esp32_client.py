"""
Thin HTTP clients for the two ESP32 boards described in the project's
reference firmware document:

  1. Ground module (ESP32 + L298N + HC-SR04): a tiny web server with
     GET routes /avant /arriere /gauche /droite /stop, each returning
     plain text ("AVANCER", "Obstacle detecte", ...).
  2. ESP32-CAM: a web server with GET /capture returning one JPEG frame.

Both boards run their own WiFi access point in the reference code, so
in a real deployment these base URLs point at whichever IPs they end
up on (soft-AP address 192.168.4.1 by default, or a LAN IP if the
firmware is switched to station mode).
"""

import httpx

from ..config import get_settings

settings = get_settings()

# Ground-side words the firmware answers with when it refuses to move
# forward because the ultrasonic sensor is reporting an obstacle.
_OBSTACLE_REPLIES = {"obstacle detecte", "obstacle détecté"}


class GroundModuleClient:
    """Talks to the rover's motor-control ESP32."""

    _ACTION_ROUTES = {
        "avancer": "/avant",
        "reculer": "/arriere",
        "gauche": "/gauche",
        "droite": "/droite",
        "stop": "/stop",
    }

    def __init__(self, base_url: str | None = None, timeout: float | None = None) -> None:
        self.base_url = (base_url or settings.ground_module_base_url).rstrip("/")
        self.timeout = timeout or settings.ground_module_timeout_seconds

    async def send_command(self, action: str, speed: int | None = None) -> tuple[bool, str]:
        """
        Returns (executed, raw_reply). `executed` is False when the
        firmware itself refused the move (its own ultrasonic check
        tripped) or when the board could not be reached.

        `speed` is 0-100 (percentage); the firmware's /avant /arriere
        /gauche /droite take an optional ?vitesse=0-255 PWM duty cycle
        (see firmware/ground_module), so it's rescaled here. Omitted
        entirely for "stop" and when not provided -- the firmware then
        just uses its own default (full speed).
        """
        route = self._ACTION_ROUTES[action]
        url = f"{self.base_url}{route}"
        params = {}
        if speed is not None and action != "stop":
            params["vitesse"] = round(max(0, min(100, speed)) * 255 / 100)
        try:
            async with httpx.AsyncClient(timeout=self.timeout) as client:
                response = await client.get(url, params=params)
                response.raise_for_status()
                reply = response.text.strip()
        except httpx.HTTPError as exc:
            return False, f"unreachable: {exc}"

        executed = reply.strip().lower() not in _OBSTACLE_REPLIES
        return executed, reply

    async def get_status(self) -> dict | None:
        """
        Fetch the merged ultrasonic + GPS reading from the ground module's
        GET /telemetrie route (see firmware/ground_module/ground_module.ino).
        Returns None if the board can't be reached or replies with something
        that isn't valid JSON -- callers decide what to do about that
        (fall back to simulation, mark the drone as disconnected, etc.).
        """
        url = f"{self.base_url}/telemetrie"
        try:
            async with httpx.AsyncClient(timeout=self.timeout) as client:
                response = await client.get(url)
                response.raise_for_status()
                return response.json()
        except (httpx.HTTPError, ValueError):
            return None


class CameraModuleClient:
    """Talks to the ESP32-CAM board."""

    def __init__(self, base_url: str | None = None) -> None:
        self.base_url = (base_url or settings.camera_module_base_url).rstrip("/")

    async def capture_frame(self) -> bytes | None:
        """Fetch one JPEG snapshot, or None if the camera couldn't be reached."""
        url = f"{self.base_url}/capture"
        try:
            async with httpx.AsyncClient(timeout=3.0) as client:
                response = await client.get(url)
                response.raise_for_status()
                return response.content
        except httpx.HTTPError:
            return None


ground_module = GroundModuleClient()
camera_module = CameraModuleClient()
