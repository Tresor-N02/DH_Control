"""
ORM models.

These map 1:1 onto the tables in `database/op_control_database_extended.sql`
(the schema supplied for this project, database/op_control_database.sql,
plus two small additive column sets), column names included, so the
French field names here are intentional and match the SQL. See that
file's header comment for exactly what was added and why.
"""

import enum
from datetime import datetime

from sqlalchemy import (
    CheckConstraint,
    DateTime,
    Enum,
    ForeignKey,
    Numeric,
    String,
    func,
)
from sqlalchemy.orm import Mapped, mapped_column, relationship

from .database import Base


class RoleUtilisateur(str, enum.Enum):
    OPERATEUR = "OPERATEUR"
    ADMIN = "ADMIN"


class EtatDrone(str, enum.Enum):
    ARRETE = "ARRETE"
    PRET = "PRET"
    EN_VOL = "EN_VOL"
    EN_DEPLACEMENT = "EN_DEPLACEMENT"
    EN_MISSION = "EN_MISSION"
    ERREUR = "ERREUR"


class ModeDrone(str, enum.Enum):
    AERIEN = "AERIEN"
    TERRESTRE = "TERRESTRE"


class EtatCamera(str, enum.Enum):
    ACTIVE = "ACTIVE"
    INACTIVE = "INACTIVE"
    ERREUR = "ERREUR"


class StatutMission(str, enum.Enum):
    PLANIFIEE = "PLANIFIEE"
    EN_COURS = "EN_COURS"
    TERMINEE = "TERMINEE"
    ANNULEE = "ANNULEE"


class StatutAlerte(str, enum.Enum):
    NOUVELLE = "NOUVELLE"
    LUE = "LUE"
    TRAITEE = "TRAITEE"


class Utilisateur(Base):
    __tablename__ = "utilisateur"

    id_utilisateur: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    nom: Mapped[str] = mapped_column(String(100))
    email: Mapped[str] = mapped_column(String(150), unique=True)
    password: Mapped[str] = mapped_column(String(255))
    role: Mapped[RoleUtilisateur] = mapped_column(
        Enum(RoleUtilisateur, native_enum=False, length=20), default=RoleUtilisateur.OPERATEUR
    )

    historique: Mapped[list["Historique"]] = relationship(back_populates="utilisateur")


class Drone(Base):
    __tablename__ = "drone"

    id_drone: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    nom: Mapped[str] = mapped_column(String(100))
    etat: Mapped[EtatDrone] = mapped_column(
        Enum(EtatDrone, native_enum=False, length=20), default=EtatDrone.ARRETE
    )
    mode: Mapped[ModeDrone] = mapped_column(
        Enum(ModeDrone, native_enum=False, length=20), default=ModeDrone.AERIEN
    )

    camera: Mapped["Camera"] = relationship(back_populates="drone", uselist=False, cascade="all, delete-orphan")
    missions: Mapped[list["Mission"]] = relationship(back_populates="drone")
    telemetrie: Mapped[list["Telemetrie"]] = relationship(back_populates="drone", cascade="all, delete-orphan")
    alertes: Mapped[list["Alerte"]] = relationship(back_populates="drone", cascade="all, delete-orphan")


class Camera(Base):
    __tablename__ = "camera"

    id_camera: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    id_drone: Mapped[int] = mapped_column(ForeignKey("drone.id_drone", ondelete="CASCADE"), unique=True)
    resolution: Mapped[str] = mapped_column(String(50))
    stream_url: Mapped[str | None] = mapped_column(String(500), nullable=True)
    etat: Mapped[EtatCamera] = mapped_column(
        Enum(EtatCamera, native_enum=False, length=20), default=EtatCamera.INACTIVE
    )

    drone: Mapped["Drone"] = relationship(back_populates="camera")
    detections: Mapped[list["Detection"]] = relationship(back_populates="camera", cascade="all, delete-orphan")


class Mission(Base):
    __tablename__ = "mission"

    id_mission: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    id_drone: Mapped[int] = mapped_column(ForeignKey("drone.id_drone", ondelete="RESTRICT"), index=True)
    titre: Mapped[str] = mapped_column(String(150))
    statut: Mapped[StatutMission] = mapped_column(
        Enum(StatutMission, native_enum=False, length=20), default=StatutMission.PLANIFIEE
    )
    date_debut: Mapped[datetime | None] = mapped_column(DateTime, nullable=True)
    date_fin: Mapped[datetime | None] = mapped_column(DateTime, nullable=True)

    drone: Mapped["Drone"] = relationship(back_populates="missions")
    historique: Mapped[list["Historique"]] = relationship(back_populates="mission")


