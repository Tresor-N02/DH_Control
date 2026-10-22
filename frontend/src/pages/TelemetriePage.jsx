import { useCallback, useEffect, useState } from "react";
import { RefreshCw, Loader2 } from "lucide-react";

import MainLayout from "../components/layout/MainLayout";
import Card from "../components/common/Card";
import CardHeader from "../components/common/CardHeader";
import CardBody from "../components/common/CardBody";
import { useDrone } from "../context/DroneContext";
import * as api from "../services/api";

function formatHeure(iso) {
  try {
    return new Date(iso).toLocaleTimeString("fr-FR");
  } catch {
    return iso;
  }
}

export default function TelemetriePage() {
  const { droneId } = useDrone();
  const [history, setHistory] = useState([]);
  const [journal, setJournal] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const load = useCallback(async () => {
    if (!droneId) return;
    setLoading(true);
    setError(null);
    try {
      const [historyData, journalData] = await Promise.all([
        api.fetchTelemetryHistory(droneId, 100),
        api.fetchHistorique(droneId, 30),
      ]);
      setHistory(historyData.slice().reverse()); // le plus récent en premier
      setJournal(journalData);
    } catch {
      setError("Impossible de charger la télémétrie -- le backend est-il bien lancé ?");
    } finally {
      setLoading(false);
    }
  }, [droneId]);

  useEffect(() => {
    async function run() {
      await load();
    }
    run();
  }, [load]);

  return (
    <MainLayout>
      <div className="flex flex-col gap-3 xl:h-full xl:min-h-0">
        <section className="shrink-0 flex items-center justify-between">
          <h2 className="text-lg font-semibold">Historique de télémétrie</h2>
          <button
            onClick={load}
            disabled={loading}
            className="flex items-center gap-2 rounded-lg bg-slate-800 px-3 py-1.5 text-sm transition hover:bg-slate-700 disabled:opacity-60"
          >
            {loading ? <Loader2 size={14} className="animate-spin" /> : <RefreshCw size={14} />}
            Actualiser
          </button>
        </section>

        {error && <p className="shrink-0 text-sm text-red-400">{error}</p>}

        <section className="xl:min-h-0 xl:flex-1">
          <div className="grid h-full grid-cols-1 gap-3 xl:grid-cols-3">
            <div className="xl:col-span-2 xl:h-full xl:min-h-0">
              <Card className="h-full min-h-0 flex flex-col">
                <CardHeader title={`Relevés (${history.length})`} />
                <CardBody className="flex-1 min-h-0 overflow-y-auto p-0">
                  <table className="w-full text-left text-sm">
                    <thead className="sticky top-0 bg-slate-900 text-slate-400">
                      <tr>
                        <th className="px-3 py-2 font-normal">Heure</th>
                        <th className="px-3 py-2 font-normal">Batterie</th>
                        <th className="px-3 py-2 font-normal">Altitude</th>
                        <th className="px-3 py-2 font-normal">Vitesse</th>
                        <th className="px-3 py-2 font-normal">GPS</th>
                        <th className="px-3 py-2 font-normal">Obstacle</th>
                      </tr>
                    </thead>
                    <tbody>
                      {history.length === 0 && !loading && (
                        <tr>
                          <td colSpan={6} className="px-3 py-6 text-center text-slate-500">
                            Aucun relevé pour l'instant.
                          </td>
                        </tr>
                      )}
                      {history.map((row) => (
                        <tr key={row.id_telemetrie} className="border-t border-slate-800">
                          <td className="px-3 py-2 text-slate-300">{formatHeure(row.date_heure)}</td>
                          <td className="px-3 py-2">{row.batterie.toFixed(0)}%</td>
                          <td className="px-3 py-2">{row.altitude.toFixed(1)} m</td>
                          <td className="px-3 py-2">{row.vitesse.toFixed(1)} km/h</td>
                          <td className="px-3 py-2 text-slate-400">
                            {row.latitude != null ? `${row.latitude.toFixed(4)}, ${row.longitude.toFixed(4)}` : "--"}
                          </td>
                          <td className={row.obstacle_detecte ? "px-3 py-2 text-red-400" : "px-3 py-2 text-slate-400"}>
                            {row.distance_obstacle != null ? `${row.distance_obstacle.toFixed(0)} cm` : "--"}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </CardBody>
              </Card>
            </div>

            <div className="xl:h-full xl:min-h-0">
              <Card className="h-full min-h-0 flex flex-col">
                <CardHeader title="Journal d'activité" />
                <CardBody className="flex-1 min-h-0 overflow-y-auto">
                  {journal.length === 0 && !loading && (
                    <p className="text-sm text-slate-500">Aucune activité récente.</p>
                  )}
                  <ul className="space-y-3">
                    {journal.map((entry) => (
                      <li key={entry.id_historique} className="text-sm">
                        <p className="text-slate-200">{entry.action}</p>
                        <p className="text-xs text-slate-500">{formatHeure(entry.date_action)}</p>
                      </li>
                    ))}
                  </ul>
                </CardBody>
              </Card>
            </div>
          </div>
        </section>
      </div>
    </MainLayout>
  );
}
