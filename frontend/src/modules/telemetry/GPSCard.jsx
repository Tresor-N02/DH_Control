import { MapPinned } from "lucide-react";

import Card from "../../components/common/Card";
import CardHeader from "../../components/common/CardHeader";
import CardBody from "../../components/common/CardBody";

import { useDrone } from "../../context/DroneContext";

export default function GPSCard() {

  const {
    latitude,
    longitude,
    gpsFix,
  } = useDrone();

  return (

    <Card>

      <CardHeader
        title="Position GPS"
        icon={MapPinned}
      />

      <CardBody>

        <div className="space-y-1 text-xs">

          <div className="flex justify-between">

            <span className="text-slate-400">
              Latitude
            </span>

            <span className="font-medium">
              {latitude.toFixed(5)}
            </span>

          </div>

          <div className="flex justify-between">

            <span className="text-slate-400">
              Longitude
            </span>

            <span className="font-medium">
              {longitude.toFixed(5)}
            </span>

          </div>

          <div className="flex justify-between items-center">

            <span className="text-slate-400">
              GPS
            </span>

            <span
              className={`font-semibold ${
                gpsFix
                  ? "text-green-400"
                  : "text-red-400"
              }`}
            >
              {gpsFix ? "FIX" : "NO FIX"}
            </span>

          </div>

        </div>

      </CardBody>

    </Card>

  );

}