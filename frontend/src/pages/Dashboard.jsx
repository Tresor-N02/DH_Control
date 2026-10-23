import { Box, Button, Stack, Typography } from "@mui/material";
import { Link } from "react-router-dom";
import { ArrowUpRight, Gamepad2 } from "lucide-react";
import MainLayout from "../components/layout/MainLayout";
import BatteryCard from "../modules/telemetry/BatteryCard";
import GPSCard from "../modules/telemetry/GPSCard";
import AltitudeCard from "../modules/telemetry/AltitudeCard";
import SpeedCard from "../modules/telemetry/SpeedCard";
import SignalCard from "../modules/telemetry/SignalCard";
import ObstacleCard from "../modules/telemetry/ObstacleCard";
import MapCard from "../modules/map/MapCard";
import VideoPanel from "../modules/video/VideoPanel";

const metricGrid = {
  display: "grid",
  gridTemplateColumns: { xs: "minmax(0, 1fr)", sm: "repeat(3, minmax(0, 1fr))" },
  gap: { xs: 1.5, md: 2 },
  "& > .MuiCard-root": { borderRadius: 3, boxShadow: "none" },
};

export default function Dashboard() {
  return (
    <MainLayout>
      <Stack spacing={{ xs: 2.5, md: 3 }}>
        <Box component="section" aria-label="Indicateurs principaux" sx={metricGrid}>
          <BatteryCard />
          <SpeedCard />
          <ObstacleCard />
        </Box>

        <Stack direction={{ xs: "column", sm: "row" }} spacing={1.5}
          sx={{ alignItems: { sm: "center" }, justifyContent: "space-between" }}>
          <Typography component="h2" variant="h6" sx={{ fontSize: "1rem", fontWeight: 700 }}>
            Caméra et position
          </Typography>
          <Button component={Link} variant="contained" to="/controle"
            startIcon={<Gamepad2 size={18} />} endIcon={<ArrowUpRight size={16} />}
            sx={{ minHeight: 44, borderRadius: 2, boxShadow: "none", px: 2 }}>
            Ouvrir le pilotage
          </Button>
        </Stack>

        <Box component="section" aria-label="Caméra et carte"
          sx={{
            display: "grid",
            gridTemplateColumns: { xs: "minmax(0, 1fr)", lg: "minmax(0, 1.25fr) minmax(0, 1fr)" },
            gap: { xs: 2, md: 2.5 },
            "& > .MuiBox-root": { minWidth: 0, height: { xs: 360, sm: 420, xl: 480 } },
            "& .MuiCard-root": { borderRadius: 3 },
            "& .MuiCardHeader-action": { m: 0, alignSelf: "center" },
          }}>
          <Box>
            <VideoPanel action={
              <Button component={Link} to="/video" size="small" aria-label="Ouvrir la page caméra"
                endIcon={<ArrowUpRight size={16} />} sx={{ minHeight: 40 }}>Ouvrir</Button>
            } />
          </Box>
          <Box>
            <MapCard action={
              <Button component={Link} to="/cartographie" size="small" aria-label="Ouvrir la cartographie"
                endIcon={<ArrowUpRight size={16} />} sx={{ minHeight: 40 }}>Ouvrir</Button>
            } />
          </Box>
        </Box>

        <Stack component="section" aria-labelledby="dashboard-details" spacing={2}>
          <Stack direction="row" sx={{ justifyContent: "space-between", alignItems: "center", gap: 1 }}>
            <Typography id="dashboard-details" component="h2" variant="h6"
              sx={{ fontSize: "1rem", fontWeight: 700 }}>Mesures complémentaires</Typography>
            <Button component={Link} to="/telemetrie" size="small" endIcon={<ArrowUpRight size={16} />}
              sx={{ minHeight: 44, flexShrink: 0 }}>Historique</Button>
          </Stack>
          <Box sx={metricGrid}>
            <GPSCard />
            <AltitudeCard />
            <SignalCard />
          </Box>
        </Stack>
      </Stack>
    </MainLayout>
  );
}
