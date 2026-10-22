import { LinearProgress, Stack, Typography } from "@mui/material";
import { BatteryFull, BatteryMedium, BatteryLow } from "lucide-react";
import TelemetryCard, {
  MetricValue,
} from "../../components/common/TelemetryCard";
import { useDrone } from "../../context/useDrone";
export default function BatteryCard() {
  const { battery, simulated, lastTelemetryAt } = useDrone();
  const available = simulated && lastTelemetryAt;
  const level = Math.max(0, Math.min(100, battery));
  const Icon =
    level > 60 ? BatteryFull : level > 20 ? BatteryMedium : BatteryLow;
  return (
    <TelemetryCard title="Batterie" icon={Icon}>
      <Stack spacing={1}>
        <MetricValue value={available ? `${level.toFixed(0)} %` : "—"} />
        <Typography
          variant="body2"
          sx={{
            color: "text.secondary",
          }}
        >
          {simulated ? "Valeur simulée" : "Mesure matérielle indisponible"}
        </Typography>
        <LinearProgress
          aria-label="Niveau de batterie"
          variant="determinate"
          value={available ? level : 0}
          color={level > 60 ? "success" : level > 20 ? "warning" : "error"}
          sx={{
            height: 5,
            borderRadius: 1,
          }}
        />
      </Stack>
    </TelemetryCard>
  );
}
