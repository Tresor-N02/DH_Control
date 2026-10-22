import { Wifi } from "lucide-react";

import Card from "../../components/common/Card";
import CardHeader from "../../components/common/CardHeader";
import CardBody from "../../components/common/CardBody";

import { useDrone } from "../../context/DroneContext";

export default function SignalCard() {

  const { signal } = useDrone();

  return (

    <Card>

      <CardHeader

        title="Signal"

        icon={Wifi}

      />

      <CardBody>

        <h1
          className={`
            text-xl
            font-bold

            ${
              signal > 80
                ? "text-green-400"
                : signal > 40
                ? "text-yellow-400"
                : "text-red-400"
            }
          `}
        >

          {signal}%

        </h1>

      </CardBody>

    </Card>

  );

}