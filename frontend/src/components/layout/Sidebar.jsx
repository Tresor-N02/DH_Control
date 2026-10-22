import { NavLink, useLocation } from "react-router-dom";
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
        top: 0,
        minHeight: mobile ? undefined : "calc(100vh - 80px)",
        width: mobile ? "100%" : 256,
        flexShrink: 0,
        borderRight: mobile ? 0 : "1px solid",
        borderColor: "divider",
        bgcolor: "background.paper",
        p: 2,
      }}
    >
      <Typography
        variant="overline"
        sx={{
          color: "text.secondary",
          display: "block",
          px: 1.5,
          mb: 1.5,
        }}
      >
        Espace de travail
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
              minHeight: 72,
              mb: 1,
              "&.Mui-selected": {
                bgcolor: "primary.main",
                color: "primary.contrastText",
                "&:hover": {
                  bgcolor: "primary.dark",
                },
                "& .MuiListItemIcon-root, & .MuiListItemText-secondary": {
                  color: "inherit",
                },
              },
            }}
          >
            <ListItemIcon
              sx={{
                minWidth: 36,
                color: "inherit",
              }}
            >
              <Icon size={22} />
            </ListItemIcon>
            <ListItemText
              primary={title}
              secondary={description}
              slotProps={{
                primary: {
                  sx: {
                    fontWeight: 600,
                    fontSize: "1rem",
                  },
                },
                secondary: {
                  sx: {
                    fontSize: "0.875rem",
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
