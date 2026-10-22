import { Mountain } from "lucide-react";

import Card from "../../components/common/Card";
import CardHeader from "../../components/common/CardHeader";
import CardBody from "../../components/common/CardBody";

import { useDrone } from "../../context/useDrone";

export default function AltitudeCard() {
  const { altitude, lastTelemetryAt } = useDrone();

  return (
    <Card className="telemetry-value">
      <CardHeader
        title="Altitude"

        icon={Mountain}
      />

      <CardBody>
        <p className="text-4xl font-semibold tracking-tight">
          {lastTelemetryAt ? altitude.toFixed(1) : "—"}

          <span className="ml-2 text-base text-subtle">m</span>
        </p>
      </CardBody>
    </Card>
  );
}
