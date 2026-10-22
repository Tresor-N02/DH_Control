"""
Central configuration for the DH_MIL backend.

Every value can be overridden with an environment variable (or a `.env`
file next to this project) -- see `.env.example` for the full list and
explanations of what each one controls.
"""

from functools import lru_cache
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8", extra="ignore")

    # --- Database ---------------------------------------------------
    database_url: str = "sqlite:///./op_control.db"

    # --- Auth ---------------------------------------------------------
    jwt_secret_key: str = "change-this-to-a-long-random-value"
    jwt_algorithm: str = "HS256"
    access_token_expire_minutes: int = 480

    # --- CORS -----------------------------------------------------------
    cors_origins: str = "http://localhost:5173,http://127.0.0.1:5173"

    # --- Ground module (ESP32 rover) --------------------------------------
    ground_module_base_url: str = "http://192.168.4.1"
    ground_module_timeout_seconds: float = 2.0

    # --- ESP32-CAM --------------------------------------------------------
    camera_module_base_url: str = "http://192.168.4.2"
    camera_poll_interval_seconds: float = 0.2
    camera_id: int = 1

    # --- Ground telemetry relay (ultrasonic + GPS, polled over WiFi) ------
    # The ground module firmware (firmware/ground_module) exposes these
    # readings as JSON at GET {ground_module_base_url}/telemetrie.
    telemetry_poll_interval_seconds: float = 1.0

    # Dead-man's switch: the firmware itself has no command timeout, so if
    # a moving drone hasn't received a fresh movement command in this many
    # seconds, the backend sends "stop" on its behalf (see
    # services/control_service.py / services/telemetry_service.py).
    command_watchdog_seconds: float = 3.0

    # When the real board can't be reached, keep the demo/dashboard usable
    # with plausible simulated values instead of freezing the UI.
    simulation_mode: bool = True

    # --- Obstacle avoidance (ultrasonic sensor) ----------------------------
    obstacle_safe_distance_cm: float = 30.0

    # --- YOLO ----------------------------------------------------------------
    yolo_model: str = "yolov8n.pt"
    yolo_confidence_threshold: float = 0.4
    yolo_inference_interval_seconds: float = 0.5
    alert_on_classes: str = "person"
    alert_min_confidence: float = 0.6

    @property
    def cors_origin_list(self) -> list[str]:
        return [origin.strip() for origin in self.cors_origins.split(",") if origin.strip()]

    @property
    def alert_on_class_list(self) -> list[str]:
        return [name.strip().lower() for name in self.alert_on_classes.split(",") if name.strip()]


@lru_cache
def get_settings() -> Settings:
    """Settings are read once and cached -- restart the process to pick up changes."""
    return Settings()
