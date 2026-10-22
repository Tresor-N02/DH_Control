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
        <p
          className={`text-4xl font-semibold tracking-tight ${obstacleDetected ? "text-error-ink" : ""}`}
        >
          {hasReading ? distanceObstacle.toFixed(0) : "--"}
          <span className="ml-2 text-base text-subtle">cm</span>
        </p>

        <p
          className={`mt-1 text-xs font-medium ${!hasReading ? "text-warning-ink" : obstacleDetected ? "text-error-ink" : "text-accent-ink"}`}
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
