import { PlaneTakeoff, PlaneLanding, House } from "lucide-react";
import { Box, Button, Typography } from "@mui/material";
export default function ActionButtons() {
  return (
    <Box component="section">
      <Typography
        component="h3"
        sx={{
          fontWeight: 600,
          mb: 2,
        }}
      >
        Fonctions du matériel
      </Typography>
      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
          gap: 1,
        }}
      >
        {[
          [PlaneTakeoff, "Décoller"],
          [PlaneLanding, "Atterrir"],
          [House, "Retour au départ"],
        ].map(([Icon, label]) => (
          <Button
            key={label}
            variant="outlined"
            disabled
            sx={{
              display: "flex",
              flexDirection: "column",
              gap: 1,
              p: 1,
              minWidth: 0,
              lineHeight: 1.4,
            }}
          >
            <Icon size={20} />
            {label}
          </Button>
        ))}
      </Box>
      <Typography
        variant="body2"
        sx={{
          color: "text.secondary",
          mt: 2,
        }}
      >
        Indisponibles : aucun contrôleur de vol ni navigation autonome reliés.
        Utilisez le joystick pour le déplacement terrestre.
      </Typography>
    </Box>
  );
}
