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
    <div className="min-h-screen bg-app text-ink">
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
          className="min-w-0 flex-1 space-y-6 p-4 pb-32 md:p-7 md:pb-32"
        >
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-line pb-5">
            <div>
              <p className="mb-1 text-xs font-medium text-subtle">
                Drone sélectionné
              </p>
              <h2 className="text-xl font-semibold">
                {droneName || "Poste de supervision"}
              </h2>
              <p className="text-sm text-subtle">
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
            <span
              className={`inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-sm font-medium ${connected && !telemetryStale ? "border-line-strong bg-muted text-accent-ink" : "border-warning-line bg-warning-surface/40 text-warning-ink"}`}
            >
              <span
                aria-hidden="true"
                className="h-2 w-2 rounded-full bg-current"
              />
              {connected && !telemetryStale
                ? "Connecté"
                : "Connexion indisponible"}
            </span>
          </div>
          <div className="fixed inset-x-0 bottom-0 z-[1100] flex items-center justify-between gap-4 border-t border-line bg-panel px-4 py-3 shadow-lg lg:left-64 md:px-7">
            <p className="hidden text-sm text-subtle sm:block">
              Besoin d’arrêter le déplacement ?
            </p>
            <button
              disabled={!droneId}
              onClick={emergencyStop}
              className="ml-auto min-h-12 rounded-xl bg-red-600 text-white px-6 py-3 font-semibold hover:bg-red-500 disabled:opacity-50"
            >
              Arrêt d’urgence
            </button>
          </div>
          {simulated && (
            <div
              role="status"
              className="rounded-xl border border-warning-line bg-warning-surface/50 p-3 text-sm text-warning-ink"
            >
              Mode simulation — données fictives. Les commandes peuvent agir sur
              le simulateur.
            </div>
          )}
          {droneId && (!connected || telemetryStale) && (
            <div
              role="status"
              className="rounded-xl border border-warning-line bg-warning-surface/40 p-3 text-sm text-warning-ink"
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
              className={`rounded-lg border p-3 text-sm ${commandFeedback.error ? "border-error-line bg-error-surface/40 text-error-ink" : "border-line-strong bg-panel"}`}
            >
              {commandFeedback.message}
            </p>
          )}
          {droneLoading ? (
            <p role="status">Chargement du drone…</p>
          ) : droneError || !droneId ? (
            <div className="rounded-xl border border-line-strong p-6">
              <p>
                {droneError ||
                  "Aucun drone configuré. Ajoutez un drone côté serveur pour commencer."}
              </p>
              <button
                onClick={reloadDrones}
                className="mt-3 rounded-lg bg-cyan-700 text-white px-4 py-2"
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
