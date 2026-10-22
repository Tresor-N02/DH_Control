import { Plus, Minus, LocateFixed, Navigation } from "lucide-react";
import { Box, Stack, IconButton, Tooltip } from "@mui/material";
export default function MapToolbar({
  onZoomIn,
  onZoomOut,
  onLocate,
  onToggleFollow,
  following,
  canLocate,
}) {
  return (
    <Stack
      spacing={1}
      sx={{ position: "absolute", right: 12, top: 12, zIndex: 1000 }}
    >
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
        <Tooltip key={label} title={label} placement="left">
          <Box component="span">
            <IconButton
              aria-label={label}
              aria-pressed={i === 3 ? following : undefined}
              disabled={i >= 2 && !canLocate}
              onClick={action}
              sx={{
                width: 44,
                height: 44,
                border: "1px solid",
                borderColor: "divider",
                borderRadius: 2,
                bgcolor:
                  i === 3 && following ? "primary.main" : "background.paper",
                color:
                  i === 3 && following
                    ? "primary.contrastText"
                    : "text.primary",
                "&:hover": {
                  bgcolor:
                    i === 3 && following ? "primary.dark" : "action.hover",
                },
              }}
            >
              <Icon size={20} />
            </IconButton>
          </Box>
        </Tooltip>
      ))}
    </Stack>
  );
}
