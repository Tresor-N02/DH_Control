import { useCallback, useEffect, useState } from "react";
import { Plus, Play, Square, Loader2 } from "lucide-react";

import MainLayout from "../components/layout/MainLayout";
import Card from "../components/common/Card";
import CardHeader from "../components/common/CardHeader";
import CardBody from "../components/common/CardBody";
import { useDrone } from "../context/DroneContext";
import * as api from "../services/api";

const STATUT_STYLES = {
  PLANIFIEE: "bg-slate-700 text-slate-200",
  EN_COURS: "bg-cyan-600 text-white",
  TERMINEE: "bg-green-700 text-green-100",
  ANNULEE: "bg-red-900 text-red-200",
};

function formatDate(iso) {
  if (!iso) return "--";
  try {
    return new Date(iso).toLocaleString("fr-FR");
  } catch {
    return iso;
  }
}

export default function MissionPage() {
  const { droneId } = useDrone();
  const [missions, setMissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [titre, setTitre] = useState("");
  const [creating, setCreating] = useState(false);
  const [actingOn, setActingOn] = useState(null); // id_mission en cours d'action

  const load = useCallback(async () => {
    if (!droneId) return;
    setLoading(true);
    setError(null);
    try {
      const data = await api.fetchMissions(droneId);
      setMissions(data);
    } catch {
      setError("Impossible de charger les missions -- le backend est-il bien lancé ?");
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

  async function handleCreate(event) {
    event.preventDefault();
    if (!titre.trim() || !droneId) return;
    setCreating(true);
    try {
      await api.createMission(droneId, titre.trim());
      setTitre("");
      await load();
    } catch {
      setError("Impossible de créer la mission.");
    } finally {
      setCreating(false);
    }
  }

  async function handleDemarrer(missionId) {
    setActingOn(missionId);
    try {
      await api.demarrerMission(missionId);
      await load();
    } catch {
      setError("Impossible de démarrer cette mission.");
    } finally {
      setActingOn(null);
    }
  }

  async function handleTerminer(missionId) {
    setActingOn(missionId);
    try {
      await api.terminerMission(missionId);
      await load();
    } catch {
      setError("Impossible de terminer cette mission.");
    } finally {
      setActingOn(null);
    }
  }

  return (
    <MainLayout>
      <div className="flex flex-col gap-3 xl:h-full xl:min-h-0">
        <section className="shrink-0">
          <h2 className="mb-3 text-lg font-semibold">Missions</h2>

          <form onSubmit={handleCreate} className="flex gap-2">
            <input
              value={titre}
              onChange={(e) => setTitre(e.target.value)}
              placeholder="Titre de la nouvelle mission..."
              className="flex-1 rounded-lg border border-slate-800 bg-slate-900 px-3 py-2 text-sm outline-none focus:border-cyan-500"
            />
            <button
              type="submit"
              disabled={creating || !titre.trim()}
              className="flex items-center gap-2 rounded-lg bg-cyan-600 px-4 py-2 text-sm font-semibold transition hover:bg-cyan-500 disabled:opacity-60"
            >
              {creating ? <Loader2 size={16} className="animate-spin" /> : <Plus size={16} />}
              Créer
            </button>
          </form>

          {error && <p className="mt-2 text-sm text-red-400">{error}</p>}
        </section>

        <section className="xl:min-h-0 xl:flex-1">
          <Card className="h-full min-h-0 flex flex-col">
            <CardHeader title={`Liste des missions (${missions.length})`} />
            <CardBody className="flex-1 min-h-0 overflow-y-auto">
              {loading && missions.length === 0 && (
                <p className="text-sm text-slate-500">Chargement...</p>
              )}
              {!loading && missions.length === 0 && (
                <p className="text-sm text-slate-500">Aucune mission pour l'instant -- crée la première ci-dessus.</p>
              )}

              <ul className="space-y-2">
                {missions.map((mission) => (
                  <li
                    key={mission.id_mission}
                    className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-slate-800 bg-slate-950/40 px-4 py-3"
                  >
                    <div>
                      <p className="font-medium">{mission.titre}</p>
                      <p className="text-xs text-slate-500">
                        Début : {formatDate(mission.date_debut)} · Fin : {formatDate(mission.date_fin)}
                      </p>
                    </div>

                    <div className="flex items-center gap-2">
                      <span
                        className={`rounded-full px-2 py-0.5 text-xs font-semibold ${
                          STATUT_STYLES[mission.statut] || "bg-slate-700"
                        }`}
                      >
                        {mission.statut}
                      </span>

                      {mission.statut === "PLANIFIEE" && (
                        <button
                          onClick={() => handleDemarrer(mission.id_mission)}
                          disabled={actingOn === mission.id_mission}
                          className="flex items-center gap-1 rounded-lg bg-green-700 px-3 py-1.5 text-xs font-semibold transition hover:bg-green-600 disabled:opacity-60"
                        >
                          <Play size={12} /> Démarrer
                        </button>
                      )}
                      {mission.statut === "EN_COURS" && (
                        <button
                          onClick={() => handleTerminer(mission.id_mission)}
                          disabled={actingOn === mission.id_mission}
                          className="flex items-center gap-1 rounded-lg bg-red-700 px-3 py-1.5 text-xs font-semibold transition hover:bg-red-600 disabled:opacity-60"
                        >
                          <Square size={12} /> Terminer
                        </button>
                      )}
                    </div>
                  </li>
                ))}
              </ul>
            </CardBody>
          </Card>
        </section>
      </div>
    </MainLayout>
  );
}
