import { useSyncExternalStore } from "react";
import { Moon, Sun } from "lucide-react";
import IconButton from "@mui/material/IconButton";
import Tooltip from "@mui/material/Tooltip";
import { getTheme, subscribeTheme, toggleTheme } from "../../services/theme";
export default function ThemeToggle() {
  const theme = useSyncExternalStore(subscribeTheme, getTheme);
  const label =
    theme === "dark" ? "Activer le mode clair" : "Activer le mode sombre";
  return (
    <Tooltip title={label}>
      <IconButton
        onClick={toggleTheme}
        aria-label={label}
        color="inherit"
        sx={{
          border: "1px solid",
          borderColor: "divider",
          borderRadius: 2,
          flexShrink: 0,
        }}
      >
        {theme === "dark" ? <Sun size={20} /> : <Moon size={20} />}
      </IconButton>
    </Tooltip>
  );
}
