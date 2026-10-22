import { useCallback, useEffect, useState } from "react";
import { RefreshCw } from "lucide-react";
import {
  Alert,
  Box,
  Button,
  CircularProgress,
  List,
  ListItem,
  ListItemText,
  Stack,
  Table,
  TableContainer,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  Typography,
} from "@mui/material";
import MainLayout from "../components/layout/MainLayout";
import PageHeading from "../components/common/PageHeading";
import Card from "../components/common/Card";
import CardHeader from "../components/common/CardHeader";
import CardBody from "../components/common/CardBody";
import { useDrone } from "../context/useDrone";
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
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: {
              xs: "minmax(0, 1fr)",
              xl: "minmax(0, 2fr) minmax(0, 1fr)",
            },
            gap: 2.5,
          }}
        >
          <Card>
            <CardHeader title={`Relevés (${history.length})`} />
            <TableContainer
              sx={{
                maxHeight: 640,
              }}
            >
              <Table
                stickyHeader
                size="small"
                aria-label="Historique de télémétrie"
                sx={{
                  minWidth: 640,
                }}
              >
                <TableHead>
                  <TableRow>
                    {[
                      "Heure",
                      "Batterie",
                      "Altitude",
                      "Vitesse",
                      "GPS",
                      "Obstacle",
                    ].map((label) => (
                      <TableCell key={label} scope="col">
                        {label}
                      </TableCell>
                    ))}
                  </TableRow>
                </TableHead>
                <TableBody>
                  {loading && (
                    <TableRow>
                      <TableCell colSpan={6}>
                        <Stack
                          direction="row"
                          spacing={1}
                          sx={{
                            alignItems: "center",
                          }}
                        >
                          <CircularProgress size={18} />
                          <Typography variant="body2">
                            Chargement des relevés…
                          </Typography>
                        </Stack>
                      </TableCell>
                    </TableRow>
                  )}
                  {!history.length && !loading && (
                    <TableRow>
                      <TableCell
                        colSpan={6}
                        align="center"
                        sx={{
                          py: 4,
                        }}
                      >
                        Aucun relevé pour l’instant.
                      </TableCell>
                    </TableRow>
                  )}
                  {history.map((row) => (
                    <TableRow key={row.id_telemetrie} hover>
                      <TableCell>{formatHeure(row.date_heure)}</TableCell>
                      <TableCell>{row.batterie.toFixed(0)}%</TableCell>
                      <TableCell>{row.altitude.toFixed(1)} m</TableCell>
                      <TableCell>{row.vitesse.toFixed(1)} km/h</TableCell>
                      <TableCell>
                        {row.latitude != null && row.longitude != null
                          ? `${row.latitude.toFixed(4)}, ${row.longitude.toFixed(4)}`
                          : "--"}
                      </TableCell>
                      <TableCell
                        sx={{
                          color: row.obstacle_detecte
                            ? "error.main"
                            : "text.secondary",
                        }}
                      >
                        {row.distance_obstacle != null
                          ? `${row.distance_obstacle.toFixed(0)} cm`
                          : "--"}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Card>
          <Card>
            <CardHeader title="Journal d’activité" />
            <CardBody
              sx={{
                maxHeight: 640,
                overflow: "auto",
              }}
            >
              {!journal.length && !loading && (
                <Typography
                  sx={{
                    color: "text.secondary",
                  }}
                >
                  Aucune activité récente.
                </Typography>
              )}
              <List disablePadding>
                {journal.map((entry) => (
                  <ListItem key={entry.id_historique} disableGutters divider>
                    <ListItemText
                      primary={entry.action}
                      secondary={formatHeure(entry.date_action)}
                      slotProps={{
                        primary: {
                          sx: {
                            overflowWrap: "anywhere",
                          },
                        },
                      }}
                    />
                  </ListItem>
                ))}
              </List>
            </CardBody>
          </Card>
        </Box>
      </Stack>
    </MainLayout>
  );
}
