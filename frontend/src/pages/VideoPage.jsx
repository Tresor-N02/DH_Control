import { Box, Stack } from "@mui/material";
import MainLayout from "../components/layout/MainLayout";
import PageHeading from "../components/common/PageHeading";
import VideoPanel from "../modules/video/VideoPanel";
import ObstacleCard from "../modules/telemetry/ObstacleCard";
import SpeedCard from "../modules/telemetry/SpeedCard";
export default function VideoPage() {
  return (
    <MainLayout>
      <Stack spacing={3}>
        <PageHeading
          title="Vidéo"
          description="Consultez la caméra embarquée, les détections et les captures d’image."
        />
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: {
              xs: "minmax(0, 1fr)",
              sm: "repeat(2, minmax(0, 1fr))",
            },
            gap: 2,
            width: { lg: "70%" },
          }}
        >
          <ObstacleCard />
          <SpeedCard />
        </Box>
        <Box component="section" sx={{ height: "60vh", minHeight: 320 }}>
          <VideoPanel />
        </Box>
      </Stack>
    </MainLayout>
  );
}
