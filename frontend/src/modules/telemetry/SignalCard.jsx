import { Stack, Typography } from "@mui/material";
import { Wifi } from "lucide-react";
import TelemetryCard, {
  MetricValue,
} from "../../components/common/TelemetryCard";
import { useDrone } from "../../context/useDrone";
export default function SignalCard() {
  const { signal, simulated, lastTelemetryAt } = useDrone();
  return (
    <TelemetryCard title="Signal" icon={Wifi}>
      <Stack spacing={1}>
        <MetricValue
          value={simulated && lastTelemetryAt ? `${signal} %` : "—"}
        />
        <Typography
          variant="body2"
          sx={{
            color: "text.secondary",
          }}
        >
          {simulated ? "Valeur simulée" : "Mesure matérielle indisponible"}
        </Typography>
      </Stack>
    </TelemetryCard>
  );
}
