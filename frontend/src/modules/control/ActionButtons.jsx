import { PlaneTakeoff, PlaneLanding, House } from "lucide-react";
export default function ActionButtons() {
  return (
    <section className="rounded-xl border border-line bg-panel p-4">
      <h3 className="mb-3 text-sm font-semibold">Fonctions du matériel</h3>
      <div className="grid grid-cols-3 gap-2">
        {[
          [PlaneTakeoff, "Décoller"],
          [PlaneLanding, "Atterrir"],
          [House, "Retour au départ"],
        ].map(([Icon, label]) => (
          <button
            key={label}
            disabled
            className="flex flex-col items-center gap-2 rounded-lg bg-muted p-3 text-sm text-subtle"
          >
            <Icon size={20} />
            {label}
          </button>
        ))}
      </div>
      <p className="mt-3 text-xs text-subtle">
        Indisponibles : aucun contrôleur de vol ni navigation autonome reliés.
        Utilisez le joystick pour le déplacement terrestre.
      </p>
    </section>
  );
}
