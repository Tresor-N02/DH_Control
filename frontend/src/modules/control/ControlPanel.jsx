import {
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Stack,
} from "@mui/material";
import { ChevronDown } from "lucide-react";
import FlightModeSelector from "./FlightModeSelector";
import Joystick from "./Joystick";
import ActionButtons from "./ActionButtons";
export default function ControlPanel() {
  return (
    <Stack
      component="section"
      aria-label="Commandes de déplacement"
      spacing={2}
    >
      <Joystick />
      <FlightModeSelector />
      <Accordion
        disableGutters
        elevation={0}
        sx={{
          border: "1px solid",
          borderColor: "divider",
          borderRadius: "12px !important",
          "&:before": { display: "none" },
        }}
      >
        <AccordionSummary
          expandIcon={<ChevronDown size={20} />}
          aria-controls="unavailable-controls"
          id="unavailable-heading"
        >
          Fonctions non disponibles
        </AccordionSummary>
        <AccordionDetails id="unavailable-controls">
          <ActionButtons />
        </AccordionDetails>
      </Accordion>
    </Stack>
  );
}
