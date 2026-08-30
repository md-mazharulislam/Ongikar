import { NavLink, Outlet } from "react-router-dom";
import "./Admin.css";

const TABS = [
  { to: "/admin", label: "ড্যাশবোর্ড", icon: "fa-gauge-high", end: true },
  { to: "/admin/users", label: "ব্যবহারকারী", icon: "fa-users" },
  { to: "/admin/transactions", label: "লেনদেন", icon: "fa-file-invoice-dollar" },
  { to: "/admin/items", label: "এক্সচেঞ্জ আইটেম", icon: "fa-recycle" },
  { to: "/admin/management", label: "ম্যানেজমেন্ট", icon: "fa-user-tie" },
];

export default function AdminLayout() {
  return (
    <div className="admin-wrap">
      <h1 className="page-title" style={{ marginBottom: 4 }}>অ্যাডমিন প্যানেল</h1>
      <p className="page-description">ব্যবহারকারী, ওয়ালেট, লেনদেন, আইটেম ও ম্যানেজমেন্ট টিম নিয়ন্ত্রণ করুন।</p>

      <div className="admin-tabs">
        {TABS.map((t) => (
          <NavLink
            key={t.to}
            to={t.to}
            end={t.end}
            className={({ isActive }) => "admin-tab" + (isActive ? " active" : "")}
          >
            <i className={`fa-solid ${t.icon}`}></i> {t.label}
          </NavLink>
        ))}
      </div>

      <Outlet />
    </div>
  );
}
