import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";

import * as api from "../services/api";
import { createDroneSocket } from "../services/socket";
import { useAuth } from "./AuthContext";

const DroneContext = createContext(null);

// Bujumbura, Burundi -- same default the original client-only simulation
// used, kept here as the "last known position" before any real fix ever
// arrives.
const HOME = { latitude: -3.3822, longitude: 29.3644 };

// GPS noise is typically a few meters (~0.00002-0.00005 deg); only
// recompute heading when the rover has moved further than that, so a
// stationary drone doesn't get a jittery/spinning compass.
const MIN_MOVEMENT_DEG = 0.00003;

function bearingDegrees(lat1, lon1, lat2, lon2) {
  const toRad = (d) => (d * Math.PI) / 180;
  const toDeg = (r) => (r * 180) / Math.PI;
  const dLon = toRad(lon2 - lon1);
  const y = Math.sin(dLon) * Math.cos(toRad(lat2));
  const x =
    Math.cos(toRad(lat1)) * Math.sin(toRad(lat2)) -
    Math.sin(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.cos(dLon);
  return (toDeg(Math.atan2(y, x)) + 360) % 360;
}

export function DroneProvider({ children }) {
  const { token } = useAuth();

  const [droneId, setDroneId] = useState(null);
  const [connected, setConnected] = useState(false);
  const [simulated, setSimulated] = useState(false);

  const [battery, setBattery] = useState(100);
  const [signal, setSignal] = useState(97);
  const [speed, setSpeed] = useState(0);
  const [altitude, setAltitude] = useState(0);
  const [latitude, setLatitude] = useState(HOME.latitude);
  const [longitude, setLongitude] = useState(HOME.longitude);
  const [gpsFix, setGpsFix] = useState(false);
  const [heading, setHeading] = useState(0);
  const [distanceObstacle, setDistanceObstacle] = useState(null);
  const [obstacleDetected, setObstacleDetected] = useState(false);

  const [flightMode, setFlightModeState] = useState("TERRESTRE");
  const [etat, setEtat] = useState("ARRETE");

  const [videoFrame, setVideoFrame] = useState(null);
  const [detections, setDetections] = useState([]);
  const [detectorAvailable, setDetectorAvailable] = useState(null);

  const [alerts, setAlerts] = useState([]);

  // Unused by any component today, kept only because it existed in the
  // original mocked context -- harmless local-only UI state.
  const [controlMode, setControlMode] = useState("MANUAL");

  const socketRef = useRef(null);
  const lastFixRef = useRef(null);

  // ------------------------------------------------------------------
  // Load the drone list once authenticated, and pick the one drone this
  // project seeds ("Drone Hybride 01"). If several existed, this would
  // need a picker -- out of scope for a single-rover project.
  // ------------------------------------------------------------------
  useEffect(() => {
    let cancelled = false;

    async function loadDrone() {
      if (!token) {
        setDroneId(null);
        return;
      }
      try {
        const drones = await api.fetchDrones();
        if (cancelled || drones.length === 0) return;
        const drone = drones[0];
        setDroneId(drone.id_drone);
        setFlightModeState(drone.mode);
        setEtat(drone.etat);
      } catch {
        /* surfaced as "connected: false" once the socket also fails to open */
      }
    }

    loadDrone();
    return () => {
      cancelled = true;
    };
  }, [token]);

  const handleMessage = useCallback((message) => {
    const { type, data } = message;

    if (type === "connection") {
      setConnected(Boolean(data.connected));
      setSimulated(Boolean(data.simulated));
      return;
    }

    if (type === "telemetry") {
      setBattery(data.batterie ?? 0);
      setAltitude(data.altitude ?? 0);
      setSpeed(data.vitesse ?? 0);
      if (typeof data.signal === "number") setSignal(data.signal);
      setDistanceObstacle(data.distance_obstacle);
      setObstacleDetected(Boolean(data.obstacle_detecte));

      const hasFix = data.latitude != null && data.longitude != null;
      setGpsFix(hasFix);
      if (hasFix) {
        const prev = lastFixRef.current;
        if (prev) {
          const moved =
            Math.abs(data.latitude - prev.lat) > MIN_MOVEMENT_DEG ||
            Math.abs(data.longitude - prev.lon) > MIN_MOVEMENT_DEG;
          if (moved) {
            setHeading(bearingDegrees(prev.lat, prev.lon, data.latitude, data.longitude));
          }
        }
        lastFixRef.current = { lat: data.latitude, lon: data.longitude };
        setLatitude(data.latitude);
        setLongitude(data.longitude);
      }
      return;
    }

    if (type === "frame") {
      setVideoFrame(`data:image/jpeg;base64,${data.image_base64}`);
      setDetections(data.detections || []);
      setDetectorAvailable(Boolean(data.detector_available));
      return;
    }

    if (type === "alerte") {
      setAlerts((prev) => [{ ...data, id: `srv-${Date.now()}` }, ...prev].slice(0, 30));
      return;
    }

    if (type === "command_result") {
      if (!data.executed && data.blocked_reason) {
        setAlerts((prev) =>
          [
            {
              id: `cmd-${Date.now()}`,
              type: "COMMANDE",
              message: data.blocked_reason,
              statut: "NOUVELLE",
            },
            ...prev,
          ].slice(0, 30)
        );
      }
    }
  }, []);

  // ------------------------------------------------------------------
  // Open the realtime socket once we know which drone to watch.
  // ------------------------------------------------------------------
  useEffect(() => {
    if (!droneId || !token) return undefined;

    const socket = createDroneSocket(droneId, token, {
      onOpen: () => setConnected(true),
      onClose: () => setConnected(false),
      onMessage: handleMessage,
    });
    socketRef.current = socket;

    return () => {
      socket.close();
      socketRef.current = null;
    };
  }, [droneId, token, handleMessage]);

  // ------------------------------------------------------------------
  // Commands
  // ------------------------------------------------------------------
  const sendCommand = useCallback(
    (action, speedPercent) => {
      const payload = { type: "command", action };
      if (speedPercent !== undefined) payload.speed = Math.round(speedPercent);

      const sentOverSocket = socketRef.current?.send(payload);
      if (!sentOverSocket && droneId) {
        // Socket not open (e.g. still reconnecting) -- REST still gets
        // the command through, just without the low-latency path.
        api.sendCommandRest(droneId, action).catch(() => {});
      }
    },
    [droneId]
  );

  const stop = useCallback(() => sendCommand("stop"), [sendCommand]);

  const setFlightMode = useCallback(
    async (mode) => {
      if (!droneId) return;
      try {
        const updated = await api.setDroneMode(droneId, mode);
        setFlightModeState(updated.mode);
      } catch {
        /* the button simply won't visually switch; no hardware side-effect to undo */
      }
    },
    [droneId]
  );

  const takeOff = useCallback(() => setFlightMode("AERIEN"), [setFlightMode]);

  const land = useCallback(() => {
    sendCommand("stop");
    setFlightMode("TERRESTRE");
  }, [sendCommand, setFlightMode]);

  const emergencyStop = useCallback(() => sendCommand("stop"), [sendCommand]);

  const returnHome = useCallback(() => {
    sendCommand("stop");
    setAlerts((prev) =>
      [
        {
          id: `home-${Date.now()}`,
          type: "INFO",
          message:
            "Retour au point de départ non disponible sur ce matériel (pas de navigation par waypoints) -- drone arrêté à la place.",
          statut: "NOUVELLE",
        },
        ...prev,
      ].slice(0, 30)
    );
  }, [sendCommand]);

  const markAlertsRead = useCallback(() => {
    setAlerts((prev) => prev.map((a) => ({ ...a, statut: "LUE" })));
  }, []);

  const value = useMemo(
    () => ({
      droneId,
      connected,
      simulated,
      battery,
      signal,
      speed,
      altitude,
      latitude,
      longitude,
      gpsFix,
      heading,
      distanceObstacle,
      obstacleDetected,
      flightMode,
      etat,
      videoFrame,
      detections,
      detectorAvailable,
      alerts,
      markAlertsRead,
      controlMode,
      setControlMode,
      setFlightMode,
      sendCommand,
      stop,
      takeOff,
      land,
      returnHome,
      emergencyStop,
    }),
    [
      droneId,
      connected,
      simulated,
      battery,
      signal,
      speed,
      altitude,
      latitude,
      longitude,
      gpsFix,
      heading,
      distanceObstacle,
      obstacleDetected,
      flightMode,
      etat,
      videoFrame,
      detections,
      detectorAvailable,
      alerts,
      markAlertsRead,
      controlMode,
      setFlightMode,
      sendCommand,
      stop,
      takeOff,
      land,
      returnHome,
      emergencyStop,
    ]
  );

  return <DroneContext.Provider value={value}>{children}</DroneContext.Provider>;
}

export function useDrone() {
  const ctx = useContext(DroneContext);
  if (!ctx) throw new Error("useDrone must be used within a DroneProvider");
  return ctx;
}
