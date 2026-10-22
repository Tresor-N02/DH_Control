# DH_MIL -- Frontend

React 19 + Vite + Tailwind 4 ground-control dashboard for the hybrid
drone: analog joystick, live telemetry, GPS map, and the ESP32-CAM feed
with YOLO detection overlays -- all driven by the [backend](../backend),
not simulated.

## Setup

```bash
npm install
cp .env.example .env      # only needed if the backend isn't on localhost:8000
npm run dev
```

Then open `http://localhost:5173` and log in with the account `python
seed.py` created on the backend (default `admin@dh-mil.local` /
`ChangeMe123!`).

`npm run build` produces a static `dist/` you can serve with anything
(nginx, `serve`, etc.) -- just make sure `VITE_API_URL`/`VITE_WS_URL`
are set correctly at build time for wherever the backend actually runs.

## What changed from the original mock

The project already had a solid dashboard scaffold (`DroneContext`,
telemetry cards, the Leaflet map, the video panel), but everything was
simulated client-side and there was no `services/` layer at all. This
pass:

- Added `services/api.js` (REST) and `services/socket.js` (the
  realtime WebSocket, one connection per drone, with auto-reconnect).
- Added `context/AuthContext.jsx` + `pages/LoginPage.jsx` -- the
  backend requires a JWT on every route (and the project's own class
  diagram already specified `Utilisateur.login()/logout()`), so this
  was missing rather than optional.
- Rewrote `context/DroneContext.jsx` to source every field from the
  backend instead of a `setInterval` simulation, while keeping the
  exact same field names, so `BatteryCard`, `GPSCard`, `AltitudeCard`,
  `SpeedCard`, `SignalCard`, `MapCard`/`LeafletMap` and `ActionButtons`
  needed **no changes at all**. Numeric telemetry holds its last known
  value rather than resetting to 0 on disconnect (a ground-control
  display that suddenly shows "0% battery" during a dropout would be
  actively misleading) -- the separate `connected`/`simulated` flags
  are what tell the operator the link state.
- Rebuilt `Joystick.jsx` as an actual analog joystick (drag or arrow
  keys) that sends a real 0-100% speed, instead of a directional
  button grid. It also shows a red obstacle warning fed directly by the
  ultrasonic reading.
- Wired `VideoFeed`/`VideoOverlay`/`RecordingBadge` to the real
  ESP32-CAM frames and YOLO detections relayed by the backend (was: one
  static stock photo and two hardcoded detection boxes).
- Added `modules/telemetry/ObstacleCard.jsx` -- the one sensor reading
  (ultrasonic distance) that didn't already have a place on the
  dashboard.
- `Navbar` now reflects real connection/simulation/battery state and
  has a working alerts bell + logout, instead of static always-green
  icons.

## Structure

```
src/
  services/        api.js (REST), socket.js (WebSocket)
  context/          AuthContext, DroneContext -- both consumed via useAuth()/useDrone()
  pages/             LoginPage, Dashboard
  modules/
    control/           Joystick (analog), FlightModeSelector, ActionButtons
    telemetry/          Battery/GPS/Altitude/Speed/Signal/ObstacleCard
    map/                 LeafletMap, MapCard
    video/                VideoFeed, VideoOverlay, DetectionBox, RecordingBadge
  components/
    layout/    MainLayout, Navbar, Sidebar, Footer
    common/     Card, CardHeader, CardBody
```

## Known gaps

- Only one drone is supported end-to-end (the project seeds exactly
  one, "Drone Hybride 01"); `DroneContext` picks `drones[0]`. Multiple
  drones would need a picker.
- `returnHome()` sends a plain stop, with a message explaining why --
  there's no waypoint navigation on the backend/firmware to actually
  return home with.
- The `Sidebar`'s other menu items (Missions, Médical, Historique,
  Paramètres) are still decorative; only the Dashboard route is wired
  up, matching what was actually asked for. The backend already has
  REST endpoints for missions/history/alerts if you want to build
  those screens next.
