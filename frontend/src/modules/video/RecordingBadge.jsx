import { Box, Chip } from "@mui/material";
export default function RecordingBadge({ live = false, simulated = false }) {
  return (
    <Chip
      size="small"
      icon={
        <Box
          component="span"
          sx={{
            width: 8,
            height: 8,
            borderRadius: "50%",
            bgcolor: "currentColor",
            ml: "12px !important",
          }}
        />
      }
      label={live ? (simulated ? "SIMULATION" : "EN DIRECT") : "HORS LIGNE"}
      sx={{
        bgcolor: live ? "#0e7490" : "#334155",
        color: "#fff",
        fontWeight: 600,
      }}
    />
  );
}
