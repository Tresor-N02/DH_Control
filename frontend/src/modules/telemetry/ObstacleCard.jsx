import { Stack, Typography } from "@mui/material";
import { ShieldAlert, ShieldCheck } from "lucide-react";
import TelemetryCard, {
  MetricValue,
} from "../../components/common/TelemetryCard";
import { useDrone } from "../../context/useDrone";
export default function ObstacleCard() {
  const { distanceObstacle, obstacleDetected } = useDrone();
  const available = distanceObstacle != null && distanceObstacle >= 0;
  return (
    <TelemetryCard
      title="Ultrason"
      icon={obstacleDetected ? ShieldAlert : ShieldCheck}
    >
      <Stack spacing={1}>
        <MetricValue
          value={available ? distanceObstacle.toFixed(0) : "--"}
          unit="cm"
          color={obstacleDetected ? "error.main" : "text.primary"}
        />
        <Typography
          variant="body2"
          sx={{
            fontWeight: 500,
            color: !available
              ? "warning.main"
              : obstacleDetected
                ? "error.main"
                : "secondary.main",
          }}
        >
          {!available
            ? "Pas de lecture"
            : obstacleDetected
              ? "Obstacle — avance bloquée"
              : "Voie libre"}
        </Typography>
      </Stack>
    </TelemetryCard>
  );
}
