import { NavLink } from "react-router-dom";
import {
  LayoutDashboard,
  Map,
  Video,
  Radio,
  Gamepad2,
  ScrollText,
} from "lucide-react";
const menus = [
  ["Tableau de bord", "État général du drone", LayoutDashboard, "/"],
  ["Contrôle", "Déplacer le drone", Gamepad2, "/controle"],
  ["Cartographie", "Localiser le drone", Map, "/cartographie"],
  ["Vidéo", "Voir la caméra", Video, "/video"],
  ["Télémétrie", "Consulter les mesures", Radio, "/telemetrie"],
  ["Missions", "Organiser les opérations", ScrollText, "/mission"],
];
export default function Sidebar({ mobile = false, onNavigate }) {
  return (
    <aside
      className={
        mobile
          ? "border-b border-line bg-panel p-3 lg:hidden"
          : "sticky top-0 hidden min-h-[calc(100vh-80px)] w-64 shrink-0 border-r border-line bg-panel p-4 lg:block"
      }
    >
      <p className="mb-4 px-3 pt-2 text-xs font-semibold uppercase tracking-wider text-subtle">
        Espace de travail
      </p>
      <nav
        aria-label="Navigation principale"
        className={
          mobile ? "grid grid-cols-1 gap-2 sm:grid-cols-2" : "space-y-2"
        }
      >
        {menus.map(([title, description, Icon, path]) => (
          <NavLink
            key={path}
            to={path}
            end={path === "/"}
            onClick={onNavigate}
            aria-label={title}
            className={({ isActive }) =>
              `group flex min-h-16 items-center gap-3 rounded-xl border px-3 py-3 transition-colors ${isActive ? "border-cyan-700 bg-cyan-700 text-white shadow-sm" : "border-transparent text-secondary hover:bg-muted"}`
            }
          >
            <Icon size={22} className="shrink-0" />
            <span>
              <span className="block text-base font-semibold">{title}</span>
              <span className="mt-0.5 block text-xs opacity-90">
                {description}
              </span>
            </span>
          </NavLink>
        ))}
      </nav>
    </aside>
  );
}
