import { Box } from "@mui/material";
import MainLayout from "../components/layout/MainLayout";
import ControlPanel from "../modules/control/ControlPanel";
import VideoPanel from "../modules/video/VideoPanel";

export default function ControlePage() {
  return (
    <MainLayout>
      <Box sx={{
        display: "grid",
        gridTemplateColumns: { xs: "minmax(0, 1fr)", md: "300px minmax(0, 1fr)", xl: "320px minmax(0, 1fr)" },
        gridTemplateAreas: { xs: '"camera" "controls"', md: '"controls camera"' },
        alignItems: "stretch",
        gap: { xs: 2, md: 2.5 },
      }}>
        <Box sx={{ gridArea: "controls", minWidth: 0 }}>
          <ControlPanel />
        </Box>
        <Box component="section" aria-label="Caméra embarquée" sx={{
          gridArea: "camera",
          minWidth: 0,
          height: { xs: 360, sm: 440, md: "100%" },
          minHeight: { md: 520 },
        }}>
          <VideoPanel />
        </Box>
      </Box>
    </MainLayout>
  );
}
