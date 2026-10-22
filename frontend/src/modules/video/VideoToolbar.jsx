import { Box, Stack, IconButton, Tooltip } from "@mui/material";
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
    <Tooltip title={label} placement="left">
      <Box component="span">
        <IconButton
          onClick={onClick}
          disabled={disabled}
          aria-label={label}
          aria-pressed={active === undefined ? undefined : active}
          sx={{
            width: 44,
            height: 44,
            borderRadius: 2,
            color: "#ffffff",
            bgcolor: active ? "#0e7490" : "rgba(15,23,42,0.85)",
            "&:hover": { bgcolor: "#0e7490" },
            "&.Mui-disabled": {
              color: "#64748b",
              bgcolor: "rgba(15,23,42,0.5)",
            },
          }}
        >
          <Icon size={18} />
        </IconButton>
      </Box>
    </Tooltip>
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
    <Stack
      spacing={1}
      sx={{ position: "absolute", right: 12, top: 12, zIndex: 20 }}
    >
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
    </Stack>
  );
}
