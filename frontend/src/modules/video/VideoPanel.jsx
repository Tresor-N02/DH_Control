import { Camera } from "lucide-react";
import Card from "../../components/common/Card";
import CardHeader from "../../components/common/CardHeader";
import CardBody from "../../components/common/CardBody";
import VideoFeed from "./VideoFeed";
export default function VideoPanel({ action }) {
  return (
    <Card
      sx={{
        height: "100%",
        minHeight: 0,
        display: "flex",
        flexDirection: "column",
      }}
    >
      <CardHeader title="Caméra embarquée" icon={Camera} right={action} />
      <CardBody sx={{ flex: 1, minHeight: 0, p: 0 }}>
        <VideoFeed />
      </CardBody>
    </Card>
  );
}
