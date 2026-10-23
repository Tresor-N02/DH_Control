import {
  Alert,
  Box,
  Button,
  LinearProgress,
  Link,
  Paper,
  Stack,
  Typography,
} from "@mui/material";
import { visuallyHidden } from "@mui/utils";
import { OctagonX } from "lucide-react";
import Navbar from "./Navbar";
import Sidebar from "./Sidebar";
import { useDrone } from "../../context/useDrone";
export default function MainLayout({ children }) {
  const {
    droneId,
    droneLoading,
    droneError,
    reloadDrones,
    connected,
    telemetryStale,
    commandFeedback,
    emergencyStop,
  } = useDrone();
  return (
    <Box
      sx={{
        minHeight: "100vh",
        bgcolor: "background.default",
        color: "text.primary",
      }}
    >
      <Link
        href="#main-content"
        sx={{
          ...visuallyHidden,
          "&:focus": {
            position: "static",
            width: "auto",
            height: "auto",
            clip: "auto",
            overflow: "visible",
            display: "block",
            p: 2,
          },
        }}
      >
        Aller au contenu
      </Link>
      <Navbar />
      <Box
        sx={{
          display: "flex",
          alignItems: "flex-start",
        }}
      >
        <Sidebar />
        <Stack
          component="main"
          id="main-content"
          spacing={3}
          sx={{
            minWidth: 0,
            flex: 1,
            p: {
              xs: 2,
              md: 3.5,
            },
            pb: {
              xs: 16,
              md: 16,
            },
          }}
        >
          <Paper
            square
            elevation={3}
            sx={{
              position: "fixed",
              left: {
                xs: 0,
                lg: 256,
              },
              right: 0,
              bottom: 0,
              zIndex: 1100,
              borderTop: "1px solid",
              borderColor: "divider",
              px: {
                xs: 2,
                md: 3.5,
              },
              py: 1.5,
            }}
          >
            <Stack
              direction="row"
              sx={{
                alignItems: "center",
                justifyContent: "space-between",
                gap: 2,
              }}
            >
              <Button
                disabled={!droneId}
                onClick={emergencyStop}
                variant="contained"
                color="error"
                startIcon={<OctagonX size={20} />}
                sx={{
                  ml: "auto",
                  minHeight: 48,
                  px: 3,
                }}
              >
                Arrêt d’urgence
              </Button>
            </Stack>
          </Paper>
          {droneId && (!connected || telemetryStale) && (
            <Alert severity="warning" role="status">
              {!connected
                ? "Liaison perdue ou en cours de connexion."
                : "Données périmées."}{" "}
              Les dernières valeurs ne confirment pas l’état actuel du drone.
            </Alert>
          )}
          {commandFeedback && (
            <Alert
              role="status"
              aria-live="polite"
              severity={commandFeedback.error ? "error" : "info"}
            >
              {commandFeedback.message}
            </Alert>
          )}
          {droneLoading ? (
            <Box role="status">
              <Typography
                sx={{
                  mb: 1,
                }}
              >
                Chargement du drone…
              </Typography>
              <LinearProgress />
            </Box>
          ) : droneError || !droneId ? (
            <Alert severity={droneError ? "error" : "info"}>
              <Typography>
                {droneError ||
                  "Aucun drone configuré. Ajoutez un drone côté serveur pour commencer."}
              </Typography>
              <Button
                onClick={reloadDrones}
                variant="outlined"
                sx={{
                  mt: 2,
                }}
              >
                Réessayer
              </Button>
            </Alert>
          ) : (
            <Box
              sx={{
                minWidth: 0,
              }}
            >
              {children}
            </Box>
          )}
        </Stack>
      </Box>
    </Box>
  );
}
