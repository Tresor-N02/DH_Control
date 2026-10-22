import { useEffect, useRef, useState } from "react";
import { Shield, Bell, LogOut, Menu, X } from "lucide-react";
import { useDrone } from "../../context/useDrone";
import { useAuth } from "../../context/useAuth";
import Sidebar from "./Sidebar";
export default function Navbar() {
  const { alerts, markAlertsRead } = useDrone();
  const { user, logout } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);
  const [showAlerts, setShowAlerts] = useState(false);
  const panelRef = useRef(null);
  useEffect(() => {
    const close = (event) => {
      if (event.key === "Escape") {
        setShowAlerts(false);
        setMenuOpen(false);
      }
    };
    const outside = (event) => {
      if (!panelRef.current?.contains(event.target)) setShowAlerts(false);
    };
    document.addEventListener("keydown", close);
    document.addEventListener("pointerdown", outside);
    return () => {
      document.removeEventListener("keydown", close);
      document.removeEventListener("pointerdown", outside);
    };
  }, []);
  const unread = alerts.filter((a) => a.statut === "NOUVELLE").length;
  return (
    <header className="relative z-[1200] border-b border-slate-800 bg-slate-900">
      <div className="flex min-h-16 items-center justify-between gap-2 px-3 md:px-5">
        <div className="flex items-center gap-3">
          <button
            aria-label={menuOpen ? "Fermer le menu" : "Ouvrir le menu"}
            aria-expanded={menuOpen}
            aria-controls="mobile-navigation"
            onClick={() => setMenuOpen(!menuOpen)}
            className="p-2 lg:hidden"
          >
            {menuOpen ? <X /> : <Menu />}
          </button>
          <Shield className="text-cyan-400" />
          <div>
            <h1 className="font-bold">DH_MIL</h1>
            <p className="hidden text-xs text-slate-400 sm:block">
              Supervision du drone hybride
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <div ref={panelRef}>
            <button
              aria-label={`Alertes : ${unread} non lues`}
              aria-expanded={showAlerts}
              aria-controls="alerts-panel"
              onClick={() => setShowAlerts(!showAlerts)}
              className="flex items-center gap-2 rounded-lg p-3 hover:bg-slate-800"
            >
              <Bell size={20} />
              <span className="text-sm">{unread}</span>
            </button>
            {showAlerts && (
              <section
                id="alerts-panel"
                aria-label="Alertes"
                className="absolute right-3 top-16 max-h-[70vh] w-[min(24rem,calc(100vw-1.5rem))] overflow-auto rounded-xl border border-slate-700 bg-slate-900 p-4 shadow-xl"
              >
                <div className="mb-3 flex items-center justify-between gap-2">
                  <h2 className="font-semibold">Alertes</h2>
                  <button
                    onClick={markAlertsRead}
                    disabled={!unread}
                    className="text-sm text-cyan-300 disabled:text-slate-500"
                  >
                    Tout marquer comme lu
                  </button>
                </div>
                {!alerts.length ? (
                  <p className="text-sm text-slate-400">Aucune alerte.</p>
                ) : (
                  alerts.map((a) => (
                    <article
                      key={a.id}
                      className="border-t border-slate-700 py-3"
                    >
                      <p
                        className={`text-sm font-semibold ${a.type === "INFO" ? "text-cyan-300" : "text-amber-300"}`}
                      >
                        {a.type === "INFO" ? "Information" : "Avertissement"} ·{" "}
                        {a.type}
                        {a.statut === "NOUVELLE" ? " · Non lue" : ""}
                      </p>
                      <p className="mt-1 text-sm">{a.message}</p>
                      <time className="text-xs text-slate-400">
                        {a.receivedAt
                          ? new Date(a.receivedAt).toLocaleString("fr-FR")
                          : ""}
                      </time>
                    </article>
                  ))
                )}
              </section>
            )}
          </div>
          <button
            onClick={logout}
            aria-label="Se déconnecter"
            title={user?.email}
            className="rounded-lg p-3 hover:bg-slate-800"
          >
            <LogOut size={20} />
          </button>
        </div>
      </div>
      {menuOpen && (
        <div id="mobile-navigation">
          <Sidebar mobile onNavigate={() => setMenuOpen(false)} />
        </div>
      )}
    </header>
  );
}
