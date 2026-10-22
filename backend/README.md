# DH_MIL -- Backend (Drone Hybride)

Python/FastAPI backend for the hybrid ground/air drone dashboard: talks
to the ESP32 ground module (movement + ultrasonic obstacle avoidance)
and the ESP32-CAM (video), runs a pretrained YOLO model on the video
feed, stores everything against the provided `op_control` schema, and
pushes live updates to the frontend over WebSocket.

Python was chosen over Node specifically because of YOLO: `ultralytics`
is the standard way to run it, and it's a first-class Python library.

## Why FastAPI, and how this is organized

```
app/
  config.py            settings (.env-driven)
  database.py           SQLAlchemy engine/session
  models.py               ORM models -- match database/*.sql exactly
  schemas.py                Pydantic request/response shapes
  security.py                 password hashing (bcrypt) + JWT + current-user dependency
  ws_manager.py                  one WebSocket "room" per drone
  routers/
    auth.py     register / login / me
    drones.py    list/get, mode + etat updates
    missions.py   CRUD + demarrer()/terminer() (matches the class diagram)
    telemetry.py   latest + history
    control.py      REST fallback for joystick commands
    video.py          recent detections + detector status
    alerts.py           list + mark read/handled
    history.py           audit log
    ws.py                  the realtime endpoint: /ws/drone/{id}
  services/
    esp32_client.py    HTTP clients for the two ESP32 boards
    obstacle.py          shared "is this too close to move forward" check
    simulator.py           fallback data when a board is unreachable
    telemetry_service.py     background loop: poll -> persist -> broadcast
    video_service.py           background loop: poll -> YOLO -> persist -> broadcast
    control_service.py           turns a requested action into an outcome
    yolo_detector.py                lazy-loaded YOLO wrapper
firmware/                 the ESP32 sketches (see firmware/README.md)
database/                 the provided schema + an additive extension
seed.py                   creates a default admin + the hybrid drone
```

## Setup

```bash
cd backend
python3 -m venv venv && source venv/bin/activate      # optional but recommended
pip install -r requirements.txt
cp .env.example .env                                   # then edit as needed
python seed.py                                          # creates admin user + drone + camera
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

Default login after seeding: `admin@dh-mil.local` / `ChangeMe123!` --
**change this password** (or the user outright) before exposing the API
beyond your own machine.

Interactive API docs once running: `http://localhost:8000/docs`.

### Database: SQLite by default, MySQL when you're ready

`DATABASE_URL` defaults to a local SQLite file so the whole stack runs
with zero setup. To use the schema as actually provided/extended:

```
DATABASE_URL=mysql+pymysql://user:password@localhost:3306/op_control
```

then load `database/op_control_database_extended.sql` (or, if you
already created the database from the original file, the `ALTER TABLE`
statements in that same file's header comment) before starting the
API.

### Connecting the real hardware

See `firmware/README.md` -- in short: flash both ESP32 boards in
station mode (joining your WiFi, not creating their own), then point
`GROUND_MODULE_BASE_URL` / `CAMERA_MODULE_BASE_URL` in `.env` at their
IPs. Until then, `SIMULATION_MODE=true` (the default) keeps the
dashboard usable with plausible fake data, clearly marked as such in
every WebSocket message (`"simulated": true`).

### YOLO

`pip install -r requirements.txt` installs `ultralytics`, which pulls
in `torch`/`torchvision` on first install (roughly 1-2 GB; the CPU
build is fine, no GPU required for `yolov8n`). The first time the
detector actually runs, `ultralytics` downloads the pretrained
`yolov8n.pt` weights (~6 MB) automatically -- that first run needs
internet access.

**This part specifically wasn't executable in the sandbox this backend
was built in** (disk/network constraints prevented installing the full
torch stack there -- see the comment at the top of
`app/services/yolo_detector.py`). Everything around it (the REST API,
auth, DB, WebSocket, obstacle logic, simulation fallback) was tested
end-to-end there and works; please smoke-test the detector specifically
after `pip install`, e.g.:

```bash
python -c "from app.services.yolo_detector import get_detector; d = get_detector(); print(d.is_available(), d.load_error())"
```

If `ultralytics` isn't installed (or hasn't finished downloading
weights), the rest of the app still runs -- `/api/video/status` and
every video WebSocket message report `detector_available: false`
instead of crashing, so the frontend can show that clearly rather than
silently displaying zero detections as if that were a real result.

## Realtime protocol -- `/ws/drone/{id}?token=...`

One socket per drone carries everything:

```jsonc
// server -> client
{"type": "telemetry", "data": {"batterie": 87.3, "latitude": -3.3822, "obstacle_detecte": false, ...}}
{"type": "frame", "data": {"image_base64": "...", "detections": [{"objet": "personne", "confiance": 0.91, "x": 0.42, "y": 0.10, "w": 0.2, "h": 0.5}], "detector_available": true}}
{"type": "alerte", "data": {"type": "OBSTACLE", "message": "Obstacle détecté à 18 cm", "statut": "NOUVELLE"}}
{"type": "connection", "data": {"connected": true, "simulated": false}}

// client -> server
{"type": "command", "action": "avancer"}   // avancer | reculer | gauche | droite | stop
```

`x/y/w/h` on a detection are normalized (0..1, relative to the frame),
so the frontend positions boxes with plain CSS percentages regardless
of the actual video resolution.

The `token` query param is optional in this build -- if present it's
verified and the resulting user is attached to the logged command; if
absent the connection is still accepted (meant for a private control
network) but commands are logged without a user. **Require it** before
running this anywhere but a local/trusted network.

## Safety note on obstacle avoidance

The ESP32 firmware already refuses to move forward when its own
ultrasonic sensor reads too close (kept exactly as originally written).
The backend adds a second, independent check against the last stored
reading before it even sends a movement command (`services/control_service.py`)
-- this is a defense-in-depth addition, not a replacement for the
firmware's own check, so a stale in-flight command or a client that
bypasses the backend entirely still can't be waved through by the
backend pretending everything's clear.

## Known gaps / things to double check

- **AERIEN (flight) mode has no backing hardware.** Only ground
  movement, ultrasonic, GPS and the camera were specified. Sending a
  command while `mode = AERIEN` returns a clear "no flight controller
  connected" response rather than pretending to fly.
- **YOLO wasn't runtime-tested here** (see above) -- please verify
  after installing.
- **WebSocket auth is minimal** by design for a local network; harden
  before exposing this beyond one.
- Passwords are hashed with `bcrypt` directly (not via `passlib`) --
  see the comment in `requirements.txt` if you're wondering why.
