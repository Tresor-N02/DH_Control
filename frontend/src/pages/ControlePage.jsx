import MainLayout from "../components/layout/MainLayout";
import ControlPanel from "../modules/control/ControlPanel";
import VideoPanel from "../modules/video/VideoPanel";
import ObstacleCard from "../modules/telemetry/ObstacleCard";
import SpeedCard from "../modules/telemetry/SpeedCard";
import BatteryCard from "../modules/telemetry/BatteryCard";
export default function ControlePage() {
  return (
    <MainLayout>
      <div className="space-y-4">
        <h2 className="text-xl font-semibold">Pilotage terrestre</h2>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          <BatteryCard />
          <SpeedCard />
          <ObstacleCard />
        </div>
        <div className="min-h-80 h-[50vh]">
          <VideoPanel />
        </div>
        <ControlPanel />
      </div>
    </MainLayout>
  );
}
