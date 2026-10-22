"""Pydantic (v2) schemas -- request validation and response shaping."""

from datetime import datetime
from typing import Literal

from pydantic import BaseModel, ConfigDict, EmailStr, Field

from .models import EtatCamera, EtatDrone, ModeDrone, RoleUtilisateur, StatutAlerte, StatutMission

# ======================================================================
# Auth
# ======================================================================


class UserCreate(BaseModel):
    nom: str
    email: EmailStr
    password: str = Field(min_length=8)
    role: RoleUtilisateur = RoleUtilisateur.OPERATEUR


class UserLogin(BaseModel):
    email: EmailStr
    password: str


class UserOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id_utilisateur: int
    nom: str
    email: str
    role: RoleUtilisateur


class Token(BaseModel):
    access_token: str
    token_type: Literal["bearer"] = "bearer"
    user: UserOut


# ======================================================================
# Drone
# ======================================================================


class DroneOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id_drone: int
    nom: str
    etat: EtatDrone
    mode: ModeDrone


class DroneModeUpdate(BaseModel):
    mode: ModeDrone


class DroneEtatUpdate(BaseModel):
    etat: EtatDrone


# ======================================================================
# Ground control command (the joystick lands here)
# ======================================================================

CommandAction = Literal["avancer", "reculer", "gauche", "droite", "stop"]


class CommandRequest(BaseModel):
    action: CommandAction
    # 0-100 (percentage); converted to the firmware's 0-255 PWM duty cycle
    # in services/esp32_client.py. See firmware/ground_module -- /avant
    # /arriere /gauche /droite now take an optional ?vitesse=0-255.
    speed: int | None = Field(default=None, ge=0, le=100)


class CommandResponse(BaseModel):
    action: CommandAction
    executed: bool
    blocked_reason: str | None = None
    distance_obstacle_cm: float | None = None


# ======================================================================
# Telemetry ingestion (from the ESP32 ground module / GPS relay)
# ======================================================================


class UltrasonicIngest(BaseModel):
    distance_cm: float = Field(ge=0)


class GPSIngest(BaseModel):
    latitude: float = Field(ge=-90, le=90)
    longitude: float = Field(ge=-180, le=180)
    altitude: float | None = None
    vitesse: float | None = None
    satellites: int | None = None
    fix: bool = True


class TelemetryOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id_telemetrie: int
    id_drone: int
    batterie: float
    altitude: float
    vitesse: float
    temperature: float | None
    signal: int | None
    latitude: float | None
    longitude: float | None
    distance_obstacle: float | None
    obstacle_detecte: bool
    date_heure: datetime


# ======================================================================
# Detections (YOLO output)
# ======================================================================


class DetectionOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id_detection: int
    id_camera: int
    objet: str
    confiance: float
    bbox_x: float | None
    bbox_y: float | None
    bbox_w: float | None
    bbox_h: float | None
    date_detection: datetime


# ======================================================================
# Missions
# ======================================================================


class MissionCreate(BaseModel):
    titre: str


class MissionOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id_mission: int
    id_drone: int
    titre: str
    statut: StatutMission
    date_debut: datetime | None
    date_fin: datetime | None


# ======================================================================
# Alerts
# ======================================================================


class AlerteOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id_alerte: int
    id_drone: int
    id_detection: int | None
    type: str
    message: str
    date_alerte: datetime
    statut: StatutAlerte


class AlerteStatutUpdate(BaseModel):
    statut: StatutAlerte


# ======================================================================
# History / audit log
# ======================================================================


class HistoriqueOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id_historique: int
    id_utilisateur: int | None
    id_drone: int | None
    id_mission: int | None
    action: str
    date_action: datetime


# ======================================================================
# Camera
# ======================================================================


class CameraOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id_camera: int
    id_drone: int
    resolution: str
    stream_url: str | None
    etat: EtatCamera
