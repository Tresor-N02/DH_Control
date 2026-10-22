import { MapPinned } from "lucide-react";
import Card from "../../components/common/Card";
import CardHeader from "../../components/common/CardHeader";
import CardBody from "../../components/common/CardBody";
import { useDrone } from "../../context/useDrone";
export default function GPSCard() {
  const { latitude, longitude, gpsFix, telemetryStale } = useDrone();
  const valid = gpsFix && !telemetryStale;
  return (
    <Card className="telemetry-value">
      <CardHeader title="Position GPS" icon={MapPinned} />
      <CardBody>
        <p className="text-sm tabular-nums">
          {valid ? `${latitude.toFixed(5)}, ${longitude.toFixed(5)}` : "—"}
        </p>
        <p
          className={`mt-2 text-xs ${valid ? "text-accent-ink" : "text-warning-ink"}`}
        >
          {valid ? "Position acquise" : "Position indisponible"}
        </p>
      </CardBody>
    </Card>
  );
}
