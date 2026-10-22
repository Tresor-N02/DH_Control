import {
  Paper,
  ToggleButton,
  ToggleButtonGroup,
  Typography,
} from "@mui/material";
import { Car, Plane } from "lucide-react";
import { useDrone } from "../../context/useDrone";
export default function FlightModeSelector() {
  const { flightMode, setFlightMode } = useDrone();
  return (
    <Paper
      variant="outlined"
      sx={{
        p: 2.5,
      }}
    >
      <Typography
        component="h3"
        sx={{
          fontWeight: 600,
          mb: 2,
        }}
      >
        Mode de déplacement
      </Typography>
      <ToggleButtonGroup
        value={flightMode}
        exclusive
        onChange={(_, mode) => {
          if (mode) setFlightMode(mode);
        }}
        color="primary"
        fullWidth
        aria-label="Mode de déplacement"
      >
        <ToggleButton
          value="TERRESTRE"
          sx={{
            gap: 1,
            textTransform: "none",
          }}
        >
          <Car size={18} />
          Terrestre
        </ToggleButton>
        <ToggleButton
          value="AERIEN"
          disabled
          sx={{
            gap: 1,
            textTransform: "none",
          }}
        >
          <Plane size={18} />
          Aérien indisponible
        </ToggleButton>
      </ToggleButtonGroup>
    </Paper>
  );
}
