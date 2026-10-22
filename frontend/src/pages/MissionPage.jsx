import { useCallback, useEffect, useState } from "react";
import { Plus, Play, Square } from "lucide-react";
import {
  Alert,
  Box,
  Button,
  Chip,
  CircularProgress,
  List,
  ListItem,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import MainLayout from "../components/layout/MainLayout";
import PageHeading from "../components/common/PageHeading";
import Card from "../components/common/Card";
import CardHeader from "../components/common/CardHeader";
import CardBody from "../components/common/CardBody";
import { useDrone } from "../context/useDrone";
import * as api from "../services/api";
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
    if (!droneId) {
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const data = await api.fetchMissions(droneId);
      setMissions(data);
    } catch {
      setError(
        "Impossible de charger les missions -- le backend est-il bien lancé ?",
      );
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
      <Stack spacing={3}>
        <PageHeading
          title="Missions"
          description="Créez une mission puis suivez son démarrage et sa fin."
        />
        <Box
          component="form"
          onSubmit={handleCreate}
          sx={{
            display: "flex",
            flexWrap: "wrap",
            gap: 2,
            alignItems: "flex-start",
          }}
        >
          <TextField
            label="Titre de la mission"
            id="mission-title"
            slotProps={{
              htmlInput: {
                maxLength: 200,
              },
            }}
            required
            value={titre}
            onChange={(e) => setTitre(e.target.value)}
            placeholder="Titre de la nouvelle mission..."
            sx={{
              flex: "1 1 240px",
              minWidth: 0,
            }}
          />
          <Button
            variant="contained"
            type="submit"
            disabled={creating || !titre.trim() || !droneId}
            startIcon={
              creating ? (
                <CircularProgress size={16} color="inherit" />
              ) : (
                <Plus size={18} />
              )
            }
          >
            Créer
          </Button>
        </Box>
        {error && <Alert severity="error">{error}</Alert>}
        <Card>
          <CardHeader title={`Liste des missions (${missions.length})`} />
          <CardBody>
            {loading && missions.length === 0 && (
              <Stack
                direction="row"
                spacing={1}
                role="status"
                sx={{
                  alignItems: "center",
                }}
              >
                <CircularProgress size={20} />
                <Typography
                  sx={{
                    color: "text.secondary",
                  }}
                >
                  Chargement…
                </Typography>
              </Stack>
            )}
            {!loading && missions.length === 0 && (
              <Typography
                sx={{
                  color: "text.secondary",
                }}
              >
                Aucune mission pour l’instant. Créez la première ci-dessus.
              </Typography>
            )}
            <List
              disablePadding
              sx={{
                display: "grid",
                gap: 1.5,
              }}
            >
              {missions.map((mission) => (
                <ListItem
                  key={mission.id_mission}
                  disableGutters
                  sx={{
                    p: 2,
                    border: "1px solid",
                    borderColor: "divider",
                    borderRadius: 2,
                    flexWrap: "wrap",
                    gap: 2,
                  }}
                >
                  <Box
                    sx={{
                      flex: "1 1 200px",
                      minWidth: 0,
                    }}
                  >
                    <Typography
                      sx={{
                        fontWeight: 600,
                        overflowWrap: "anywhere",
                      }}
                    >
                      {mission.titre}
                    </Typography>
                    <Typography
                      variant="body2"
                      sx={{
                        color: "text.secondary",
                      }}
                    >
                      Début : {formatDate(mission.date_debut)} · Fin :{" "}
                      {formatDate(mission.date_fin)}
                    </Typography>
                  </Box>
                  <Stack
                    direction="row"
                    sx={{
                      alignItems: "center",
                      flexWrap: "wrap",
                      gap: 1,
                    }}
                  >
                    <Chip
                      size="small"
                      variant="outlined"
                      color={
                        mission.statut === "EN_COURS"
                          ? "primary"
                          : mission.statut === "TERMINEE"
                            ? "success"
                            : mission.statut === "ANNULEE"
                              ? "error"
                              : "default"
                      }
                      label={
                        {
                          PLANIFIEE: "Planifiée",
                          EN_COURS: "En cours",
                          TERMINEE: "Terminée",
                          ANNULEE: "Annulée",
                        }[mission.statut] || mission.statut
                      }
                    />
                    {mission.statut === "PLANIFIEE" && (
                      <Button
                        variant="contained"
                        onClick={() => handleDemarrer(mission.id_mission)}
                        disabled={actingOn === mission.id_mission}
                        startIcon={<Play size={16} />}
                      >
                        Démarrer
                      </Button>
                    )}
                    {mission.statut === "EN_COURS" && (
                      <Button
                        variant="outlined"
                        onClick={() => handleTerminer(mission.id_mission)}
                        disabled={actingOn === mission.id_mission}
                        startIcon={<Square size={16} />}
                      >
                        Terminer
                      </Button>
                    )}
                  </Stack>
                </ListItem>
              ))}
            </List>
          </CardBody>
        </Card>
      </Stack>
    </MainLayout>
  );
}
