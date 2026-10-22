import {
  BatteryFull,
  BatteryMedium,
  BatteryLow,
} from "lucide-react";

import Card from "../../components/common/Card";
import CardHeader from "../../components/common/CardHeader";
import CardBody from "../../components/common/CardBody";

import { useDrone } from "../../context/DroneContext";

export default function BatteryCard() {

  const { battery } = useDrone();

  const Icon =
    battery > 60
      ? BatteryFull
      : battery > 20
      ? BatteryMedium
      : BatteryLow;

  return (
    <Card>

      <CardHeader
        title="Batterie"
        icon={Icon}
      />

      <CardBody>

        <h1 className="text-xl font-bold">

          {battery.toFixed(0)}%

        </h1>

        <div
          className="
            mt-2
            h-1
            rounded-full
            bg-slate-800
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
                  : "bg-red-500"
              }
            `}
            style={{
              width: `${battery}%`,
            }}
          />
        </div>

      </CardBody>

    </Card>
  );
}