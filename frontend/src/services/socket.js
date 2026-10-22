import { WS_BASE_URL } from "./api";

// Wraps ws://.../ws/drone/{id}?token=... -- the single socket that
// carries telemetry, video frames, alerts and command replies (see
// backend/app/routers/ws.py). Reconnects with backoff on drop; the
// caller never has to think about reconnection.
export function createDroneSocket(droneId, token, handlers = {}) {
  const { onMessage, onOpen, onClose } = handlers;

  let socket = null;
  let closedByCaller = false;
  let retryDelay = 1000;
  let retryTimer = null;

  function connect() {
    const url = `${WS_BASE_URL}/ws/drone/${droneId}${token ? `?token=${encodeURIComponent(token)}` : ""}`;
    socket = new WebSocket(url);

    socket.onopen = () => {
      retryDelay = 1000;
      onOpen?.();
    };

    socket.onmessage = (event) => {
      try {
        const message = JSON.parse(event.data);
        onMessage?.(message);
      } catch {
        // ignore malformed frames rather than crashing the UI
      }
    };

    socket.onclose = () => {
      onClose?.();
      if (closedByCaller) return;
      retryTimer = setTimeout(connect, retryDelay);
      retryDelay = Math.min(retryDelay * 1.7, 15000);
    };

    socket.onerror = () => {
      socket?.close();
    };
  }

  connect();

  return {
    send(payload) {
      if (socket && socket.readyState === WebSocket.OPEN) {
        socket.send(JSON.stringify(payload));
        return true;
      }
      return false;
    },
    close() {
      closedByCaller = true;
      clearTimeout(retryTimer);
      socket?.close();
    },
  };
}
