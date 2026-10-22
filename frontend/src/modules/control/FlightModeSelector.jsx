import { useDrone } from "../../context/useDrone";
export default function FlightModeSelector() {
  const { flightMode, setFlightMode } = useDrone();
  return (
    <section className="rounded-xl border border-slate-800 bg-slate-900 p-4">
      <h3 className="mb-3 text-sm font-semibold">Mode de déplacement</h3>
      <div className="grid grid-cols-2 gap-2">
        <button
          aria-pressed={flightMode === "TERRESTRE"}
          onClick={() => setFlightMode("TERRESTRE")}
          className="rounded-lg bg-cyan-700 p-3 text-sm"
        >
          Terrestre
        </button>
        <button
          disabled
          className="rounded-lg bg-slate-800 p-3 text-sm text-slate-400"
        >
          Aérien indisponible
        </button>
      </div>
    </section>
  );
}
