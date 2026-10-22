import FlightModeSelector from "./FlightModeSelector";
import Joystick from "./Joystick";
import ActionButtons from "./ActionButtons";

export default function ControlPanel() {

  return (

    <section>

      <div

        className="
          grid
          grid-cols-1
          lg:grid-cols-12
          gap-4
        "

      >

        <div className="lg:col-span-4">

          <Joystick/>

        </div>

        <div className="lg:col-span-4">

          <ActionButtons/>

        </div>

        <div className="lg:col-span-4">

          <FlightModeSelector/>

        </div>

      </div>

    </section>

  );

}