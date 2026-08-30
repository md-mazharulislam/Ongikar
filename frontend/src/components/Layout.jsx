import { Outlet } from "react-router-dom";
import Navbar from "./Navbar";
import NewsTicker from "./NewsTicker";

export default function Layout() {
  return (
    <div className="app-shell">
      <Navbar />
      <main className="page-content">
        <Outlet />
      </main>
      <NewsTicker />
    </div>
  );
}
