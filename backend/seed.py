"""
One-time convenience script: creates the tables (if needed) and seeds
a default admin user + the hybrid drone + its camera, so the API and
the frontend have something to point at immediately.

    python seed.py

Safe to re-run: it checks for existing rows first.
"""

from app.database import Base, SessionLocal, engine
from app.models import Camera, Drone, EtatCamera, EtatDrone, ModeDrone, RoleUtilisateur, Utilisateur
from app.security import hash_password

DEFAULT_ADMIN_EMAIL = "admin@dh-mil.local"
DEFAULT_ADMIN_PASSWORD = "ChangeMe123!"


def run() -> None:
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()
    try:
        if not db.query(Utilisateur).filter(Utilisateur.email == DEFAULT_ADMIN_EMAIL).first():
            db.add(
                Utilisateur(
                    nom="Administrateur",
                    email=DEFAULT_ADMIN_EMAIL,
                    password=hash_password(DEFAULT_ADMIN_PASSWORD),
                    role=RoleUtilisateur.ADMIN,
                )
            )
            print(f"Utilisateur admin créé : {DEFAULT_ADMIN_EMAIL} / {DEFAULT_ADMIN_PASSWORD}  (à changer !)")
        else:
            print("Utilisateur admin déjà présent, inchangé.")

        drone = db.query(Drone).first()
        if drone is None:
            drone = Drone(nom="Drone Hybride 01", etat=EtatDrone.PRET, mode=ModeDrone.TERRESTRE)
            db.add(drone)
            db.flush()
            db.add(
                Camera(
                    id_drone=drone.id_drone,
                    resolution="800x600",
                    stream_url=None,
                    etat=EtatCamera.ACTIVE,
                )
            )
            print(f"Drone créé : {drone.nom} (id={drone.id_drone}) + caméra associée.")
        else:
            print(f"Un drone existe déjà : {drone.nom} (id={drone.id_drone}), rien ajouté.")

        db.commit()
    finally:
        db.close()


if __name__ == "__main__":
    run()
