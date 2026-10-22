import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  useMap,
  useMapEvents,
} from "react-leaflet";
import L from "leaflet";
import { useEffect, useState } from "react";
import { useDrone } from "../../context/useDrone";
import MapToolbar from "./MapToolbar";
const icon = (heading) =>
  new L.DivIcon({
    html: `<div style="color:#06b6d4;font-size:32px;transform:rotate(${heading}deg)">▲</div>`,
    className: "",
    iconSize: [32, 32],
    iconAnchor: [16, 16],
  });
function Controls({ latitude, longitude, valid }) {
  const map = useMap();
  const [following, setFollowing] = useState(true);
  useMapEvents({ dragstart: () => setFollowing(false) });
  useEffect(() => {
    if (following && valid)
      map.panTo([latitude, longitude], { animate: false });
  }, [map, latitude, longitude, following, valid]);
  useEffect(() => {
    const observer = new ResizeObserver(() => map.invalidateSize());
    observer.observe(map.getContainer());
    return () => observer.disconnect();
  }, [map]);
  return (
    <MapToolbar
      onZoomIn={() => map.zoomIn(1, { animate: false })}
      onZoomOut={() => map.zoomOut(1, { animate: false })}
      onLocate={() => map.panTo([latitude, longitude], { animate: false })}
      onToggleFollow={() => setFollowing(!following)}
      following={following}
      canLocate={valid}
    />
  );
}
export default function LeafletMap() {
  const { latitude, longitude, heading, gpsFix, telemetryStale } = useDrone();
  const valid = gpsFix && !telemetryStale;
  return (
    <div className="relative h-full min-h-80 overflow-hidden rounded-xl">
      <MapContainer
        center={[latitude, longitude]}
        zoom={17}
        zoomControl={false}
        zoomAnimation={false}
        fadeAnimation={false}
        markerZoomAnimation={false}
        style={{ width: "100%", height: "100%", minHeight: "320px" }}
      >
        <TileLayer
          attribution="&copy; OpenStreetMap"
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <Controls latitude={latitude} longitude={longitude} valid={valid} />
        {valid && (
          <Marker position={[latitude, longitude]} icon={icon(heading)}>
            <Popup>
              Drone · {latitude.toFixed(5)}, {longitude.toFixed(5)}
              <br />
              Cap : {Math.round(heading)}°
            </Popup>
          </Marker>
        )}
      </MapContainer>
      {!valid && (
        <p className="absolute bottom-3 left-3 right-16 z-[1000] rounded-lg bg-slate-900/95 p-3 text-sm text-amber-200">
          Position actuelle indisponible. Aucun emplacement de drone confirmé.
        </p>
      )}
    </div>
  );
}
