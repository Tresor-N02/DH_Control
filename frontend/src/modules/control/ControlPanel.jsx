import FlightModeSelector from "./FlightModeSelector";
import Joystick from "./Joystick";
import ActionButtons from "./ActionButtons";
export default function ControlPanel() {
  return (
    <section aria-label="Commandes de déplacement" className="space-y-4">
      <Joystick />
      <FlightModeSelector />
      <details className="rounded-xl border border-line bg-panel p-4">
        <summary className="cursor-pointer text-sm font-medium text-subtle">
          Fonctions non disponibles
        </summary>
        <div className="mt-4">
          <ActionButtons />
        </div>
      </details>
    </section>
  );
}
