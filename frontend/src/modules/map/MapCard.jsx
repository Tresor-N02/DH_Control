import Card from "../../components/common/Card";
import CardHeader from "../../components/common/CardHeader";
import CardBody from "../../components/common/CardBody";

import { Map } from "lucide-react";

import LeafletMap from "./LeafletMap";

export default function MapCard() {

  return (

    <Card className="h-full min-h-0 flex flex-col">

      <CardHeader
        title="Cartographie tactique"
        icon={Map}
      />

      <CardBody className="flex-1 min-h-0 p-0">

        <LeafletMap />

      </CardBody>

    </Card>

  );

}