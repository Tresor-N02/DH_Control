import { Mountain } from "lucide-react";
import TelemetryCard, {
  MetricValue,
} from "../../components/common/TelemetryCard";
import { useDrone } from "../../context/useDrone";
export default function AltitudeCard() {
  const { altitude, lastTelemetryAt } = useDrone();
  return (
    <TelemetryCard title="Altitude" icon={Mountain}>
      <MetricValue
        value={lastTelemetryAt ? altitude.toFixed(1) : "—"}
        unit="m"
      />
    </TelemetryCard>
  );
}
