import { Map } from "lucide-react";
import Card from "../../components/common/Card";
import CardHeader from "../../components/common/CardHeader";
import CardBody from "../../components/common/CardBody";
import LeafletMap from "./LeafletMap";
export default function MapCard() {
  return (
    <Card
      sx={{
        height: "100%",
        minHeight: 0,
        display: "flex",
        flexDirection: "column",
      }}
    >
      <CardHeader title="Cartographie tactique" icon={Map} />
      <CardBody sx={{ flex: 1, minHeight: 0, p: 0 }}>
        <LeafletMap />
      </CardBody>
    </Card>
  );
}
