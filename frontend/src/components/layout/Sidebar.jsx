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
  ["Tableau de bord", LayoutDashboard, "/"],
  ["Cartographie", Map, "/cartographie"],
  ["Vidéo", Video, "/video"],
  ["Télémétrie", Radio, "/telemetrie"],
  ["Contrôle", Gamepad2, "/controle"],
  ["Missions", ScrollText, "/mission"],
];
export default function Sidebar({ mobile = false, onNavigate }) {
  return (
    <aside
      className={
        mobile
          ? "border-b border-slate-800 bg-slate-900 p-3 lg:hidden"
          : "sticky top-20 hidden w-56 shrink-0 p-3 lg:block"
      }
    >
      <nav
        aria-label="Navigation principale"
        className={mobile ? "grid grid-cols-2 gap-2" : "space-y-2"}
      >
        {menus.map(([title, Icon, path]) => (
          <NavLink
            key={path}
            to={path}
            end={path === "/"}
            onClick={onNavigate}
            className={({ isActive }) =>
              `flex min-h-11 items-center gap-3 rounded-xl px-3 py-2 text-sm ${isActive ? "bg-cyan-700 text-white" : "text-slate-300 hover:bg-slate-800"}`
            }
          >
            <Icon size={20} />
            <span>{title}</span>
          </NavLink>
        ))}
      </nav>
    </aside>
  );
}
