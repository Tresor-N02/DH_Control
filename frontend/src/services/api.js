import axios from "axios";

// Vite exposes env vars prefixed VITE_ on import.meta.env -- see .env.example.
export const API_BASE_URL =
  import.meta.env.VITE_API_URL || "http://localhost:8000";
export const WS_BASE_URL =
  import.meta.env.VITE_WS_URL || API_BASE_URL.replace(/^http/, "ws");

const TOKEN_KEY = "dh_mil_token";

export function getToken() {
  return localStorage.getItem(TOKEN_KEY);
}

export function setToken(token) {
  if (token) localStorage.setItem(TOKEN_KEY, token);
  else localStorage.removeItem(TOKEN_KEY);
}

const client = axios.create({ baseURL: API_BASE_URL, timeout: 10000 });

client.interceptors.request.use((config) => {
  const token = getToken();
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// ==========================================================
// Auth
// ==========================================================

export async function login(email, password) {
  // FastAPI's OAuth2PasswordRequestForm expects form-encoded
  // username/password, not JSON.
  const body = new URLSearchParams();
  body.set("username", email);
  body.set("password", password);
  const { data } = await client.post("/api/auth/login", body, {
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
  });
  return data; // { access_token, token_type }
}

export async function fetchMe() {
  const { data } = await client.get("/api/auth/me");
  return data;
}

// ==========================================================
// Drones
// ==========================================================

export async function fetchDrones() {
  const { data } = await client.get("/api/drones");
  return data;
}

export async function setDroneMode(droneId, mode) {
  const { data } = await client.patch(`/api/drones/${droneId}/mode`, { mode });
  return data;
}

// ==========================================================
// Telemetry / control (mostly used as a fallback -- the live
// dashboard gets these over the WebSocket instead, see socket.js)
// ==========================================================

export async function fetchLatestTelemetry(droneId) {
  const { data } = await client.get(`/api/telemetry/${droneId}/latest`);
  return data;
}

export async function fetchTelemetryHistory(droneId, limit = 100) {
  const { data } = await client.get(`/api/telemetry/${droneId}/history`, {
    params: { limit },
  });
  return data;
}

export async function sendCommandRest(droneId, action, speed) {
  const { data } = await client.post(
    `/api/control/${droneId}/command`,
    { action, speed },
    { timeout: 5000 },
  );
  return data;
}

export async function fetchAlerts(droneId) {
  const { data } = await client.get("/api/alerts", {
    params: { drone_id: droneId },
  });
  return data;
}

export async function markAlertStatus(alertId, statut) {
  const { data } = await client.patch(`/api/alerts/${alertId}`, { statut });
  return data;
}

export async function fetchDetectorStatus() {
  const { data } = await client.get("/api/video/status");
  return data;
}

// ==========================================================
// Missions
// ==========================================================

export async function fetchMissions(droneId) {
  const { data } = await client.get("/api/missions", {
    params: { drone_id: droneId },
  });
  return data;
}

export async function createMission(droneId, titre) {
  const { data } = await client.post(
    "/api/missions",
    { titre },
    { params: { drone_id: droneId } },
  );
  return data;
}

export async function demarrerMission(missionId) {
  const { data } = await client.patch(`/api/missions/${missionId}/demarrer`);
  return data;
}

export async function terminerMission(missionId) {
  const { data } = await client.patch(`/api/missions/${missionId}/terminer`);
  return data;
}

// ==========================================================
// Historique (journal d'actions)
// ==========================================================

export async function fetchHistorique(droneId, limit = 50) {
  const { data } = await client.get("/api/history", {
    params: { drone_id: droneId, limit },
  });
  return data;
}

export default client;
