import MainLayout from "../components/layout/MainLayout";
import VideoPanel from "../modules/video/VideoPanel";
import ObstacleCard from "../modules/telemetry/ObstacleCard";
import SpeedCard from "../modules/telemetry/SpeedCard";

export default function VideoPage() {
  return (
    <MainLayout>
      <div className="flex flex-col gap-3 xl:h-full xl:min-h-0">
        <section className="shrink-0">
          <div className="grid grid-cols-2 gap-2 lg:w-1/2">
            <ObstacleCard />
            <SpeedCard />
          </div>
        </section>

        <section className="xl:min-h-0 xl:flex-1">
          <VideoPanel />
        </section>
      </div>
    </MainLayout>
  );
}
