import { Box, Stack } from "@mui/material";
import MainLayout from "../components/layout/MainLayout";
import PageHeading from "../components/common/PageHeading";
import ControlPanel from "../modules/control/ControlPanel";
import VideoPanel from "../modules/video/VideoPanel";
import ObstacleCard from "../modules/telemetry/ObstacleCard";
import SpeedCard from "../modules/telemetry/SpeedCard";
import BatteryCard from "../modules/telemetry/BatteryCard";
export default function ControlePage() {
  return (
    <MainLayout>
      <Stack spacing={3}>
        <PageHeading
          eyebrow="Commandes"
          title="Pilotage terrestre"
          description="Gardez la caméra en vue et utilisez le joystick pour déplacer le drone."
        />
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: {
              xs: "minmax(0, 1fr)",
              sm: "repeat(3, minmax(0, 1fr))",
            },
            gap: 2,
          }}
        >
          <BatteryCard />
          <SpeedCard />
          <ObstacleCard />
        </Box>
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: {
              xs: "minmax(0, 1fr)",
              xl: "minmax(0, 1fr) 360px",
            },
            alignItems: "start",
            gap: 2.5,
          }}
        >
          <Box sx={{ height: 480, minWidth: 0 }}>
            <VideoPanel />
          </Box>
          <ControlPanel />
        </Box>
      </Stack>
    </MainLayout>
  );
}
