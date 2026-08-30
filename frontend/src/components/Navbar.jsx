import { useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import "./Navbar.css";

const links = [
  { to: "/profile", label: "প্রোফাইল", icon: "fa-user" },
  { to: "/home", label: "হোম", icon: "fa-house" },
  { to: "/wallet", label: "ওয়ালেট", icon: "fa-wallet" },
  { to: "/management", label: "ম্যানেজমেন্ট", icon: "fa-users" },
  { to: "/settings", label: "সেটিংস", icon: "fa-gear" },
  { to: "/about", label: "আমাদের সম্পর্কে", icon: "fa-circle-info" },
];

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const { user, wallet, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <header className="nav-header">
      <nav className="navbar-w">
        <NavLink to="/home" className="brand">
          <span className="seal brand-seal">
            <i className="fas fa-infinity"></i>
          </span>
          অঙ্গীকার
        </NavLink>

        <div className="nav-right">
          <div className="balance-pill" title="ব্যালেন্স">
            <i className="fa-solid fa-bangladeshi-taka-sign"></i>
            <span>{wallet ? wallet.balanceBDT.toLocaleString("bn-BD") : "০"}</span>
          </div>
          <button
            className={`hamburger ${open ? "is-open" : ""}`}
            aria-label="মেনু খুলুন"
            onClick={() => setOpen((o) => !o)}
          >
            <span></span><span></span><span></span>
          </button>
        </div>

        <div className={`nav-links ${open ? "show" : ""}`}>
          {links.map((l) => (
            <NavLink
              key={l.to}
              to={l.to}
              className={({ isActive }) => "nav-link" + (isActive ? " active" : "")}
              onClick={() => setOpen(false)}
            >
              <i className={`fa-solid ${l.icon}`}></i> {l.label}
            </NavLink>
          ))}
          {user?.role === "admin" && (
            <NavLink
              to="/admin"
              className={({ isActive }) => "nav-link admin-link" + (isActive ? " active" : "")}
              onClick={() => setOpen(false)}
            >
              <i className="fa-solid fa-shield-halved"></i> অ্যাডমিন প্যানেল
            </NavLink>
          )}
          <button className="nav-link logout-link" onClick={handleLogout}>
            <i className="fa-solid fa-right-from-bracket"></i> লগ আউট
          </button>
        </div>
      </nav>
    </header>
  );
}
