import { useEffect, useState } from "react";
import api from "../../api/axios";
import Loader from "../../components/Loader";

const bn = (n) => Number(n || 0).toLocaleString("bn-BD");

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    api
      .get("/admin/stats")
      .then(({ data }) => setStats(data))
      .catch((err) => setError(err.response?.data?.message || "লোড ব্যর্থ হয়েছে।"));
  }, []);

  if (error) return <div className="alert-banner alert-error">{error}</div>;
  if (!stats) return <Loader />;

  const cards = [
    { label: "মোট ব্যবহারকারী", value: bn(stats.userCount), icon: "fa-users" },
    { label: "সক্রিয় ব্যবহারকারী", value: bn(stats.activeUserCount), icon: "fa-user-check" },
    { label: "মোট ওয়ালেট ব্যালেন্স (BDT)", value: `৳${bn(Math.round(stats.totalBDT))}`, icon: "fa-sack-dollar" },
    { label: "মোট ওয়ালেট ব্যালেন্স (USD)", value: `$${bn(Math.round(stats.totalUSD))}`, icon: "fa-dollar-sign" },
    { label: "মোট সঞ্চয়", value: `৳${bn(Math.round(stats.totalSavings))}`, icon: "fa-piggy-bank" },
    { label: "মোট রিওয়ার্ড পয়েন্ট", value: bn(stats.totalRewardPoints), icon: "fa-star" },
    { label: "মোট লেনদেন", value: bn(stats.transactionCount), icon: "fa-file-invoice-dollar" },
    { label: "সক্রিয় এক্সচেঞ্জ আইটেম", value: bn(stats.itemCount), icon: "fa-recycle" },
  ];

  return (
    <div className="stat-grid">
      {cards.map((c) => (
        <div className="stat-card" key={c.label}>
          <i className={`fa-solid ${c.icon}`} style={{ color: "var(--gold)", fontSize: "1.2rem" }}></i>
          <span className="num">{c.value}</span>
          <span className="label">{c.label}</span>
        </div>
      ))}
    </div>
  );
}
