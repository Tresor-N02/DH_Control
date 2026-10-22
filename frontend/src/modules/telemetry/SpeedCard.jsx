import { Gauge } from "lucide-react";

import Card from "../../components/common/Card";
import CardHeader from "../../components/common/CardHeader";
import CardBody from "../../components/common/CardBody";

import { useDrone } from "../../context/DroneContext";

export default function SpeedCard() {

  const { speed } = useDrone();

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
    color = "bg-red-500";
    status = "Rapide";
  }

  return (

    <Card>

      <CardHeader
        title="Vitesse"
        icon={Gauge}
      />

      <CardBody>

        <div className="flex items-end justify-between">

          <h1 className="text-xl font-bold">

            {currentSpeed.toFixed(1)}

            <span className="ml-2 text-sm text-slate-400">

              km/h

            </span>

          </h1>

          <span className="text-xs text-cyan-400 font-medium">

            {status}

          </span>

        </div>

        <div className="mt-2 h-1 rounded-full bg-slate-800">

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