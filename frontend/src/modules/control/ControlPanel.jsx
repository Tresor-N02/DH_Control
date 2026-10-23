import { Box } from "@mui/material";
import Joystick from "./Joystick";

export default function ControlPanel() {
  return (
    <Box component="section" aria-label="Commandes de déplacement"
      sx={{ height: "100%", "& > .MuiPaper-root": { height: "100%" } }}>
      <Joystick />
    </Box>
  );
}
