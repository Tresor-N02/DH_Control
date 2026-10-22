import { Camera, Scan, Maximize, Minimize, Crosshair } from "lucide-react";

function downloadSnapshot(videoFrame) {
  if (!videoFrame) return;
  const link = document.createElement("a");
  link.href = videoFrame;
  link.download = `dh-mil-snapshot-${Date.now()}.jpg`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

function ToolbarButton({ icon: Icon, label, onClick, disabled, active }) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      title={label}
      aria-label={label}
      className={`flex h-11 w-11 items-center justify-center rounded-lg transition ${
        disabled
          ? "cursor-not-allowed bg-slate-900/50 text-slate-600"
          : active
            ? "bg-cyan-600"
            : "bg-slate-900/80 hover:bg-cyan-600"
      }`}
    >
      <Icon size={18} />
    </button>
  );
}

export default function VideoToolbar({
  videoFrame,
  showDetections,
  onToggleDetections,
  showReticle,
  onToggleReticle,
  isFullscreen,
  onToggleFullscreen,
}) {
  return (
    <div className="absolute right-3 top-3 z-20 flex flex-col gap-2">
      <ToolbarButton
        icon={Camera}
        label="Capturer une image"
        onClick={() => downloadSnapshot(videoFrame)}
        disabled={!videoFrame}
      />
      <ToolbarButton
        icon={Scan}
        label={
          showDetections ? "Masquer les détections" : "Afficher les détections"
        }
        onClick={onToggleDetections}
        active={showDetections}
      />
      <ToolbarButton
        icon={isFullscreen ? Minimize : Maximize}
        label={isFullscreen ? "Quitter le plein écran" : "Plein écran"}
        onClick={onToggleFullscreen}
        active={isFullscreen}
      />
      <ToolbarButton
        icon={Crosshair}
        label={showReticle ? "Masquer le réticule" : "Afficher le réticule"}
        onClick={onToggleReticle}
        active={showReticle}
      />
    </div>
  );
}
