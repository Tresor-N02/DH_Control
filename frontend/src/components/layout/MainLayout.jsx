import Navbar from "./Navbar";
import Sidebar from "./Sidebar";
import { useDrone } from "../../context/useDrone";
export default function MainLayout({ children }) {
  const {
    droneId,
    droneName,
    droneLoading,
    droneError,
    reloadDrones,
    simulated,
    connected,
    telemetryStale,
    telemetryAge,
    flightMode,
    commandFeedback,
    emergencyStop,
  } = useDrone();
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:block focus:p-3"
      >
        Aller au contenu
      </a>
      <Navbar />
      <div className="flex items-start">
        <Sidebar />
        <main
          id="main-content"
          className="min-w-0 flex-1 space-y-4 p-3 pb-24 md:p-5 md:pb-24"
        >
          <div>
            <h2 className="text-lg font-semibold">
              {droneName || "Poste de supervision"}
            </h2>
            <p className="text-sm text-slate-400">
              {flightMode === "TERRESTRE"
                ? "Mode terrestre"
                : "Mode aérien indisponible"}{" "}
              ·{" "}
              {connected && !telemetryStale
                ? "Liaison active"
                : "Liaison non confirmée"}{" "}
              ·{" "}
              {telemetryAge == null
                ? "En attente de données"
                : `Dernières données : ${telemetryAge} s`}
            </p>
          </div>
          <button
            disabled={!droneId}
            onClick={emergencyStop}
            className="fixed bottom-4 right-4 z-[1100] rounded-xl bg-red-600 px-5 py-3 font-bold shadow-lg hover:bg-red-500 disabled:opacity-50"
          >
            Arrêt d’urgence
          </button>
          {simulated && (
            <div
              role="status"
              className="rounded-xl border border-amber-700 bg-amber-950/50 p-3 text-sm text-amber-200"
            >
              Mode simulation — données fictives. Les commandes peuvent agir sur
              le simulateur.
            </div>
          )}
          {droneId && (!connected || telemetryStale) && (
            <div
              role="status"
              className="rounded-xl border border-amber-700 bg-amber-950/40 p-3 text-sm text-amber-200"
            >
              {!connected
                ? "Liaison perdue ou en cours de connexion."
                : "Données périmées."}{" "}
              Les dernières valeurs ne confirment pas l’état actuel du drone.
            </div>
          )}
          {commandFeedback && (
            <p
              role="status"
              aria-live="polite"
              className={`rounded-lg border p-3 text-sm ${commandFeedback.error ? "border-red-800 bg-red-950/40 text-red-200" : "border-slate-700 bg-slate-900"}`}
            >
              {commandFeedback.message}
            </p>
          )}
          {droneLoading ? (
            <p role="status">Chargement du drone…</p>
          ) : droneError || !droneId ? (
            <div className="rounded-xl border border-slate-700 p-6">
              <p>
                {droneError ||
                  "Aucun drone configuré. Ajoutez un drone côté serveur pour commencer."}
              </p>
              <button
                onClick={reloadDrones}
                className="mt-3 rounded-lg bg-cyan-700 px-4 py-2"
              >
                Réessayer
              </button>
            </div>
          ) : (
            <div className={telemetryStale ? "telemetry-stale" : ""}>
              {children}
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
