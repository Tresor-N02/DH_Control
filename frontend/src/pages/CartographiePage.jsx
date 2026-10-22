import MainLayout from "../components/layout/MainLayout";
import MapCard from "../modules/map/MapCard";
import GPSCard from "../modules/telemetry/GPSCard";
import AltitudeCard from "../modules/telemetry/AltitudeCard";

export default function CartographiePage() {
  return (
    <MainLayout>
      <div className="flex flex-col gap-3 ">
        <section className="shrink-0">
          <div className="grid grid-cols-2 gap-2 lg:w-1/2">
            <GPSCard />
            <AltitudeCard />
          </div>
        </section>

        <section className="h-[60vh] min-h-80">
          <MapCard />
        </section>
      </div>
    </MainLayout>
  );
}
