export default function RecordingBadge({ live = false, simulated = false }) {
  return (
    <div
      className={`flex items-center gap-2 rounded-full px-3 py-1 text-xs font-semibold ${
        live ? "bg-red-600" : "bg-slate-700"
      }`}
    >
      <span className={`h-2 w-2 rounded-full bg-white ${live ? "animate-pulse" : ""}`} />
      {live ? (simulated ? "SIMULATION" : "REC") : "HORS LIGNE"}
    </div>
  );
}
