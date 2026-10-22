import { useMemo, useSyncExternalStore } from "react";
import { createTheme, ThemeProvider } from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";
import GlobalStyles from "@mui/material/GlobalStyles";
import { getTheme, subscribeTheme } from "../services/theme";

export default function UiThemeProvider({ children }) {
  const mode = useSyncExternalStore(subscribeTheme, getTheme);
  const theme = useMemo(
    () =>
      createTheme({
        palette: {
          mode,
          primary: { main: "#0e7490", contrastText: "#ffffff" },
          secondary: { main: mode === "dark" ? "#67e8f9" : "#0e7490" },
          background: {
            default: mode === "dark" ? "#020617" : "#f8fafc",
            paper: mode === "dark" ? "#0f172a" : "#ffffff",
          },
          text: {
            primary: mode === "dark" ? "#f1f5f9" : "#0f172a",
            secondary: mode === "dark" ? "#94a3b8" : "#475569",
          },
          divider: mode === "dark" ? "#334155" : "#e2e8f0",
          error: { main: mode === "dark" ? "#ef4444" : "#dc2626" },
          warning: { main: mode === "dark" ? "#fbbf24" : "#92400e" },
          success: { main: mode === "dark" ? "#4ade80" : "#15803d" },
        },
        shape: { borderRadius: 12 },
        breakpoints: {
          values: { xs: 0, sm: 640, md: 768, lg: 1024, xl: 1280 },
        },
        typography: {
          fontFamily:
            'ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
          fontSize: 15,
          button: { textTransform: "none", fontWeight: 600 },
          body1: { fontSize: "1rem", lineHeight: 1.6 },
          body2: { fontSize: "0.875rem", lineHeight: 1.5 },
          subtitle1: { fontWeight: 600 },
        },
        components: {
          MuiButton: {
            defaultProps: { disableElevation: true },
            styleOverrides: { root: { minHeight: 44 } },
          },
          MuiIconButton: {
            styleOverrides: { root: { minWidth: 44, minHeight: 44 } },
          },
          MuiPaper: { styleOverrides: { root: { backgroundImage: "none" } } },
          MuiCardHeader: {
            styleOverrides: {
              root: ({ theme }) => ({
                padding: "16px 20px",
                borderBottom: `1px solid ${theme.palette.divider}`,
              }),
              action: { margin: 0, alignSelf: "center" },
            },
          },
          MuiListItemButton: { styleOverrides: { root: { borderRadius: 12 } } },
          MuiTextField: {
            defaultProps: { variant: "outlined", size: "small" },
          },
          MuiTooltip: { defaultProps: { enterDelay: 500 } },
        },
      }),
    [mode],
  );
  return (
    <ThemeProvider theme={theme}>
      <GlobalStyles
        styles={(theme) => ({
          ":focus-visible": {
            outline: `3px solid ${theme.palette.secondary.main}`,
            outlineOffset: 3,
          },
          ".leaflet-popup-content-wrapper, .leaflet-popup-tip": {
            backgroundColor: theme.palette.background.paper,
            color: theme.palette.text.primary,
          },
          ".leaflet-control-attribution": {
            backgroundColor: theme.palette.background.paper,
            color: theme.palette.text.secondary,
          },
        })}
      />
      <CssBaseline />
      {children}
    </ThemeProvider>
  );
}
