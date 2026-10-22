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
      <div className="flex flex-col gap-3 ">
        {/* ==========================
            TELEMETRIE
        ========================== */}
        <section className="shrink-0">
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3">
            <BatteryCard />
            <SpeedCard />
            <ObstacleCard />
            <GPSCard />
            <AltitudeCard />
            <SignalCard />
          </div>
        </section>

        {/* ==========================
            CARTE + CAMERA
        ========================== */}
        <section className=" ">
          <div className="grid grid-cols-1 gap-2  xl:grid-cols-12">
            <div className="h-[420px] min-h-80 xl:col-span-6 ">
              <MapCard />
            </div>

            <div className="h-[420px] min-h-80 xl:col-span-6 ">
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
