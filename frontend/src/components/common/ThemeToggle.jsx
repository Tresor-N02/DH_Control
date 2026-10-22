import { useSyncExternalStore } from "react";
import { Moon, Sun } from "lucide-react";
import { getTheme, subscribeTheme, toggleTheme } from "../../services/theme";
export default function ThemeToggle() {
  const theme = useSyncExternalStore(subscribeTheme, getTheme);
  const label =
    theme === "dark" ? "Activer le mode clair" : "Activer le mode sombre";
  return (
    <button
      type="button"
      onClick={toggleTheme}
      aria-label={label}
      title={label}
      className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg border border-line-strong bg-panel text-ink hover:bg-muted"
    >
      {theme === "dark" ? <Sun size={20} /> : <Moon size={20} />}
    </button>
  );
}
