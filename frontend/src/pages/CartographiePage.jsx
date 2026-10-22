import { Box, Stack } from "@mui/material";
import MainLayout from "../components/layout/MainLayout";
import PageHeading from "../components/common/PageHeading";
import MapCard from "../modules/map/MapCard";
import GPSCard from "../modules/telemetry/GPSCard";
import AltitudeCard from "../modules/telemetry/AltitudeCard";
export default function CartographiePage() {
  return (
    <MainLayout>
      <Stack spacing={3}>
        <PageHeading
          title="Cartographie"
          description="Localisez le drone et activez le suivi pour garder sa position en vue."
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
          <GPSCard />
          <AltitudeCard />
        </Box>
        <Box component="section" sx={{ height: "60vh", minHeight: 320 }}>
          <MapCard />
        </Box>
      </Stack>
    </MainLayout>
  );
}
