import MainLayout from "../components/layout/MainLayout";
import ControlPanel from "../modules/control/ControlPanel";
import ObstacleCard from "../modules/telemetry/ObstacleCard";
import SpeedCard from "../modules/telemetry/SpeedCard";
import BatteryCard from "../modules/telemetry/BatteryCard";

export default function ControlePage() {
  return (
    <MainLayout>
      <div className="flex flex-col gap-3 xl:h-full xl:min-h-0">
        <section className="shrink-0">
          <div className="grid grid-cols-3 gap-2 lg:w-3/4">
            <BatteryCard />
            <SpeedCard />
            <ObstacleCard />
          </div>
        </section>

        <section className="xl:min-h-0 xl:flex-1">
          <ControlPanel />
        </section>
      </div>
    </MainLayout>
  );
}
