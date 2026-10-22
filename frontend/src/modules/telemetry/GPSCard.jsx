import { Stack, Typography } from "@mui/material";
import { MapPinned } from "lucide-react";
import TelemetryCard from "../../components/common/TelemetryCard";
import { useDrone } from "../../context/useDrone";
export default function GPSCard() {
  const { latitude, longitude, gpsFix, telemetryStale } = useDrone();
  const valid = gpsFix && !telemetryStale;
  return (
    <TelemetryCard title="Position GPS" icon={MapPinned}>
      <Stack spacing={1}>
        <Typography
          variant="body2"
          sx={{
            overflowWrap: "anywhere",
          }}
        >
          {valid ? `${latitude.toFixed(5)}, ${longitude.toFixed(5)}` : "—"}
        </Typography>
        <Typography
          variant="body2"
          sx={{
            color: valid ? "secondary.main" : "warning.main",
          }}
        >
          {valid ? "Position acquise" : "Position indisponible"}
        </Typography>
      </Stack>
    </TelemetryCard>
  );
}
