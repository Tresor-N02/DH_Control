import { PlaneTakeoff, PlaneLanding, House } from "lucide-react";
export default function ActionButtons() {
  return (
    <section className="rounded-xl border border-slate-800 bg-slate-900 p-4">
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
            className="flex flex-col items-center gap-2 rounded-lg bg-slate-800 p-3 text-sm text-slate-400"
          >
            <Icon size={20} />
            {label}
          </button>
        ))}
      </div>
      <p className="mt-3 text-xs text-slate-400">
        Indisponibles : aucun contrôleur de vol ni navigation autonome reliés.
        Utilisez le joystick pour le déplacement terrestre.
      </p>
    </section>
  );
}
