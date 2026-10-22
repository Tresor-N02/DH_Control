"""
Fallback data used only when a board can't be reached over WiFi and
SIMULATION_MODE is on (see .env.example). This exists so the dashboard,
the map, and the video panel are all meaningfully testable before any
ESP32 is powered on -- exactly the situation the current frontend was
already in (DroneContext.jsx faked everything client-side). Here it
happens once, server-side, and is clearly labelled as simulated rather
than silently pretending to be real hardware.

Nothing in this file talks to a network. `esp32_client.py` always tries
the real boards first; this is only ever the fallback.
"""

import math
import time
from dataclasses import dataclass, field
from io import BytesIO

from PIL import Image, ImageDraw

# Bujumbura, Burundi -- matches the coordinates already used as the
# starting point in the original DroneContext.jsx simulation.
_HOME_LAT = -3.3822
_HOME_LON = 29.3644
_STEP = 0.00002  # degrees per tick while "moving", same scale as before


@dataclass
class SimulatedGroundState:
    """One rover's simulated position/heading, advanced by whatever the
    last command was. A real deployment never touches this class."""

    latitude: float = _HOME_LAT
    longitude: float = _HOME_LON
    heading: float = 0.0
    battery: float = 100.0
    last_action: str = "stop"
    _t0: float = field(default_factory=time.monotonic)

    def apply_command(self, action: str) -> None:
        self.last_action = action

    def step(self) -> dict:
        """Advance the simulation by one telemetry tick and return a
        payload shaped like the real ground module's /telemetrie JSON."""
        if self.last_action == "gauche":
            self.heading = (self.heading - 6) % 360
        elif self.last_action == "droite":
            self.heading = (self.heading + 6) % 360

        speed = 0.0
        if self.last_action == "avancer":
            speed = 12.0
            rad = math.radians(self.heading)
            self.latitude += _STEP * math.cos(rad)
            self.longitude += _STEP * math.sin(rad)
        elif self.last_action == "reculer":
            speed = 6.0
            rad = math.radians(self.heading)
            self.latitude -= _STEP * math.cos(rad)
            self.longitude -= _STEP * math.sin(rad)

        self.battery = max(0.0, self.battery - 0.01)

        return {
            "distance_cm": 120.0,  # clear path -- no simulated obstacle by default
            "latitude": self.latitude,
            "longitude": self.longitude,
            "altitude": 0.0,
            "vitesse": speed,
            "satellites": 8,
            "fix": True,
            "_simulated": True,
            "_battery": self.battery,
            "_heading": self.heading,
        }


def generate_placeholder_frame(text: str = "SIMULATION - CAMERA HORS LIGNE") -> bytes:
    """A small JPEG used in place of a real ESP32-CAM frame when the
    camera can't be reached and simulation mode is on. Deliberately
    plain -- this is a status placeholder, not a fake detection target."""
    width, height = 640, 480
    img = Image.new("RGB", (width, height), color=(17, 17, 17))
    draw = ImageDraw.Draw(img)

    # A simple grid so it doesn't read as a broken image.
    for x in range(0, width, 40):
        draw.line([(x, 0), (x, height)], fill=(34, 34, 34))
    for y in range(0, height, 40):
        draw.line([(0, y), (width, y)], fill=(34, 34, 34))

    draw.text((24, height // 2 - 10), text, fill=(0, 200, 255))
    draw.text((24, height - 30), time.strftime("%Y-%m-%d %H:%M:%S"), fill=(120, 120, 120))

    buffer = BytesIO()
    img.save(buffer, format="JPEG", quality=70)
    return buffer.getvalue()


# One simulated rover is enough for this project (a single "Drone Hybride 01"
# is what the provided schema seeds) -- keyed by drone_id in case that changes.
_simulated_states: dict[int, SimulatedGroundState] = {}


def get_simulated_state(drone_id: int) -> SimulatedGroundState:
    if drone_id not in _simulated_states:
        _simulated_states[drone_id] = SimulatedGroundState()
    return _simulated_states[drone_id]
