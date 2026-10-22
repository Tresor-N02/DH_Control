import { NavLink } from "react-router-dom";
import {
  LayoutDashboard,
  Map,
  Video,
  Radio,
  Gamepad2,
  HeartPulse,
  ScrollText,
  Settings,
} from "lucide-react";

const menus = [
  ["Dashboard", LayoutDashboard, "/"],
  ["Cartographie", Map, "/cartographie"],
  ["Vidéo", Video, "/video"],
  ["Télémétrie", Radio, "/telemetrie"],
  ["Contrôle", Gamepad2, "/controle"],
  ["Mission", ScrollText, "/mission"],
  ["Médical", HeartPulse, null],
  ["Paramètres", Settings, null],
];

export default function Sidebar() {
  return (
    <aside className="hidden w-64 flex-col border-r border-slate-800 bg-slate-900 p-4 lg:flex">
      <nav className="space-y-2">
        {menus.map(([title, Icon, path]) => {
          if (!path) {
            return (
              <div
                key={title}
                title="Pas encore disponible"
                className="flex w-full cursor-not-allowed items-center justify-between gap-3 rounded-xl px-4 py-2 text-slate-600"
              >
                <span className="flex items-center gap-3">
                  <Icon size={20} />
                  <span className="text-sm">{title}</span>
                </span>
                <span className="text-[10px] uppercase tracking-wide">Bientôt</span>
              </div>
            );
          }

          return (
            <NavLink
              key={title}
              to={path}
              end={path === "/"}
              className={({ isActive }) =>
                `flex w-full items-center gap-3 rounded-xl px-4 py-2 transition ${
                  isActive ? "bg-cyan-600 text-white" : "hover:bg-slate-800"
                }`
              }
            >
              <Icon size={20} />
              <span className="text-sm">{title}</span>
            </NavLink>
          );
        })}
      </nav>
    </aside>
  );
}
