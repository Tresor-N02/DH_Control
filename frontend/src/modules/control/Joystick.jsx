import { Box, Stack, Typography, Button, Paper } from "@mui/material";
import { useCallback, useEffect, useRef, useState } from "react";
import { TriangleAlert } from "lucide-react";
import { useDrone } from "../../context/useDrone";
const RADIUS = 50; // px the knob can travel from center
const SEND_INTERVAL_MS = 120; // how often we re-send while held, for the watchdog

// Turns a normalized (-1..1, -1..1) vector into one of the four discrete
// directions the ground module firmware actually understands, plus a
// 0-100 speed from how far the stick is pushed. Dominant axis wins --
// the firmware can't blend "forward" and "turn" into one motion.
function vectorToCommand(nx, ny) {
  const magnitude = Math.min(1, Math.hypot(nx, ny));
  if (magnitude < 0.12)
    return {
      action: "stop",
      speed: 0,
    };
  const action =
    Math.abs(ny) >= Math.abs(nx)
      ? ny < 0
        ? "avancer"
        : "reculer"
      : nx < 0
        ? "gauche"
        : "droite";
  return {
    action,
    speed: Math.round(magnitude * 100),
  };
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
  const [isDragging, setIsDragging] = useState(false);
  const [knob, setKnob] = useState({
    x: 0,
    y: 0,
  });
  const [current, setCurrent] = useState({
    action: "stop",
    speed: 0,
  });
  const baseRef = useRef(null);
  const lastSentRef = useRef(0);
  const heldRef = useRef({
    action: "stop",
    speed: 0,
  });
  const commandRef = useRef(sendCommand);
  useEffect(() => {
    commandRef.current = sendCommand;
  }, [sendCommand]);
  useEffect(() => {
    const halt = () => {
      heldRef.current = {
        action: "stop",
        speed: 0,
      };
      setIsDragging(false);
      setKnob({
        x: 0,
        y: 0,
      });
      setCurrent({
        action: "stop",
        speed: 0,
      });
      commandRef.current("stop", 0);
    };
    const visibility = () => {
      if (document.hidden) halt();
    };
    const timer = setInterval(() => {
      const held = heldRef.current;
      if (
        held.action !== "stop" &&
        commandRef.current(held.action, held.speed) === false
      ) {
        heldRef.current = {
          action: "stop",
          speed: 0,
        };
        setIsDragging(false);
        setKnob({
          x: 0,
          y: 0,
        });
        setCurrent({
          action: "stop",
          speed: 0,
        });
        commandRef.current("stop", 0);
      }
    }, SEND_INTERVAL_MS);
    const clearHeld = () => {
      heldRef.current = {
        action: "stop",
        speed: 0,
      };
      setIsDragging(false);
      setKnob({
        x: 0,
        y: 0,
      });
      setCurrent({
        action: "stop",
        speed: 0,
      });
    };
    window.addEventListener("drone-stop", clearHeld);
    window.addEventListener("blur", halt);
    window.addEventListener("pagehide", halt);
    document.addEventListener("visibilitychange", visibility);
    return () => {
      clearInterval(timer);
      window.removeEventListener("drone-stop", clearHeld);
      window.removeEventListener("blur", halt);
      window.removeEventListener("pagehide", halt);
      document.removeEventListener("visibilitychange", visibility);
      if (heldRef.current.action !== "stop") commandRef.current("stop", 0);
    };
  }, []);
  const dispatch = useCallback(
    (action, speed, { force = false } = {}) => {
      heldRef.current = {
        action,
        speed,
      };
      const now = performance.now();
      if (!force && now - lastSentRef.current < SEND_INTERVAL_MS) return;
      lastSentRef.current = now;
      if (sendCommand(action, speed) === false)
        heldRef.current = {
          action: "stop",
          speed: 0,
        };
    },
    [sendCommand],
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
      setKnob({
        x: dx,
        y: dy,
      });
      const { action, speed } = vectorToCommand(dx / RADIUS, dy / RADIUS);
      setCurrent({
        action,
        speed,
      });
      dispatch(action, speed);
    },
    [dispatch],
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
      setKnob({
        x: 0,
        y: 0,
      });
      setCurrent({
        action: "stop",
        speed: 0,
      });
      dispatch("stop", 0, {
        force: true,
      });
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
      if (
        event.target instanceof HTMLElement &&
        (event.target.isContentEditable ||
          ["INPUT", "TEXTAREA", "SELECT", "BUTTON"].includes(
            event.target.tagName,
          ))
      )
        return;
      if (event.key === " ") {
        event.preventDefault();
        heldRef.current = {
          action: "stop",
          speed: 0,
        };
        setCurrent({
          action: "stop",
          speed: 0,
        });
        stop();
        return;
      }
      const action = KEY_ACTIONS[event.key];
      if (!action) return;
      event.preventDefault();
      if (event.repeat) return;
      setCurrent({
        action,
        speed: 100,
      });
      dispatch(action, 100, {
        force: true,
      });
    };
    const handleKeyUp = (event) => {
      if (
        event.target instanceof HTMLElement &&
        (event.target.isContentEditable ||
          ["INPUT", "TEXTAREA", "SELECT", "BUTTON"].includes(
            event.target.tagName,
          ))
      )
        return;
      if (KEY_ACTIONS[event.key]) {
        setCurrent({
          action: "stop",
          speed: 0,
        });
        dispatch("stop", 0, {
          force: true,
        });
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
    <Paper
      variant="outlined"
      sx={{
        p: 2.5,
      }}
    >
      <Typography
        component="h3"
        variant="h6"
        sx={{
          mb: 2.5,
        }}
      >
        Contrôle du drone
      </Typography>
      <Stack
        spacing={2}
        sx={{
          alignItems: "center",
        }}
      >
        <Box
          ref={baseRef}
          onPointerDown={handlePointerDown}
          role="group"
          aria-label="Joystick tactile. Utilisez les flèches du clavier pour piloter et Espace pour arrêter."
          sx={{
            position: "relative",
            width: 160,
            height: 160,
            touchAction: "none",
            userSelect: "none",
            borderRadius: "50%",
            border: "1px solid",
            borderColor: "divider",
            bgcolor: "action.hover",
          }}
        >
          <Box
            sx={{
              position: "absolute",
              inset: 0,
              color: "text.secondary",
              pointerEvents: "none",
            }}
          >
            <Typography
              variant="caption"
              sx={{
                position: "absolute",
                top: 8,
                left: "50%",
                transform: "translateX(-50%)",
              }}
            >
              AVANT
            </Typography>
            <Typography
              variant="caption"
              sx={{
                position: "absolute",
                bottom: 8,
                left: "50%",
                transform: "translateX(-50%)",
              }}
            >
              ARRIÈRE
            </Typography>
            <Typography
              variant="caption"
              sx={{
                position: "absolute",
                left: 8,
                top: "50%",
                transform: "translateY(-50%)",
              }}
            >
              G
            </Typography>
            <Typography
              variant="caption"
              sx={{
                position: "absolute",
                right: 8,
                top: "50%",
                transform: "translateY(-50%)",
              }}
            >
              D
            </Typography>
          </Box>
          <Box
            sx={{
              position: "absolute",
              left: "50%",
              top: "50%",
              width: 40,
              height: 40,
              borderRadius: "50%",
              border: "2px solid",
              borderColor: blockedForward ? "error.light" : "secondary.main",
              bgcolor: blockedForward
                ? "error.main"
                : current.action !== "stop"
                  ? "primary.light"
                  : "primary.main",
              boxShadow: 2,
              transform: `translate(-50%, -50%) translate(${knob.x}px, ${knob.y}px)`,
              transition: isDragging ? "none" : "transform 150ms ease-out",
            }}
          />
        </Box>
        <Box
          sx={{
            minHeight: 24,
          }}
        >
          {blockedForward ? (
            <Stack
              direction="row"
              spacing={0.5}
              sx={{
                alignItems: "center",
                color: "error.main",
              }}
            >
              <TriangleAlert size={16} />
              <Typography
                variant="body2"
                sx={{
                  fontWeight: 600,
                }}
              >
                Obstacle à{" "}
                {distanceObstacle != null
                  ? `${Math.round(distanceObstacle)} cm`
                  : "proximité"}
              </Typography>
            </Stack>
          ) : (
            <Typography
              variant="body2"
              sx={{
                color: "text.secondary",
              }}
            >
              {LABELS[current.action]}
              {current.action !== "stop" ? ` · ${current.speed}%` : ""}
            </Typography>
          )}
        </Box>
      </Stack>
      <Button
        onClick={stop}
        variant="contained"
        color="error"
        fullWidth
        sx={{
          mt: 3,
        }}
      >
        STOP
      </Button>
      <Typography
        variant="body2"
        align="center"
        sx={{
          color: "text.secondary",
          mt: 2,
        }}
      >
        Glisser le joystick, ou clavier : ↑ ↓ ← → · Espace = STOP
      </Typography>
    </Paper>
  );
}
