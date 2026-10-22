import { Link } from "react-router-dom";
import { ArrowUpRight } from "lucide-react";
import MainLayout from "../components/layout/MainLayout";
import BatteryCard from "../modules/telemetry/BatteryCard";
import GPSCard from "../modules/telemetry/GPSCard";
import AltitudeCard from "../modules/telemetry/AltitudeCard";
import SpeedCard from "../modules/telemetry/SpeedCard";
import SignalCard from "../modules/telemetry/SignalCard";
import ObstacleCard from "../modules/telemetry/ObstacleCard";
import MapCard from "../modules/map/MapCard";
import VideoPanel from "../modules/video/VideoPanel";
export default function Dashboard() {
  return (
    <MainLayout>
      <div className="space-y-7">
        <section className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="mb-2 text-sm font-semibold text-accent-ink">
              SUPERVISION
            </p>
            <h2 className="text-3xl font-bold tracking-tight">
              Vue d’ensemble
            </h2>
            <p className="mt-2 max-w-xl text-base text-subtle">
              Retrouvez l’état du drone, sa position et sa caméra en un seul
              endroit.
            </p>
          </div>
          <Link
            to="/controle"
            className="inline-flex min-h-12 items-center gap-3 rounded-xl bg-cyan-700 px-5 py-3 font-semibold text-white hover:bg-cyan-800"
          >
            Ouvrir le pilotage
            <ArrowUpRight size={20} />
          </Link>
        </section>
        <section
          aria-label="Indicateurs principaux"
          className="grid grid-cols-1 gap-4 sm:grid-cols-3"
        >
          <BatteryCard />
          <SpeedCard />
          <ObstacleCard />
        </section>
        <section
          aria-label="Caméra et position"
          className="grid grid-cols-1 gap-5 xl:grid-cols-2"
        >
          <div className="h-[400px] min-w-0">
            <VideoPanel />
          </div>
          <div className="h-[400px] min-w-0">
            <MapCard />
          </div>
        </section>
        <section>
          <div className="mb-4">
            <h2 className="text-xl font-semibold">
              Informations complémentaires
            </h2>
            <p className="mt-1 text-sm text-subtle">
              Position, altitude et qualité de réception.
            </p>
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <GPSCard />
            <AltitudeCard />
            <SignalCard />
          </div>
        </section>
      </div>
    </MainLayout>
  );
}
