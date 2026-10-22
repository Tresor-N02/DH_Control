import { Paper, Stack, Typography } from "@mui/material";
import { Navigation } from "lucide-react";
export default function MapLegend() {
  return (
    <Paper
      variant="outlined"
      sx={{
        position: "absolute",
        left: 12,
        bottom: 12,
        zIndex: 1000,
        px: 1.5,
        py: 1,
      }}
    >
      <Stack
        direction="row"
        spacing={1}
        sx={{
          alignItems: "center",
        }}
      >
        <Navigation size={18} />
        <Typography variant="body2">Position du drone</Typography>
      </Stack>
    </Paper>
  );
}
