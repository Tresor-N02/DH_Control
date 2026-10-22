import { Box, Button, Stack, Typography } from "@mui/material";
import { Link } from "react-router-dom";
import { ArrowUpRight } from "lucide-react";
import MainLayout from "../components/layout/MainLayout";
import PageHeading from "../components/common/PageHeading";
import BatteryCard from "../modules/telemetry/BatteryCard";
import GPSCard from "../modules/telemetry/GPSCard";
import AltitudeCard from "../modules/telemetry/AltitudeCard";
import SpeedCard from "../modules/telemetry/SpeedCard";
import SignalCard from "../modules/telemetry/SignalCard";
import ObstacleCard from "../modules/telemetry/ObstacleCard";
import MapCard from "../modules/map/MapCard";
import VideoPanel from "../modules/video/VideoPanel";
export default function Dashboard() {
  const grid = {
    display: "grid",
    gridTemplateColumns: {
      xs: "minmax(0, 1fr)",
      sm: "repeat(3, minmax(0, 1fr))",
    },
    gap: 2,
  };
  return (
    <MainLayout>
      <Stack spacing={3.5}>
        <PageHeading
          eyebrow="Supervision"
          title="Vue d’ensemble"
          description="Retrouvez l’état du drone, sa position et sa caméra en un seul endroit."
          action={
            <Button
              component={Link}
              variant="contained"
              to="/controle"
              endIcon={<ArrowUpRight size={20} />}
              sx={{
                flexShrink: 0,
              }}
            >
              Ouvrir le pilotage
            </Button>
          }
        />
        <Box component="section" aria-label="Indicateurs principaux" sx={grid}>
          <BatteryCard />
          <SpeedCard />
          <ObstacleCard />
        </Box>
        <Box
          component="section"
          aria-label="Caméra et position"
          sx={{
            display: "grid",
            gridTemplateColumns: {
              xs: "minmax(0, 1fr)",
              xl: "repeat(2, minmax(0, 1fr))",
            },
            gap: 2.5,
          }}
        >
          <Box
            sx={{
              height: 400,
              minWidth: 0,
            }}
          >
            <VideoPanel />
          </Box>
          <Box
            sx={{
              height: 400,
              minWidth: 0,
            }}
          >
            <MapCard />
          </Box>
        </Box>
        <Stack component="section" spacing={2}>
          <Box>
            <Typography component="h2" variant="h6">
              Informations complémentaires
            </Typography>
            <Typography
              variant="body2"
              sx={{
                color: "text.secondary",
              }}
            >
              Position, altitude et qualité de réception.
            </Typography>
          </Box>
          <Box sx={grid}>
            <GPSCard />
            <AltitudeCard />
            <SignalCard />
          </Box>
        </Stack>
      </Stack>
    </MainLayout>
  );
}
