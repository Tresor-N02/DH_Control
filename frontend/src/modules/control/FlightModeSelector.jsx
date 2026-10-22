import { Plane, Car } from "lucide-react";

import { useDrone } from "../../context/DroneContext";

export default function FlightModeSelector() {

  const {

    flightMode,

    setFlightMode,

  } = useDrone();

  return (

    <div className="rounded-xl border border-slate-800 bg-slate-900 p-3">

      <h3 className="mb-2 text-sm font-semibold">

        Mode de déplacement

      </h3>

      <div className="grid grid-cols-2 gap-2">

        <button

          onClick={() => setFlightMode("AERIEN")}

          className={`
            rounded-xl

            p-2

            transition

            ${
              flightMode === "AERIEN"

                ? "bg-cyan-600"

                : "bg-slate-800"
            }
          `}
        >

          <Plane className="mx-auto" />

          <p className="mt-2 text-sm">

            Aérien

          </p>

        </button>

        <button

          onClick={() => setFlightMode("TERRESTRE")}

          className={`
            rounded-xl

            p-2

            transition

            ${
              flightMode === "TERRESTRE"

                ? "bg-cyan-600"

                : "bg-slate-800"
            }
          `}
        >

          <Car className="mx-auto" />

          <p className="mt-2 text-sm">

            Terrestre

          </p>

        </button>

      </div>

    </div>

  );

}