import { useCallback, useEffect, useState } from "react";
import { Plus, Play, Square } from "lucide-react";
import {
  Alert,
  Box,
  Button,
  Chip,
  CircularProgress,
  Stack,
  TextField,
} from "@mui/material";
import DataTable from "../components/common/DataTable";
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
const missionRowId = (row) => row.id_mission;
const statusLabels = { PLANIFIEE: "Planifiée", EN_COURS: "En cours", TERMINEE: "Terminée", ANNULEE: "Annulée" };
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
  const columns = [
    { field: "titre", headerName: "Mission", minWidth: 220, flex: 1 },
    ...[ ["date_debut", "Début"], ["date_fin", "Fin"] ].map(([field, headerName]) => ({
      field, headerName, type: "dateTime", minWidth: 175, flex: 1,
      valueGetter: (value) => value ? new Date(value) : null,
      valueFormatter: (value) => formatDate(value),
    })),
    { field: "statut", headerName: "Statut", type: "singleSelect", minWidth: 140,
      valueOptions: Object.entries(statusLabels).map(([value, label]) => ({ value, label })),
      renderCell: ({ value }) => <Chip size="small" variant="outlined"
        color={value === "EN_COURS" ? "primary" : value === "TERMINEE" ? "success" : value === "ANNULEE" ? "error" : "default"}
        label={statusLabels[value] || value} /> },
    { field: "actions", headerName: "Actions", minWidth: 160, sortable: false, filterable: false, disableExport: true,
      renderCell: ({ row, tabIndex }) => row.statut === "PLANIFIEE" ? (
        <Button tabIndex={tabIndex} size="small" variant="contained" onClick={() => handleDemarrer(row.id_mission)}
          disabled={actingOn === row.id_mission} startIcon={<Play size={16} />}>Démarrer</Button>
      ) : row.statut === "EN_COURS" ? (
        <Button tabIndex={tabIndex} size="small" variant="outlined" onClick={() => handleTerminer(row.id_mission)}
          disabled={actingOn === row.id_mission} startIcon={<Square size={16} />}>Terminer</Button>
      ) : null },
  ];
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
            <DataTable
              label="Liste des missions"
              rows={missions}
              columns={columns}
              getRowId={missionRowId}
              loading={loading}
            />
          </CardBody>
        </Card>
      </Stack>
    </MainLayout>
  );
}
