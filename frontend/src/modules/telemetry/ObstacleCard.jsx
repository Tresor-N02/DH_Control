import { ShieldAlert, ShieldCheck } from "lucide-react";

import Card from "../../components/common/Card";
import CardHeader from "../../components/common/CardHeader";
import CardBody from "../../components/common/CardBody";

import { useDrone } from "../../context/useDrone";

export default function ObstacleCard() {
  const { distanceObstacle, obstacleDetected } = useDrone();

  const hasReading = distanceObstacle != null && distanceObstacle >= 0;

  return (
    <Card className="telemetry-value">
      <CardHeader
        title="Ultrason"
        icon={obstacleDetected ? ShieldAlert : ShieldCheck}
      />

      <CardBody>
        <h1
          className={`text-2xl font-bold ${obstacleDetected ? "text-red-400" : ""}`}
        >
          {hasReading ? distanceObstacle.toFixed(0) : "--"}
          <span className="ml-2 text-base text-slate-400">cm</span>
        </h1>

        <p
          className={`mt-1 text-xs font-medium ${!hasReading ? "text-amber-300" : obstacleDetected ? "text-red-400" : "text-cyan-300"}`}
        >
          {!hasReading
            ? "Pas de lecture"
            : obstacleDetected
              ? "Obstacle -- avance bloquée"
              : "Voie libre"}
        </p>
      </CardBody>
    </Card>
  );
}
