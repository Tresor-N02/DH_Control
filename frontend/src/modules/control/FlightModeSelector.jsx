import { useDrone } from "../../context/useDrone";
export default function FlightModeSelector() {
  const { flightMode, setFlightMode } = useDrone();
  return (
    <section className="rounded-xl border border-line bg-panel p-4">
      <h3 className="mb-3 text-sm font-semibold">Mode de déplacement</h3>
      <div className="grid grid-cols-2 gap-2">
        <button
          aria-pressed={flightMode === "TERRESTRE"}
          onClick={() => setFlightMode("TERRESTRE")}
          className="rounded-lg bg-cyan-700 text-white p-3 text-sm"
        >
          Terrestre
        </button>
        <button
          disabled
          className="rounded-lg bg-muted p-3 text-sm text-subtle"
        >
          Aérien indisponible
        </button>
      </div>
    </section>
  );
}
