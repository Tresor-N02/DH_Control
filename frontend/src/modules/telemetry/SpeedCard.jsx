import { Gauge } from "lucide-react";

import Card from "../../components/common/Card";
import CardHeader from "../../components/common/CardHeader";
import CardBody from "../../components/common/CardBody";

import { useDrone } from "../../context/useDrone";

export default function SpeedCard() {
  const { speed, lastTelemetryAt } = useDrone();

  const currentSpeed = Math.abs(speed);

  let color = "bg-green-500";
  let status = "Arrêt";

  if (currentSpeed > 0) {
    status = "Lent";
  }

  if (currentSpeed >= 10) {
    color = "bg-yellow-500";
    status = "Croisière";
  }

  if (currentSpeed >= 20) {
    color = "bg-red-500 text-white";
    status = "Rapide";
  }

  return (
    <Card className="telemetry-value">
      <CardHeader title="Vitesse" icon={Gauge} />

      <CardBody>
        <div className="flex flex-wrap items-end justify-between gap-2">
          <p className="text-4xl font-semibold tracking-tight">
            {lastTelemetryAt ? currentSpeed.toFixed(1) : "—"}

            <span className="ml-2 text-sm text-subtle">km/h</span>
          </p>

          <span className="text-xs text-accent-ink font-medium">
            {lastTelemetryAt ? status : "En attente"}
          </span>
        </div>

        <div className="mt-2 h-1 rounded-full bg-muted">
          <div
            className={`${color} h-1 rounded-full transition-all duration-300`}
            style={{
              width: `${Math.min(currentSpeed * 5, 100)}%`,
            }}
          />
        </div>
      </CardBody>
    </Card>
  );
}
