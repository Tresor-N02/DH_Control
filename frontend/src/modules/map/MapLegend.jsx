import {
  MapPin,
  Navigation,
  ShieldAlert,
} from "lucide-react";

export default function MapLegend() {

  return (

    <div
      className="
        absolute
        bottom-3
        left-3
        z-[1000]

        rounded-lg
        border
        border-slate-700/70
        bg-slate-900/90
        backdrop-blur

        px-3
        py-2

        text-[10px]
        text-slate-300

        shadow-lg
      "
    >

      <h4 className="mb-2 text-[11px] font-semibold">

        Légende

      </h4>

      <div className="space-y-1">

        <div className="flex items-center gap-2">

          <Navigation
            size={13}
            className="text-cyan-400"
          />

          <span>Drone</span>

        </div>

        <div className="flex items-center gap-2">

          <MapPin
            size={13}
            className="text-green-400"
          />

          <span>Position</span>

        </div>

        <div className="flex items-center gap-2">

          <ShieldAlert
            size={13}
            className="text-red-400"
          />

          <span>Alerte</span>

        </div>

      </div>

    </div>

  );

}