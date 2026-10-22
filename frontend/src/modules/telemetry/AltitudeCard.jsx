import { Mountain } from "lucide-react";

import Card from "../../components/common/Card";
import CardHeader from "../../components/common/CardHeader";
import CardBody from "../../components/common/CardBody";

import { useDrone } from "../../context/DroneContext";

export default function AltitudeCard() {

  const { altitude } = useDrone();

  return (

    <Card>

      <CardHeader

        title="Altitude"

        icon={Mountain}

      />

      <CardBody>

        <h1 className="text-xl font-bold">

          {altitude.toFixed(1)}

          <span className="ml-2 text-base text-slate-400">

            m

          </span>

        </h1>

      </CardBody>

    </Card>

  );

}