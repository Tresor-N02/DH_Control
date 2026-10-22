import Card from "../../components/common/Card";
import CardHeader from "../../components/common/CardHeader";
import CardBody from "../../components/common/CardBody";

import { Camera } from "lucide-react";

import VideoFeed from "./VideoFeed";

export default function VideoPanel() {

  return (

    <Card className="h-full min-h-0 flex flex-col">

      <CardHeader
        title="Caméra embarquée"
        icon={Camera}
      />

      <CardBody className="flex-1 min-h-0 p-0">

        <VideoFeed />

      </CardBody>

    </Card>

  );

}