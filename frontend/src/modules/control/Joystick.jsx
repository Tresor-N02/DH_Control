import { useCallback, useEffect, useRef, useState } from "react";
import { TriangleAlert } from "lucide-react";

import { useDrone } from "../../context/DroneContext";

const RADIUS = 50; // px the knob can travel from center
const SEND_INTERVAL_MS = 120; // how often we re-send while held, for the watchdog

// Turns a normalized (-1..1, -1..1) vector into one of the four discrete
// directions the ground module firmware actually understands, plus a
// 0-100 speed from how far the stick is pushed. Dominant axis wins --
// the firmware can't blend "forward" and "turn" into one motion.
function vectorToCommand(nx, ny) {
  const magnitude = Math.min(1, Math.hypot(nx, ny));
  if (magnitude < 0.12) return { action: "stop", speed: 0 };

  const action =
    Math.abs(ny) >= Math.abs(nx) ? (ny < 0 ? "avancer" : "reculer") : nx < 0 ? "gauche" : "droite";

  return { action, speed: Math.round(magnitude * 100) };
}

const LABELS = {
  avancer: "Avancer",
  reculer: "Reculer",
  gauche: "Gauche",
  droite: "Droite",
  stop: "Stop",
};

export default function Joystick() {
  const { sendCommand, stop, obstacleDetected, distanceObstacle } = useDrone();

  const baseRef = useRef(null);
  const lastSentRef = useRef(0);

  const [isDragging, setIsDragging] = useState(false);
  const [knob, setKnob] = useState({ x: 0, y: 0 });
  const [current, setCurrent] = useState({ action: "stop", speed: 0 });

  const dispatch = useCallback(
    (action, speed, { force = false } = {}) => {
      const now = performance.now();
      if (!force && now - lastSentRef.current < SEND_INTERVAL_MS) return;
      lastSentRef.current = now;
      sendCommand(action, speed);
    },
    [sendCommand]
  );

  const updateFromClientPoint = useCallback(
    (clientX, clientY) => {
      const base = baseRef.current;
      if (!base) return;
      const rect = base.getBoundingClientRect();
      const cx = rect.left + rect.width / 2;
      const cy = rect.top + rect.height / 2;

      let dx = clientX - cx;
      let dy = clientY - cy;
      const dist = Math.hypot(dx, dy);
      if (dist > RADIUS) {
        dx = (dx / dist) * RADIUS;
        dy = (dy / dist) * RADIUS;
      }
      setKnob({ x: dx, y: dy });

      const { action, speed } = vectorToCommand(dx / RADIUS, dy / RADIUS);
      setCurrent({ action, speed });
      dispatch(action, speed);
    },
    [dispatch]
  );

  // Window-level listeners only exist while actually dragging, and are
  // torn down the instant `isDragging` goes false -- driven entirely by
  // state, so there's nothing for the render to read out of a ref.
  useEffect(() => {
    if (!isDragging) return undefined;

    const handleMove = (event) => {
      const point = event.touches ? event.touches[0] : event;
      updateFromClientPoint(point.clientX, point.clientY);
    };
    const handleUp = () => {
      setIsDragging(false);
      setKnob({ x: 0, y: 0 });
      setCurrent({ action: "stop", speed: 0 });
      dispatch("stop", 0, { force: true });
    };

    window.addEventListener("pointermove", handleMove);
    window.addEventListener("pointerup", handleUp);
    window.addEventListener("pointercancel", handleUp);

    return () => {
      window.removeEventListener("pointermove", handleMove);
      window.removeEventListener("pointerup", handleUp);
      window.removeEventListener("pointercancel", handleUp);
    };
  }, [isDragging, updateFromClientPoint, dispatch]);

  function handlePointerDown(event) {
    setIsDragging(true);
    updateFromClientPoint(event.clientX, event.clientY);
  }

  // ==========================
  // CONTROLE CLAVIER (conservé)
  // ==========================
  useEffect(() => {
    const KEY_ACTIONS = {
      ArrowUp: "avancer",
      ArrowDown: "reculer",
      ArrowLeft: "gauche",
      ArrowRight: "droite",
    };

    const handleKeyDown = (event) => {
      if (event.key === " ") {
        event.preventDefault();
        stop();
        return;
      }
      const action = KEY_ACTIONS[event.key];
      if (!action) return;
      event.preventDefault();
      setCurrent({ action, speed: 100 });
      dispatch(action, 100, { force: true });
    };

    const handleKeyUp = (event) => {
      if (KEY_ACTIONS[event.key]) {
        setCurrent({ action: "stop", speed: 0 });
        dispatch("stop", 0, { force: true });
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
    };
  }, [dispatch, stop]);

  const blockedForward = obstacleDetected && current.action === "avancer";

  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900 p-3">
      <h3 className="mb-2 text-sm font-semibold">Contrôle du drone</h3>

      <div className="flex flex-col items-center">
        <div
          ref={baseRef}
          onPointerDown={handlePointerDown}
          className="relative h-[120px] w-[120px] touch-none select-none rounded-full border border-slate-700 bg-slate-800"
        >
          {/* directional guides */}
          <div className="absolute inset-0 flex items-center justify-center text-[10px] text-slate-500">
            <span className="absolute top-2">AVANT</span>
            <span className="absolute bottom-2">ARRIÈRE</span>
            <span className="absolute left-2">G</span>
            <span className="absolute right-2">D</span>
          </div>

          <div
            className={`absolute left-1/2 top-1/2 h-10 w-10 rounded-full border-2 shadow-lg ${
              blockedForward
                ? "border-red-400 bg-red-500/80"
                : current.action !== "stop"
                ? "border-cyan-300 bg-cyan-500"
                : "border-cyan-600 bg-cyan-700"
            }`}
            style={{
              transform: `translate(-50%, -50%) translate(${knob.x}px, ${knob.y}px)`,
              transition: isDragging ? "none" : "transform 150ms ease-out",
            }}
          />
        </div>

        <div className="mt-2 flex h-4 items-center gap-2 text-xs">
          {blockedForward ? (
            <span className="flex items-center gap-1 font-semibold text-red-400">
              <TriangleAlert size={14} />
              Obstacle à {distanceObstacle != null ? `${Math.round(distanceObstacle)} cm` : "proximité"}
            </span>
          ) : (
            <span className="text-slate-400">
              {LABELS[current.action]}
              {current.action !== "stop" ? ` · ${current.speed}%` : ""}
            </span>
          )}
        </div>
      </div>

      <button
        onClick={stop}
        className="mt-2 h-9 w-full rounded-xl bg-red-600 text-sm font-semibold transition-all hover:bg-red-500 active:scale-95"
      >
        STOP
      </button>

      <div className="mt-2 text-center text-[11px] text-slate-400">
        Glisser le joystick, ou clavier : ↑ ↓ ← → &nbsp;|&nbsp; Espace = STOP
      </div>
    </div>
  );
}
