# Firmware

This is the ESP32 code from the project's original document, split into
proper buildable sketches, plus the minimum changes needed so the Python
backend can read every sensor it was asked to account for. **Not
compile-tested** in the environment this was built in (no ESP32 toolchain
available there) -- open each folder in PlatformIO or the Arduino IDE and
verify it builds before flashing real hardware.

## What changed vs. the original document, and why

| Change | Where | Why |
|---|---|---|
| WiFi station mode instead of access point | both sketches | Each board's original code calls `WiFi.softAP(...)`, which makes it its own isolated network. A single backend machine can only join one WiFi access point at a time, so it could never reach the ground module and the camera simultaneously. Both sketches now call `WiFi.begin(ssid, password)` to join **the same** existing WiFi network (home router, phone hotspot, travel router...) as the backend. The original access-point code is kept commented out for single-board testing. |
| GPS wired to GPIO16/17 instead of GPIO25/26 | `ground_module.ino` | The standalone GPS test sketch used GPIO25/26, but the ground module already uses those two pins for `IN4`/`IN3` (L298N). Combining GPS onto the same board (it makes sense to -- the GPS rides on the rover) needed a conflict-free pair; GPIO16/17 is ESP32's default UART2 and is free in this wiring. |
| `GET /telemetrie` route | `ground_module.ino` | Merges the ultrasonic distance and the GPS fix into one JSON response, so the backend needs one HTTP call per cycle instead of stitching together two data sources that didn't previously share a transport. |
| Optional `?vitesse=0-255` on `/avant /arriere /gauche /droite` | `ground_module.ino` | `ENA`/`ENB` were already wired to PWM channels in the original code, but nothing ever called `ledcWrite` on them -- so the motors only ever ran at whatever the pins defaulted to. This makes the analog joystick's magnitude actually control speed, not just direction. Calling a route with no `vitesse` behaves exactly as before (full speed). |

Everything else -- pin assignments, the L298N logic, the ultrasonic
safety cutoff, the camera configuration, the `/capture` route, the HTML
control pages -- is unchanged.

## Wiring summary (ground module)

| Function | GPIO |
|---|---|
| L298N IN1 / IN2 / IN3 / IN4 | 14 / 27 / 26 / 25 |
| L298N ENA / ENB (PWM) | 32 / 33 |
| Ultrasonic TRIG / ECHO | 5 / 18 |
| GPS RX2 / TX2 (NEO-M8N) | 16 / 17 |

GPS wiring: **GPS TX -> ESP32 GPIO16**, **GPS RX -> ESP32 GPIO17**.

## Setting IPs the backend can reach

1. Flash both boards with your real WiFi credentials in place of
   `VOTRE_RESEAU_WIFI` / `VOTRE_MOT_DE_PASSE`.
2. Open the serial monitor for each board at 115200 baud; once connected
   it prints its IP address on the network.
3. Put those two addresses in the backend's `.env`:
   ```
   GROUND_MODULE_BASE_URL=http://<ip du module terrestre>
   CAMERA_MODULE_BASE_URL=http://<ip de l'ESP32-CAM>
   ```

If a board can't be reached, the backend automatically falls back to
simulated telemetry / a placeholder video frame (see `SIMULATION_MODE`
in the backend's `.env.example`) instead of leaving the dashboard blank.

## Flying (AERIEN) mode

The provided hardware only covers ground movement, the camera, and GPS
-- there's no flight-controller code to integrate against yet. The
backend's control API already recognizes `drone.mode == AERIEN` and
responds with a clear "no flight controller connected" message instead
of pretending to move anything (see `app/services/control_service.py`).
Wiring up a real flight controller (e.g. a separate board speaking
MAVLink) would plug in at that same point.
