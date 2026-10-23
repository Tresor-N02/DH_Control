import { NavLink, useLocation } from "react-router-dom";
import { alpha } from "@mui/material/styles";
import {
  LayoutDashboard,
  Map,
  Video,
  Radio,
  Gamepad2,
  ScrollText,
} from "lucide-react";
import {
  Box,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Typography,
} from "@mui/material";
const menus = [
  ["Tableau de bord", "État général du drone", LayoutDashboard, "/"],
  ["Contrôle", "Déplacer le drone", Gamepad2, "/controle"],
  ["Cartographie", "Localiser le drone", Map, "/cartographie"],
  ["Vidéo", "Voir la caméra", Video, "/video"],
  ["Télémétrie", "Consulter les mesures", Radio, "/telemetrie"],
  ["Missions", "Organiser les opérations", ScrollText, "/mission"],
];
export default function Sidebar({ mobile = false, onNavigate }) {
  const { pathname } = useLocation();
  return (
    <Box
      component="aside"
      sx={{
        display: mobile
          ? "block"
          : {
              xs: "none",
              lg: "block",
            },
        position: mobile ? "static" : "sticky",
        top: 72,
        height: mobile ? undefined : "calc(100dvh - 72px)",
        overflowY: "auto",
        width: mobile ? "100%" : 256,
        flexShrink: 0,
        borderRight: mobile ? 0 : "1px solid",
        borderColor: "divider",
        bgcolor: "background.paper",
        px: 1.5,
        pt: 3,
        pb: 14,
      }}
    >
      <Typography
        variant="overline"
        sx={{
          color: "text.secondary",
          display: "block",
          px: 1.5,
          mb: 2,
          fontSize: "0.65rem",
          fontWeight: 700,
          letterSpacing: "0.12em",
        }}
      >
        Navigation
      </Typography>
      <List component="nav" aria-label="Navigation principale" disablePadding>
        {menus.map(([title, description, Icon, path]) => (
          <ListItemButton
            key={path}
            component={NavLink}
            to={path}
            end={path === "/"}
            selected={pathname === path}
            onClick={onNavigate}
            aria-label={title}
            sx={{
              minHeight: 64,
              mb: 0.75,
              px: 1.5,
              borderRadius: 2.5,
              border: "1px solid transparent",
              transition: "background-color 160ms ease, border-color 160ms ease",
              "&:focus-visible": { outline: "2px solid", outlineColor: "primary.main", outlineOffset: 2 },
              "&.Mui-selected": {
                bgcolor: (theme) => alpha(theme.palette.primary.main, 0.1),
                borderColor: (theme) => alpha(theme.palette.primary.main, 0.2),
                color: "primary.main",
                "&:hover": {
                  bgcolor: (theme) => alpha(theme.palette.primary.main, 0.16),
                },
                "& .MuiListItemIcon-root, & .MuiListItemText-secondary": {
                  color: "inherit",
                },
              },
            }}
          >
            <ListItemIcon
              sx={{
                minWidth: 40,
                color: pathname === path ? "primary.main" : "text.secondary",
              }}
            >
              <Icon size={20} strokeWidth={pathname === path ? 2.2 : 1.7} />
            </ListItemIcon>
            <ListItemText
              primary={title}
              secondary={description}
              slotProps={{
                primary: {
                  sx: {
                    fontWeight: 600,
                    fontSize: "0.875rem",
                  },
                },
                secondary: {
                  sx: {
                    fontSize: "0.75rem",
                    mt: 0.25,
                  },
                },
              }}
            />
          </ListItemButton>
        ))}
      </List>
    </Box>
  );
}
