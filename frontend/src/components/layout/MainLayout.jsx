import Navbar from "./Navbar";
import Sidebar from "./Sidebar";

export default function MainLayout({ children }) {
  return (
    <div className="flex min-h-screen flex-col bg-slate-950 text-white xl:h-screen xl:overflow-hidden">
      <Navbar />

      <div className="flex flex-1 xl:min-h-0 xl:overflow-hidden">
        <Sidebar />

        <main className="flex-1 p-3 xl:min-h-0 xl:overflow-hidden xl:p-4">
          {children}
        </main>
      </div>
    </div>
  );
}