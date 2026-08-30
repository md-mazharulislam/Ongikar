import { useEffect, useState } from "react";
import api from "../../api/axios";
import Loader from "../../components/Loader";
import "../Wallet.css"; // reuse modal-overlay / modal-box styles

const bn = (n) => Number(n || 0).toLocaleString("bn-BD");

function WalletAdjustModal({ user, onClose, onDone }) {
  const [amount, setAmount] = useState("");
  const [currency, setCurrency] = useState("BDT");
  const [note, setNote] = useState("");
  const [result, setResult] = useState(null);
  const [busy, setBusy] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setBusy(true);
    try {
      const { data } = await api.put(`/admin/users/${user._id}/wallet`, { amount, currency, note });
      setResult({ ok: true, text: data.message });
      onDone(data.wallet);
    } catch (err) {
      setResult({ ok: false, text: err.response?.data?.message || "ব্যর্থ হয়েছে।" });
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-box" onClick={(e) => e.stopPropagation()}>
        <div className="modal-head">
          <h3><i className="fa-solid fa-wallet"></i> ওয়ালেট সমন্বয় — {user.name}</h3>
          <button className="modal-close" onClick={onClose}><i className="fa-solid fa-xmark"></i></button>
        </div>
        <div className="modal-body-w admin-modal-form">
          {result && (
            <div className={`alert-banner ${result.ok ? "alert-success" : "alert-error"}`}>{result.text}</div>
          )}
          <p className="muted mb-2">
            বর্তমান ব্যালেন্স: ৳{bn(user.wallet?.balanceBDT)} / ${bn(user.wallet?.balanceUSD)}
          </p>
          <form onSubmit={submit}>
            <div className="field-group">
              <label className="field-label">পরিমাণ (ধনাত্মক = জমা, ঋণাত্মক = কর্তন)</label>
              <input type="number" step="0.01" className="field-input" value={amount} onChange={(e) => setAmount(e.target.value)} required />
            </div>
            <div className="field-group">
              <label className="field-label">মুদ্রা</label>
              <select className="field-input" value={currency} onChange={(e) => setCurrency(e.target.value)}>
                <option value="BDT">BDT</option>
                <option value="USD">USD</option>
              </select>
            </div>
            <div className="field-group">
              <label className="field-label">নোট</label>
              <input className="field-input" placeholder="কারণ লিখুন" value={note} onChange={(e) => setNote(e.target.value)} />
            </div>
            <button className="btn btn-primary btn-block" disabled={busy}>{busy ? "প্রক্রিয়াধীন..." : "সমন্বয় করুন"}</button>
          </form>
        </div>
      </div>
    </div>
  );
}

