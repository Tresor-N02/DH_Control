import { Wifi } from "lucide-react";
import Card from "../../components/common/Card";
import CardHeader from "../../components/common/CardHeader";
import CardBody from "../../components/common/CardBody";
import { useDrone } from "../../context/useDrone";
export default function SignalCard() {
  const { signal, simulated, lastTelemetryAt } = useDrone();
  return (
    <Card className="telemetry-value">
      <CardHeader title="Signal" icon={Wifi} />
      <CardBody>
        <p className="text-2xl font-bold">
          {simulated && lastTelemetryAt ? `${signal} %` : "—"}
        </p>
        <p className="mt-2 text-xs text-slate-400">
          {simulated ? "Valeur simulée" : "Mesure matérielle indisponible"}
        </p>
      </CardBody>
    </Card>
  );
}
