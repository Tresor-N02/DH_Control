import { useCallback, useEffect, useState } from "react";
import { RefreshCw } from "lucide-react";
import {
  Alert,
  Box,
  Button,
  CircularProgress,
  Stack,
  Tab,
  Tabs,
} from "@mui/material";
import DataTable from "../components/common/DataTable";
import MainLayout from "../components/layout/MainLayout";
import PageHeading from "../components/common/PageHeading";
import Card from "../components/common/Card";
import { useDrone } from "../context/useDrone";
import * as api from "../services/api";
function formatHeure(iso) {
  try {
    return new Date(iso).toLocaleTimeString("fr-FR");
  } catch {
    return iso;
  }
}
const journalRowId = (row) => row.id_historique;
const journalColumns = [
  { field: "action", headerName: "Action", minWidth: 220, flex: 1 },
  { field: "date_action", headerName: "Date", type: "dateTime", minWidth: 170,
    valueGetter: (value) => value ? new Date(value) : null,
    valueFormatter: (value) => value ? value.toLocaleString("fr-FR") : "--" },
];
const telemetryRowId = (row) => row.id_telemetrie;
const numberLabel = (value, digits, unit) => value == null ? "--" : Number(value).toFixed(digits) + unit;
const telemetryColumns = [
  { field: "date_heure", headerName: "Heure", minWidth: 120, flex: 1,
    type: "dateTime", valueGetter: (value) => value ? new Date(value) : null,
    valueFormatter: (value) => value ? formatHeure(value) : "--" },
  { field: "batterie", headerName: "Batterie", type: "number", minWidth: 110, flex: 1,
    valueFormatter: (value) => numberLabel(value, 0, " %") },
  { field: "altitude", headerName: "Altitude", type: "number", minWidth: 110, flex: 1,
    valueFormatter: (value) => numberLabel(value, 1, " m") },
  { field: "vitesse", headerName: "Vitesse", type: "number", minWidth: 120, flex: 1,
    valueFormatter: (value) => numberLabel(value, 1, " km/h") },
  { field: "gps", headerName: "GPS", minWidth: 180, flex: 1,
    valueGetter: (_, row) => row.latitude != null && row.longitude != null
      ? Number(row.latitude).toFixed(4) + ", " + Number(row.longitude).toFixed(4) : "--" },
  { field: "distance_obstacle", headerName: "Obstacle", type: "number", minWidth: 120, flex: 1,
    valueFormatter: (value) => numberLabel(value, 0, " cm"),
    renderCell: ({ value, row }) => <Box component="span" sx={{ color: row.obstacle_detecte ? "error.main" : "text.secondary" }}>{numberLabel(value, 0, " cm")}</Box> },
];
export default function TelemetriePage() {
  const { droneId } = useDrone();
  const [activeTab, setActiveTab] = useState(0);
  const [history, setHistory] = useState([]);
  const [journal, setJournal] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const load = useCallback(async () => {
    if (!droneId) {
      setLoading(false);
      return;
    }
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
      setError(
        "Impossible de charger la télémétrie -- le backend est-il bien lancé ?",
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
  return (
    <MainLayout>
      <Stack spacing={3}>
        <PageHeading
          title="Historique de télémétrie"
          description="Consultez les derniers relevés et le journal des actions."
          action={
            <Button
              variant="outlined"
              onClick={load}
              disabled={loading}
              startIcon={
                loading ? (
                  <CircularProgress size={16} />
                ) : (
                  <RefreshCw size={18} />
                )
              }
            >
              Actualiser
            </Button>
          }
        />
        {error && <Alert severity="error">{error}</Alert>}
        <Card>
          <Tabs
            value={activeTab}
            onChange={(_, value) => setActiveTab(value)}
            aria-label="Données de télémétrie"
            variant="scrollable"
            scrollButtons="auto"
            sx={{ borderBottom: 1, borderColor: "divider" }}
          >
            <Tab id="telemetry-tab-0" aria-controls="telemetry-panel-0" label={`Relevés (${history.length})`} />
            <Tab id="telemetry-tab-1" aria-controls="telemetry-panel-1" label={`Journal d’activité (${journal.length})`} />
          </Tabs>
          <Box role="tabpanel" id="telemetry-panel-0" aria-labelledby="telemetry-tab-0" hidden={activeTab !== 0}>
            {activeTab === 0 && (
              <DataTable
                label="Historique de télémétrie"
                rows={history}
                columns={telemetryColumns}
                getRowId={telemetryRowId}
                loading={loading}
              />
            )}
          </Box>
          <Box role="tabpanel" id="telemetry-panel-1" aria-labelledby="telemetry-tab-1" hidden={activeTab !== 1}>
            {activeTab === 1 && (
              <DataTable
                label="Journal d’activité"
                rows={journal}
                columns={journalColumns}
                getRowId={journalRowId}
                loading={loading}
              />
            )}
          </Box>
        </Card>
      </Stack>
    </MainLayout>
  );
}