class Telemetrie(Base):
    __tablename__ = "telemetrie"

    id_telemetrie: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    id_drone: Mapped[int] = mapped_column(ForeignKey("drone.id_drone", ondelete="CASCADE"), index=True)
    batterie: Mapped[float] = mapped_column(Numeric(5, 2))
    altitude: Mapped[float] = mapped_column(Numeric(10, 2), default=0)
    vitesse: Mapped[float] = mapped_column(Numeric(10, 2), default=0)
    temperature: Mapped[float | None] = mapped_column(Numeric(6, 2), nullable=True)
    signal: Mapped[int | None] = mapped_column(nullable=True)
    longitude: Mapped[float | None] = mapped_column(Numeric(11, 8), nullable=True)
    latitude: Mapped[float | None] = mapped_column(Numeric(10, 8), nullable=True)
    date_heure: Mapped[datetime] = mapped_column(DateTime, server_default=func.now())

    # --- Additive fields: ultrasonic sensor readings (not in the original schema) ---
    distance_obstacle: Mapped[float | None] = mapped_column(Numeric(6, 2), nullable=True)
    obstacle_detecte: Mapped[bool] = mapped_column(default=False)

    drone: Mapped["Drone"] = relationship(back_populates="telemetrie")


class Detection(Base):
    __tablename__ = "detection"
    __table_args__ = (CheckConstraint("confiance >= 0 AND confiance <= 1", name="chk_detection_confiance"),)

    id_detection: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    id_camera: Mapped[int] = mapped_column(ForeignKey("camera.id_camera", ondelete="CASCADE"), index=True)
    objet: Mapped[str] = mapped_column(String(100))
    confiance: Mapped[float] = mapped_column(Numeric(5, 4))
    date_detection: Mapped[datetime] = mapped_column(DateTime, server_default=func.now())

    # --- Additive fields: normalized bounding box, so the frontend can draw an
    # overlay without re-running detection client side. 0..1 relative to frame.
    bbox_x: Mapped[float | None] = mapped_column(Numeric(6, 5), nullable=True)
    bbox_y: Mapped[float | None] = mapped_column(Numeric(6, 5), nullable=True)
    bbox_w: Mapped[float | None] = mapped_column(Numeric(6, 5), nullable=True)
    bbox_h: Mapped[float | None] = mapped_column(Numeric(6, 5), nullable=True)

    camera: Mapped["Camera"] = relationship(back_populates="detections")
    alertes: Mapped[list["Alerte"]] = relationship(back_populates="detection")


class Alerte(Base):
    __tablename__ = "alerte"

    id_alerte: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    id_drone: Mapped[int] = mapped_column(ForeignKey("drone.id_drone", ondelete="CASCADE"), index=True)
    id_detection: Mapped[int | None] = mapped_column(
        ForeignKey("detection.id_detection", ondelete="SET NULL"), nullable=True
    )
    type: Mapped[str] = mapped_column(String(80))
    message: Mapped[str] = mapped_column(String(255))
    date_alerte: Mapped[datetime] = mapped_column(DateTime, server_default=func.now())
    statut: Mapped[StatutAlerte] = mapped_column(
        Enum(StatutAlerte, native_enum=False, length=20), default=StatutAlerte.NOUVELLE
    )

    drone: Mapped["Drone"] = relationship(back_populates="alertes")
    detection: Mapped["Detection | None"] = relationship(back_populates="alertes")


class Historique(Base):
    __tablename__ = "historique"

    id_historique: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    id_utilisateur: Mapped[int | None] = mapped_column(
        ForeignKey("utilisateur.id_utilisateur", ondelete="SET NULL"), nullable=True
    )
    id_drone: Mapped[int | None] = mapped_column(ForeignKey("drone.id_drone", ondelete="SET NULL"), nullable=True)
    id_mission: Mapped[int | None] = mapped_column(
        ForeignKey("mission.id_mission", ondelete="SET NULL"), nullable=True
    )
    action: Mapped[str] = mapped_column(String(255))
    date_action: Mapped[datetime] = mapped_column(DateTime, server_default=func.now())

    utilisateur: Mapped["Utilisateur | None"] = relationship(back_populates="historique")
    mission: Mapped["Mission | None"] = relationship(back_populates="historique")
