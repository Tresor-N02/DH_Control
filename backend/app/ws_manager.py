"""
Tiny WebSocket broadcast hub.

One "room" per drone id. Anything that happens for a drone --
a new telemetry sample, a fresh detection, a new alert -- gets pushed
as a small JSON envelope: {"type": ..., "data": ...}. The frontend
keeps a single socket open per drone and merges these into its state.
"""

import json
from collections import defaultdict

from fastapi import WebSocket


class ConnectionManager:
    def __init__(self) -> None:
        self._rooms: dict[int, set[WebSocket]] = defaultdict(set)

    async def connect(self, drone_id: int, websocket: WebSocket) -> None:
        await websocket.accept()
        self._rooms[drone_id].add(websocket)

    def disconnect(self, drone_id: int, websocket: WebSocket) -> None:
        self._rooms[drone_id].discard(websocket)

    async def broadcast(self, drone_id: int, message_type: str, data: dict) -> None:
        payload = json.dumps({"type": message_type, "data": data}, default=str)
        dead: list[WebSocket] = []
        for ws in self._rooms.get(drone_id, ()):
            try:
                await ws.send_text(payload)
            except Exception:
                dead.append(ws)
        for ws in dead:
            self._rooms[drone_id].discard(ws)


manager = ConnectionManager()
