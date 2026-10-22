import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import * as api from "../services/api";
import { createDroneSocket } from "../services/socket";
import { useAuth } from "./useAuth";
import { DroneContext } from "./contexts";
const initial = {
  droneId: null,
  droneName: "",
  flightMode: "TERRESTRE",
  etat: "ARRETE",
  connected: false,
  simulated: false,
  battery: 0,
  signal: 0,
  speed: 0,
  altitude: 0,
  latitude: -3.3822,
  longitude: 29.3644,
  gpsFix: false,
  heading: 0,
  distanceObstacle: null,
  obstacleDetected: false,
  videoFrame: null,
  detections: [],
  detectorAvailable: null,
  videoSimulated: false,
  lastTelemetryAt: null,
  lastFrameAt: null,
};
export function DroneProvider({ children }) {
  const { token } = useAuth();
  const [state, setState] = useState(initial);
  const [droneLoading, setDroneLoading] = useState(true);
  const [droneError, setDroneError] = useState(null);
  const [reload, setReload] = useState(0);
  const [alerts, setAlerts] = useState([]);
  const [commandFeedback, setCommandFeedback] = useState(null);
  const [now, setNow] = useState(() => Date.now());
  const [controlMode, setControlMode] = useState("MANUAL");
  const socketRef = useRef(null);
  const feedbackTimer = useRef(null);
  const lastFix = useRef(null);
  const stopPending = useRef(false);
  const reloadDrones = useCallback(() => setReload((n) => n + 1), []);
  useEffect(() => {
    const timer = setInterval(() => setNow(Date.now()), 1000);
    return () => {
      clearInterval(timer);
      clearTimeout(feedbackTimer.current);
    };
  }, []);
  useEffect(() => {
    let cancelled = false;
    async function load() {
      setState(initial);
      setAlerts([]);
      setCommandFeedback(null);
      lastFix.current = null;
      clearTimeout(feedbackTimer.current);
      stopPending.current = false;
      setDroneLoading(true);
      setDroneError(null);
      if (!token) {
        setDroneLoading(false);
        return;
      }
      try {
        const drones = await api.fetchDrones();
        if (cancelled) return;
        if (drones.length) {
          const drone = drones[0];
          setState({
            ...initial,
            droneId: drone.id_drone,
            droneName: drone.nom,
            flightMode: drone.mode,
            etat: drone.etat,
          });
          try {
            const items = await api.fetchAlerts(drone.id_drone);
            if (!cancelled)
              setAlerts((prev) => {
                const persisted = new Set(
                  prev.map((a) => a.id_alerte).filter(Boolean),
                );
                return [
                  ...prev,
                  ...items
                    .filter((a) => !persisted.has(a.id_alerte))
                    .map((a) => ({
                      ...a,
                      id: `db-${a.id_alerte}`,
                      receivedAt: a.date_alerte,
                    })),
                ].slice(0, 100);
              });
          } catch {
            /* Live alerts still remain available. */
          }
        }
      } catch {
        if (!cancelled)
          setDroneError(
            "Impossible de charger les drones. Vérifiez la connexion au serveur.",
          );
      } finally {
        if (!cancelled) setDroneLoading(false);
      }
    }
    load();
    return () => {
      cancelled = true;
    };
  }, [token, reload]);
  const handleResult = useCallback((data) => {
    // The current protocol identifies an action, but has no command ID.
    // Keep stop feedback visible while queued movement replies drain.
    if (stopPending.current && data.action !== "stop") return;
    clearTimeout(feedbackTimer.current);
    feedbackTimer.current = null;
    if (data.action === "stop" && data.executed) stopPending.current = false;
    setCommandFeedback({
      error: !data.executed,
      message: data.executed
        ? data.action === "stop"
          ? "Arrêt confirmé par le serveur."
          : "Commande acceptée par le serveur."
        : `${data.action === "stop" ? "Arrêt non confirmé" : "Commande refusée"} : ${data.blocked_reason || "raison inconnue"}`,
    });
  }, []);
  const handleMessage = useCallback(
    ({ type, data }) => {
      if (type === "connection")
        setState((s) => ({
          ...s,
          connected: Boolean(data.connected),
          simulated: Boolean(data.simulated),
        }));
      if (type === "camera_connection" && !data.connected)
        setState((s) => ({ ...s, lastFrameAt: null }));
      if (type === "telemetry") {
        const fix = data.latitude != null && data.longitude != null;
        let heading;
        if (fix && lastFix.current) {
          const [lat, lon] = lastFix.current;
          if (
            Math.abs(data.latitude - lat) + Math.abs(data.longitude - lon) >
            0.00003
          ) {
            const r = Math.PI / 180,
              d = (data.longitude - lon) * r;
            heading =
              (Math.atan2(
                Math.sin(d) * Math.cos(data.latitude * r),
                Math.cos(lat * r) * Math.sin(data.latitude * r) -
                  Math.sin(lat * r) * Math.cos(data.latitude * r) * Math.cos(d),
              ) /
                r +
                360) %
              360;
          }
        }
        if (fix) lastFix.current = [data.latitude, data.longitude];
        setState((s) => ({
          ...s,
          battery: data.batterie ?? 0,
          signal: data.signal ?? 0,
          speed: data.vitesse ?? 0,
          altitude: data.altitude ?? 0,
          latitude: fix ? data.latitude : s.latitude,
          longitude: fix ? data.longitude : s.longitude,
          gpsFix: fix,
          heading: heading ?? s.heading,
          distanceObstacle:
            data.distance_obstacle >= 0 ? data.distance_obstacle : null,
          obstacleDetected: Boolean(data.obstacle_detecte),
          lastTelemetryAt: Date.now(),
        }));
      }
      if (type === "frame")
        setState((s) => ({
          ...s,
          videoFrame: `data:image/jpeg;base64,${data.image_base64}`,
          detections: data.detections || [],
          detectorAvailable: Boolean(data.detector_available),
          videoSimulated: Boolean(data.simulated),
          lastFrameAt: Date.now(),
        }));
      if (type === "alerte")
        setAlerts((prev) =>
          [
            {
              ...data,
              id: `${Date.now()}-${Math.random().toString(36).slice(2)}`,
              receivedAt: new Date().toISOString(),
            },
            ...prev,
          ].slice(0, 100),
        );
      if (type === "command_result") handleResult(data);
    },
    [handleResult],
  );
  useEffect(() => {
    if (!state.droneId || !token) return;
    const socket = createDroneSocket(state.droneId, token, {
      onClose: () => setState((s) => ({ ...s, connected: false })),
      onMessage: handleMessage,
    });
    socketRef.current = socket;
    return () => {
      socket.close();
      socketRef.current = null;
    };
  }, [state.droneId, token, handleMessage]);
  const telemetryAge =
    state.lastTelemetryAt == null
      ? null
      : Math.max(0, Math.floor((now - state.lastTelemetryAt) / 1000));
  const frameAge =
    state.lastFrameAt == null
      ? null
      : Math.max(0, Math.floor((now - state.lastFrameAt) / 1000));
  const telemetryStale =
    !state.connected || telemetryAge == null || telemetryAge > 5;
  const frameStale = !state.connected || frameAge == null || frameAge > 5;
  const sendCommand = useCallback(
    (action, speedPercent) => {
      if (!state.droneId) {
        setCommandFeedback({
          error: true,
          message: "Aucun drone sélectionné.",
        });
        return false;
      }
      if (
        action !== "stop" &&
        (telemetryStale ||
          state.flightMode !== "TERRESTRE" ||
          stopPending.current)
      ) {
        setCommandFeedback({
          error: true,
          message:
            "Déplacement indisponible : vérifiez la liaison, le mode terrestre et la confirmation d’arrêt.",
        });
        return false;
      }
      if (action === "stop") stopPending.current = true;
      setCommandFeedback((previous) =>
        previous?.message ===
        (action === "stop"
          ? "Arrêt envoyé — en attente de confirmation."
          : "Commande envoyée — en attente de confirmation.")
          ? previous
          : {
              error: false,
              message:
                action === "stop"
                  ? "Arrêt envoyé — en attente de confirmation."
                  : "Commande envoyée — en attente de confirmation.",
            },
      );
      if (!feedbackTimer.current || action === "stop") {
        clearTimeout(feedbackTimer.current);
        feedbackTimer.current = setTimeout(() => {
          feedbackTimer.current = null;
          setCommandFeedback({
            error: true,
            message: stopPending.current
              ? "Arrêt non confirmé. Vérifiez le drone et réessayez."
              : "Commande sans confirmation du serveur.",
          });
        }, 4000);
      }
      const payload = {
        type: "command",
        action,
        ...(speedPercent === undefined
          ? {}
          : { speed: Math.round(speedPercent) }),
      };
      if (!socketRef.current?.send(payload))
        api
          .sendCommandRest(state.droneId, action, payload.speed)
          .then(handleResult)
          .catch(() => {
            clearTimeout(feedbackTimer.current);
            feedbackTimer.current = null;
            setCommandFeedback({
              error: true,
              message:
                action === "stop"
                  ? "Arrêt non confirmé : serveur inaccessible."
                  : "Échec de la commande : serveur inaccessible.",
            });
          });
      return true;
    },
    [state.droneId, state.flightMode, telemetryStale, handleResult],
  );
  const stop = useCallback(() => {
    window.dispatchEvent(new Event("drone-stop"));
    sendCommand("stop");
  }, [sendCommand]);
  const setFlightMode = useCallback(
    async (mode) => {
      if (!state.droneId || mode !== "TERRESTRE") return;
      try {
        const drone = await api.setDroneMode(state.droneId, mode);
        setState((s) => ({ ...s, flightMode: drone.mode }));
      } catch {
        setCommandFeedback({
          error: true,
          message: "Changement de mode non confirmé. Réessayez.",
        });
      }
    },
    [state.droneId],
  );
  const markAlertsRead = useCallback(async () => {
    const unread = alerts.filter((a) => a.statut === "NOUVELLE");
    const results = await Promise.allSettled(
      unread.map((a) =>
        a.id_alerte
          ? api.markAlertStatus(a.id_alerte, "LUE")
          : Promise.resolve(),
      ),
    );
    const ids = new Set(
      unread
        .filter((_, i) => results[i].status === "fulfilled")
        .map((a) => a.id),
    );
    setAlerts((prev) =>
      prev.map((a) => (ids.has(a.id) ? { ...a, statut: "LUE" } : a)),
    );
    if (results.some((r) => r.status === "rejected"))
      setCommandFeedback({
        error: true,
        message:
          "Certaines alertes n’ont pas pu être marquées comme lues. Réessayez.",
      });
  }, [alerts]);
  const value = useMemo(
    () => ({
      ...state,
      alerts,
      markAlertsRead,
      droneLoading,
      droneError,
      reloadDrones,
      telemetryAge,
      telemetryStale,
      frameAge,
      frameStale,
      commandFeedback,
      sendCommand,
      stop,
      emergencyStop: stop,
      setFlightMode,
      controlMode,
      setControlMode,
    }),
    [
      state,
      alerts,
      markAlertsRead,
      droneLoading,
      droneError,
      reloadDrones,
      telemetryAge,
      telemetryStale,
      frameAge,
      frameStale,
      commandFeedback,
      sendCommand,
      stop,
      setFlightMode,
      controlMode,
    ],
  );
  return (
    <DroneContext.Provider value={value}>{children}</DroneContext.Provider>
  );
}
