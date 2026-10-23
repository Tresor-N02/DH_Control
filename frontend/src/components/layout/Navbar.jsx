import { useEffect, useState } from "react";
import { useTheme } from "@mui/material/styles";
import { Shield, Bell, LogOut, Menu, X } from "lucide-react";
import {
  AppBar,
  Toolbar,
  IconButton,
  Badge,
  Drawer,
  Box,
  Typography,
  Button,
  Popover,
  Divider,
  Stack,
  Tooltip,
} from "@mui/material";
import { useDrone } from "../../context/useDrone";
import { useAuth } from "../../context/useAuth";
import Sidebar from "./Sidebar";
import ThemeToggle from "../common/ThemeToggle";
export default function Navbar() {
  const theme = useTheme();
  const { alerts, markAlertsRead } = useDrone();
  const { user, logout } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);
  const [alertAnchor, setAlertAnchor] = useState(null);
  useEffect(() => {
    const close = (event) => {
      if (event.key === "Escape") {
        setMenuOpen(false);
        setAlertAnchor(null);
      }
    };
    document.addEventListener("keydown", close);
    return () => document.removeEventListener("keydown", close);
  }, []);
  useEffect(() => {
    const desktop = window.matchMedia(`(min-width: ${theme.breakpoints.values.lg}px)`);
    const closeMobile = () => {
      if (desktop.matches) setMenuOpen(false);
    };
    desktop.addEventListener("change", closeMobile);
    return () => desktop.removeEventListener("change", closeMobile);
  }, [theme.breakpoints.values.lg]);
  const unread = alerts.filter((a) => a.statut === "NOUVELLE").length;
  return (
    <>
      <AppBar
        component="header"
        position="sticky"
        elevation={0}
        color="default"
        sx={{
          borderBottom: "1px solid",
          borderColor: "divider",
          bgcolor: "background.paper",
          color: "text.primary",
          zIndex: 1200,
          top: 0,
        }}
      >
        <Toolbar
          sx={{
            gap: 1,
            minHeight: "72px !important",
            justifyContent: "space-between",
            px: {
              xs: 1.5,
              md: 2.5,
            },
          }}
        >
          <Stack
            direction="row"
            spacing={1.5}
            sx={{
              alignItems: "center",
            }}
          >
            <IconButton
              aria-label="Ouvrir le menu"
              aria-expanded={menuOpen}
              aria-controls="mobile-navigation"
              onClick={() => setMenuOpen(true)}
              sx={{
                display: {
                  lg: "none",
                },
              }}
            >
              <Menu size={22} />
            </IconButton>
            <Box
              component="span"
              sx={{
                display: { xs: "none", sm: "inline-flex" },
                alignItems: "center",
                justifyContent: "center",
                width: 40,
                height: 40,
                borderRadius: 2.5,
                bgcolor: "primary.main",
                color: "primary.contrastText",
              }}
            >
              <Shield />
            </Box>
            <Box>
              <Typography
                component="h1"
                sx={{
                  fontWeight: 700,
                  fontSize: "1rem",
                  letterSpacing: "0.04em",
                }}
              >
                DH_MIL
              </Typography>
            </Box>
          </Stack>
          <Stack
            direction="row"
            spacing={1}
            sx={{
              alignItems: "center",
              "& .MuiIconButton-root": { width: 40, height: 40, border: "1px solid", borderColor: "divider", borderRadius: 2 },
            }}
          >
            <ThemeToggle />
            <Tooltip title="Notifications">
            <IconButton
              aria-label={`Alertes : ${unread} non lues`}
              aria-expanded={Boolean(alertAnchor)}
              aria-haspopup="dialog"
              aria-controls={alertAnchor ? "alerts-panel" : undefined}
              onClick={(e) =>
                setAlertAnchor(alertAnchor ? null : e.currentTarget)
              }
            >
              <Badge badgeContent={unread} color="error">
                <Bell size={20} />
              </Badge>
            </IconButton>
            </Tooltip>
            <Divider orientation="vertical" flexItem sx={{ mx: 0.5 }} />
            <Tooltip title={user?.email ? `Se déconnecter (${user.email})` : "Se déconnecter"}>
            <IconButton
              onClick={logout}
              aria-label="Se déconnecter"
            >
              <LogOut size={20} />
            </IconButton>
            </Tooltip>
          </Stack>
        </Toolbar>
      </AppBar>
      <Drawer
        open={menuOpen}
        onClose={() => setMenuOpen(false)}
        sx={{
          display: {
            lg: "none",
          },
        }}
        slotProps={{
          paper: {
            sx: {
              width: 320,
              maxWidth: "calc(100vw - 24px)",
            },
          },
        }}
      >
        <Box id="mobile-navigation">
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              p: 2,
            }}
          >
            <Typography variant="h6" sx={{ fontWeight: 700 }}>DH_MIL</Typography>
            <IconButton
              aria-label="Fermer le menu"
              onClick={() => setMenuOpen(false)}
            >
              <X size={22} />
            </IconButton>
          </Box>
          <Divider />
          <Sidebar mobile onNavigate={() => setMenuOpen(false)} />
        </Box>
      </Drawer>
      <Popover
        open={Boolean(alertAnchor)}
        anchorEl={alertAnchor}
        onClose={() => setAlertAnchor(null)}
        anchorOrigin={{
          vertical: "bottom",
          horizontal: "right",
        }}
        transformOrigin={{
          vertical: "top",
          horizontal: "right",
        }}
        slotProps={{
          paper: {
            sx: {
              width: 384,
              maxWidth: "calc(100vw - 24px)",
              maxHeight: "70vh",
              p: 2,
              borderRadius: 3,
            },
          },
        }}
      >
        <Box component="section" id="alerts-panel" aria-label="Alertes">
          <Stack
            direction="row"
            spacing={1}
            sx={{
              alignItems: "center",
              justifyContent: "space-between",
              mb: 1,
            }}
          >
            <Typography
              component="h2"
              sx={{
                fontWeight: 600,
              }}
            >
              Alertes
            </Typography>
            <Button onClick={markAlertsRead} disabled={!unread} size="small">
              Tout marquer comme lu
            </Button>
          </Stack>
          {!alerts.length ? (
            <Typography
              sx={{
                color: "text.secondary",
              }}
            >
              Aucune alerte.
            </Typography>
          ) : (
            alerts.map((a) => (
              <Box
                component="article"
                key={a.id}
                sx={{
                  py: 1.5,
                  borderTop: "1px solid",
                  borderColor: "divider",
                }}
              >
                <Typography
                  variant="body2"
                  sx={{
                    fontWeight: 600,
                    color:
                      a.type === "INFO" ? "secondary.main" : "warning.main",
                  }}
                >
                  {a.type === "INFO" ? "Information" : "Avertissement"} ·{" "}
                  {a.type}
                  {a.statut === "NOUVELLE" ? " · Non lue" : ""}
                </Typography>
                <Typography
                  sx={{
                    mt: 0.5,
                  }}
                >
                  {a.message}
                </Typography>
                <Typography
                  component="time"
                  variant="body2"
                  sx={{
                    color: "text.secondary",
                  }}
                >
                  {a.receivedAt
                    ? new Date(a.receivedAt).toLocaleString("fr-FR")
                    : ""}
                </Typography>
              </Box>
            ))
          )}
        </Box>
      </Popover>
    </>
  );
}
