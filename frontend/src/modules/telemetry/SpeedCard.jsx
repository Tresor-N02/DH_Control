import { LinearProgress, Stack, Typography } from "@mui/material";
import { Gauge } from "lucide-react";
import TelemetryCard, {
  MetricValue,
} from "../../components/common/TelemetryCard";
import { useDrone } from "../../context/useDrone";
export default function SpeedCard() {
  const { speed, lastTelemetryAt } = useDrone();
  const value = Math.abs(speed);
  const status = !lastTelemetryAt
    ? "En attente"
    : value >= 20
      ? "Rapide"
      : value >= 10
        ? "Croisière"
        : value > 0
          ? "Lent"
          : "Arrêt";
  return (
    <TelemetryCard title="Vitesse" icon={Gauge}>
      <Stack spacing={1}>
        <Stack
          direction="row"
          sx={{
            flexWrap: "wrap",
            alignItems: "flex-end",
            justifyContent: "space-between",
            gap: 1,
          }}
        >
          <MetricValue
            value={lastTelemetryAt ? value.toFixed(1) : "—"}
            unit="km/h"
          />
          <Typography
            variant="body2"
            sx={{
              color: "secondary.main",
            }}
          >
            {status}
          </Typography>
        </Stack>
        <LinearProgress
          aria-label="Vitesse relative"
          variant="determinate"
          value={Math.min(value * 5, 100)}
          color={value >= 20 ? "error" : value >= 10 ? "warning" : "success"}
          sx={{
            height: 5,
            borderRadius: 1,
          }}
        />
      </Stack>
    </TelemetryCard>
  );
}
