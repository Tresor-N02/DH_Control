"""
Entrypoint. Run with:

    uvicorn app.main:app --reload --host 0.0.0.0 --port 8000

On startup this creates the DB tables if they don't exist yet (handy
for the default SQLite setup; a no-op against a MySQL database already
built from database/op_control_database_extended.sql) and starts one
telemetry loop + one video loop per drone currently in the database, so
the dashboard has something to show the moment the frontend connects.
"""

import asyncio
import logging

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from .config import get_settings
from .database import Base, SessionLocal, engine
from .models import Camera, Drone
from .routers import alerts, auth, control, drones, history, missions, telemetry, video, ws
from .services.telemetry_service import telemetry_loop
from .services.video_service import video_loop

logging.basicConfig(level=logging.INFO, format="%(asctime)s %(levelname)s %(name)s: %(message)s")
logger = logging.getLogger("dh_mil.main")

settings = get_settings()

app = FastAPI(title="DH_MIL - Drone Hybride API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origin_list,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router)
app.include_router(drones.router)
app.include_router(missions.router)
app.include_router(telemetry.router)
app.include_router(control.router)
app.include_router(video.router)
app.include_router(alerts.router)
app.include_router(history.router)
app.include_router(ws.router)

_background_tasks: list[asyncio.Task] = []


@app.on_event("startup")
async def on_startup() -> None:
    Base.metadata.create_all(bind=engine)

    db = SessionLocal()
    try:
        all_drones = db.query(Drone).all()
        for drone in all_drones:
            _background_tasks.append(asyncio.create_task(telemetry_loop(drone.id_drone)))
            camera = db.query(Camera).filter(Camera.id_drone == drone.id_drone).first()
            if camera is not None:
                _background_tasks.append(asyncio.create_task(video_loop(drone.id_drone, camera.id_camera)))
        logger.info(
            "Started %d background loop(s) for %d drone(s).", len(_background_tasks), len(all_drones)
        )
        if not all_drones:
            logger.warning(
                "No drone in the database yet -- run `python seed.py` to create the default "
                "'Drone Hybride 01' + camera, matching the provided schema's expected data."
            )
    finally:
        db.close()


@app.on_event("shutdown")
async def on_shutdown() -> None:
    for task in _background_tasks:
        task.cancel()
    await asyncio.gather(*_background_tasks, return_exceptions=True)


@app.get("/api/health", tags=["health"])
def health():
    return {"status": "ok", "simulation_mode": settings.simulation_mode}
