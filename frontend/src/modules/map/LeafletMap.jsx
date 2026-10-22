import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  ZoomControl,
  useMap,
} from "react-leaflet";

import L from "leaflet";
import { useEffect } from "react";

import "leaflet/dist/leaflet.css";

import { useDrone } from "../../context/DroneContext";

import MapToolbar from "./MapToolbar";
import MapLegend from "./MapLegend";

// ==============================
// Icône du drone
// ==============================

const createDroneIcon = (heading) =>
  new L.DivIcon({
    html: `
      <div
        style="
          font-size:32px;
          transform:rotate(${heading}deg);
          transition:transform .25s linear;
        "
      >
        🚁
      </div>
    `,
    className: "",
    iconSize: [32, 32],
    iconAnchor: [16, 16],
  });

// ==============================
// Suivi automatique
// ==============================

function FollowDrone({ position }) {

  const map = useMap();

  useEffect(() => {

    map.flyTo(position, map.getZoom(), {

      duration: 0.4,

    });

  }, [position, map]);

  return null;

}

// ==============================
// Carte
// ==============================

export default function LeafletMap() {

  const {

    latitude,

    longitude,

    heading,

  } = useDrone();

  const position = [latitude, longitude];

  return (

    <div
      className="
        relative
        h-full
        overflow-hidden
        rounded-xl
      "
    >

      <MapContainer

        center={position}

        zoom={17}

        zoomControl={false}

        scrollWheelZoom

        style={{
          width: "100%",
          height: "100%",
        }}

      >

        <FollowDrone position={position} />

        <ZoomControl position="bottomright" />

        <TileLayer

          attribution="&copy; OpenStreetMap"

          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"

        />

        <Marker

          position={position}

          icon={createDroneIcon(heading)}

        >

          <Popup>

            <div className="text-sm">

              <strong>Drone Hybride</strong>

              <br />

              Latitude :

              {" "}

              {latitude.toFixed(6)}

              <br />

              Longitude :

              {" "}

              {longitude.toFixed(6)}

              <br />

              Cap :

              {" "}

              {heading}°

            </div>

          </Popup>

        </Marker>

      </MapContainer>

      <MapToolbar />

      <MapLegend />

    </div>

  );

}