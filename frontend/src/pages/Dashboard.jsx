import MainLayout from "../components/layout/MainLayout";

import BatteryCard from "../modules/telemetry/BatteryCard";
import GPSCard from "../modules/telemetry/GPSCard";
import AltitudeCard from "../modules/telemetry/AltitudeCard";
import SpeedCard from "../modules/telemetry/SpeedCard";
import SignalCard from "../modules/telemetry/SignalCard";
import ObstacleCard from "../modules/telemetry/ObstacleCard";

import MapCard from "../modules/map/MapCard";
import VideoPanel from "../modules/video/VideoPanel";
import ControlPanel from "../modules/control/ControlPanel";

export default function Dashboard() {
  return (
    <MainLayout>
      <div className="flex flex-col gap-3 xl:h-full xl:min-h-0">
        {/* ==========================
            TELEMETRIE
        ========================== */}
        <section className="shrink-0">
          <div className="grid grid-cols-2 gap-2 lg:grid-cols-6">
            <BatteryCard />
            <GPSCard />
            <AltitudeCard />
            <SpeedCard />
            <SignalCard />
            <ObstacleCard />
          </div>
        </section>

        {/* ==========================
            CARTE + CAMERA
        ========================== */}
        <section className="xl:min-h-0 xl:flex-1">
          <div className="grid grid-cols-1 gap-2 xl:h-full xl:grid-cols-12">
            <div className="min-h-[320px] xl:col-span-7 xl:h-full xl:min-h-0">
              <MapCard />
            </div>

            <div className="min-h-[320px] xl:col-span-5 xl:h-full xl:min-h-0">
              <VideoPanel />
            </div>
          </div>
        </section>

        {/* ==========================
            CONTROLE
        ========================== */}
        <section className="shrink-0">
          <ControlPanel />
        </section>
      </div>
    </MainLayout>
  );
}