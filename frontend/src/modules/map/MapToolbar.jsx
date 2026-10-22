import { Plus, Minus, LocateFixed, Navigation } from "lucide-react";
export default function MapToolbar({
  onZoomIn,
  onZoomOut,
  onLocate,
  onToggleFollow,
  following,
  canLocate,
}) {
  return (
    <div className="absolute right-3 top-3 z-[1000] flex flex-col gap-2">
      {[
        [Plus, "Zoom avant", onZoomIn],
        [Minus, "Zoom arrière", onZoomOut],
        [LocateFixed, "Recentrer sur le drone", onLocate],
        [
          Navigation,
          following ? "Désactiver le suivi du drone" : "Suivre le drone",
          onToggleFollow,
        ],
      ].map(([Icon, label, action], i) => (
        <button
          key={label}
          aria-label={label}
          title={label}
          aria-pressed={i === 3 ? following : undefined}
          disabled={i >= 2 && !canLocate}
          onClick={action}
          className={`flex h-11 w-11 items-center justify-center rounded-lg border border-slate-700 ${i === 3 && following ? "bg-cyan-700" : "bg-slate-900"} disabled:opacity-40`}
        >
          <Icon size={20} />
        </button>
      ))}
    </div>
  );
}
