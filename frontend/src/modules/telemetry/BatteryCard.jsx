import { BatteryFull, BatteryMedium, BatteryLow } from "lucide-react";

import Card from "../../components/common/Card";
import CardHeader from "../../components/common/CardHeader";
import CardBody from "../../components/common/CardBody";

import { useDrone } from "../../context/useDrone";

export default function BatteryCard() {
  const { battery, simulated, lastTelemetryAt } = useDrone();

  const Icon =
    battery > 60 ? BatteryFull : battery > 20 ? BatteryMedium : BatteryLow;

  return (
    <Card className="telemetry-value">
      <CardHeader title="Batterie" icon={Icon} />

      <CardBody>
        <p className="text-4xl font-semibold tracking-tight">
          {simulated && lastTelemetryAt ? `${battery.toFixed(0)} %` : "—"}
        </p>

        <p className="mt-2 text-xs text-subtle">
          {simulated ? "Valeur simulée" : "Mesure matérielle indisponible"}
        </p>
        <div
          className="
            mt-2
            h-1
            rounded-full
            bg-muted
          "
        >
          <div
            className={`
              h-1
              rounded-full
              transition-all
              duration-500
              ${
                battery > 60
                  ? "bg-green-500"
                  : battery > 20
                    ? "bg-yellow-500"
                    : "bg-red-500 text-white"
              }
            `}
            style={{
              width: `${simulated && lastTelemetryAt ? battery : 0}%`,
            }}
          />
        </div>
      </CardBody>
    </Card>
  );
}