export default function AdminUsers() {
  const [users, setUsers] = useState([]);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [walletTarget, setWalletTarget] = useState(null);
  const [msg, setMsg] = useState(null);

  const load = async (p = page, s = search) => {
    setLoading(true);
    try {
      const { data } = await api.get("/admin/users", { params: { page: p, search: s, limit: 15 } });
      setUsers(data.users);
      setPages(data.pages || 1);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load(1, "");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    setPage(1);
    load(1, search);
  };

  const toggleActive = async (u) => {
    try {
      await api.put(`/admin/users/${u._id}`, { isActive: !u.isActive });
      setUsers((prev) => prev.map((x) => (x._id === u._id ? { ...x, isActive: !x.isActive } : x)));
    } catch (err) {
      setMsg({ ok: false, text: err.response?.data?.message || "ব্যর্থ হয়েছে।" });
    }
  };

  const toggleRole = async (u) => {
    const newRole = u.role === "admin" ? "member" : "admin";
    if (!window.confirm(`${u.name} কে ${newRole === "admin" ? "অ্যাডমিন" : "সাধারণ সদস্য"} বানাতে চান?`)) return;
    try {
      await api.put(`/admin/users/${u._id}`, { role: newRole });
      setUsers((prev) => prev.map((x) => (x._id === u._id ? { ...x, role: newRole } : x)));
    } catch (err) {
      setMsg({ ok: false, text: err.response?.data?.message || "ব্যর্থ হয়েছে।" });
    }
  };

  const deleteUser = async (u) => {
    if (!window.confirm(`${u.name} কে স্থায়ীভাবে মুছে ফেলতে চান? এটি অপরিবর্তনীয়।`)) return;
    try {
      await api.delete(`/admin/users/${u._id}`);
      setUsers((prev) => prev.filter((x) => x._id !== u._id));
    } catch (err) {
      setMsg({ ok: false, text: err.response?.data?.message || "ব্যর্থ হয়েছে।" });
    }
  };

  return (
    <div>
      {msg && <div className={`alert-banner ${msg.ok ? "alert-success" : "alert-error"}`}>{msg.text}</div>}

      <form className="admin-toolbar" onSubmit={handleSearch}>
        <input
          className="field-input admin-search"
          placeholder="নাম, ফোন বা ইমেইল দিয়ে খুঁজুন..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <button className="btn btn-outline btn-sm" type="submit">খুঁজুন</button>
      </form>

      {loading ? (
        <Loader />
      ) : (
        <>
          <div className="admin-table-wrap">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>নাম</th>
                  <th>ফোন</th>
                  <th>ব্যালেন্স (BDT)</th>
                  <th>ভূমিকা</th>
                  <th>অবস্থা</th>
                  <th>অ্যাকশন</th>
                </tr>
              </thead>
              <tbody>
                {users.map((u) => (
                  <tr key={u._id}>
                    <td>{u.name}</td>
                    <td>{u.phone}</td>
                    <td>৳{bn(u.wallet?.balanceBDT)}</td>
                    <td>
                      <span className={`badge ${u.role === "admin" ? "badge-admin" : "badge-member"}`}>
                        {u.role === "admin" ? "অ্যাডমিন" : "সদস্য"}
                      </span>
                    </td>
                    <td>
                      <span className={`badge ${u.isActive ? "badge-active" : "badge-inactive"}`}>
                        {u.isActive ? "সক্রিয়" : "নিষ্ক্রিয়"}
                      </span>
                    </td>
                    <td>
                      <button className="icon-btn" title="ওয়ালেট সমন্বয়" onClick={() => setWalletTarget(u)}>
                        <i className="fa-solid fa-wallet"></i>
                      </button>
                      <button className="icon-btn" title="ভূমিকা পরিবর্তন" onClick={() => toggleRole(u)}>
                        <i className="fa-solid fa-user-shield"></i>
                      </button>
                      <button className="icon-btn" title={u.isActive ? "নিষ্ক্রিয় করুন" : "সক্রিয় করুন"} onClick={() => toggleActive(u)}>
                        <i className={`fa-solid ${u.isActive ? "fa-lock" : "fa-lock-open"}`}></i>
                      </button>
                      <button className="icon-btn danger" title="মুছে ফেলুন" onClick={() => deleteUser(u)}>
                        <i className="fa-solid fa-trash"></i>
                      </button>
                    </td>
                  </tr>
                ))}
                {users.length === 0 && (
                  <tr><td colSpan={6} className="text-center muted">কোনো ব্যবহারকারী পাওয়া যায়নি।</td></tr>
                )}
              </tbody>
            </table>
          </div>

          {pages > 1 && (
            <div className="pagination">
              <button disabled={page <= 1} onClick={() => { setPage(page - 1); load(page - 1); }}>আগের</button>
              <span className="muted">{bn(page)} / {bn(pages)}</span>
              <button disabled={page >= pages} onClick={() => { setPage(page + 1); load(page + 1); }}>পরের</button>
            </div>
          )}
        </>
      )}

      {walletTarget && (
        <WalletAdjustModal
          user={walletTarget}
          onClose={() => setWalletTarget(null)}
          onDone={(wallet) =>
            setUsers((prev) => prev.map((x) => (x._id === walletTarget._id ? { ...x, wallet } : x)))
          }
        />
      )}
    </div>
  );
}
