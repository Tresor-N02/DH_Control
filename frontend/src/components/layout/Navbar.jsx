import { useEffect, useState } from "react";
import { Shield, Wifi, WifiOff, BatteryFull, Bell, Clock3, LogOut } from "lucide-react";

import { useDrone } from "../../context/DroneContext";
import { useAuth } from "../../context/AuthContext";

export default function Navbar() {
  const { connected, simulated, battery, alerts, markAlertsRead } = useDrone();
  const { user, logout } = useAuth();
  const [now, setNow] = useState(new Date().toLocaleTimeString());
  const [showAlerts, setShowAlerts] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => setNow(new Date().toLocaleTimeString()), 1000);
    return () => clearInterval(timer);
  }, []);

  const unread = alerts.filter((a) => a.statut === "NOUVELLE").length;

  return (
    <header className="h-14 bg-slate-900 border-b border-slate-800 px-4 flex items-center justify-between">
      <div className="flex items-center gap-3">
        <Shield size={30} className="text-cyan-400" />
        <div>
          <h1 className="font-bold text-base">DH_MIL</h1>
          <p className="text-xs text-slate-400">Hybrid Drone Control System</p>
        </div>
      </div>

      <div className="flex items-center gap-5">
        {connected ? (
          <span className="flex items-center gap-1 text-green-400" title={simulated ? "Simulation" : "Liaison réelle"}>
            <Wifi />
            {simulated && <span className="text-[10px] font-semibold">SIM</span>}
          </span>
        ) : (
          <WifiOff className="text-red-400" />
        )}

        <BatteryFull className={battery > 20 ? "text-green-400" : "text-red-400"} />

        <div className="relative">
          <button onClick={() => { setShowAlerts((s) => !s); markAlertsRead(); }} className="relative">
            <Bell className={unread > 0 ? "text-yellow-400" : "text-slate-500"} />
            {unread > 0 && (
              <span className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-600 text-[9px] font-bold">
                {unread}
              </span>
            )}
          </button>

          {showAlerts && (
            <div className="absolute right-0 top-8 z-30 w-72 max-h-80 overflow-auto rounded-xl border border-slate-800 bg-slate-900 p-2 shadow-lg">
              {alerts.length === 0 ? (
                <p className="p-2 text-xs text-slate-500">Aucune alerte</p>
              ) : (
                alerts.map((a) => (
                  <div key={a.id} className="border-b border-slate-800 p-2 text-xs last:border-0">
                    <span className="font-semibold text-cyan-400">{a.type}</span>
                    <p className="mt-0.5 text-slate-300">{a.message}</p>
                  </div>
                ))
              )}
            </div>
          )}
        </div>

        <div className="flex items-center gap-2">
          <Clock3 size={18} />
          <span className="text-sm">{now}</span>
        </div>

        <button
          onClick={logout}
          title={user?.email}
          className="flex items-center gap-1 rounded-lg px-2 py-1 text-xs text-slate-400 transition hover:bg-slate-800 hover:text-white"
        >
          <LogOut size={16} />
        </button>
      </div>
    </header>
  );
}
