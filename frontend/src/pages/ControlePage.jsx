import MainLayout from "../components/layout/MainLayout";
import ControlPanel from "../modules/control/ControlPanel";
import VideoPanel from "../modules/video/VideoPanel";
import ObstacleCard from "../modules/telemetry/ObstacleCard";
import SpeedCard from "../modules/telemetry/SpeedCard";
import BatteryCard from "../modules/telemetry/BatteryCard";
export default function ControlePage() {
  return (
    <MainLayout>
      <div className="space-y-6">
        <div>
          <p className="mb-2 text-sm font-semibold text-accent-ink">
            COMMANDES
          </p>
          <h2 className="text-3xl font-bold tracking-tight">
            Pilotage terrestre
          </h2>
          <p className="mt-2 text-base text-subtle">
            Gardez la caméra en vue et utilisez le joystick pour déplacer le
            drone.
          </p>
        </div>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <BatteryCard />
          <SpeedCard />
          <ObstacleCard />
        </div>
        <div className="grid items-start gap-5 xl:grid-cols-[minmax(0,1fr)_360px]">
          <div className="h-[480px] min-w-0">
            <VideoPanel />
          </div>
          <ControlPanel />
        </div>
      </div>
    </MainLayout>
  );
}
