import { useEffect, useState } from "react";
import api from "../../api/axios";
import Loader from "../../components/Loader";
import "../Wallet.css";

const emptyForm = { nameBn: "", nameEn: "", unit: "kg", stock: 0, ratePerUnitBDT: "", image: "", active: true };

function ItemFormModal({ initial, onClose, onSaved }) {
  const [form, setForm] = useState(initial || emptyForm);
  const [result, setResult] = useState(null);
  const [busy, setBusy] = useState(false);
  const isEdit = Boolean(initial?._id);

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const submit = async (e) => {
    e.preventDefault();
    setBusy(true);
    try {
      const payload = { ...form, stock: Number(form.stock), ratePerUnitBDT: Number(form.ratePerUnitBDT) };
      const { data } = isEdit
        ? await api.put(`/admin/items/${initial._id}`, payload)
        : await api.post(`/admin/items`, payload);
      setResult({ ok: true, text: data.message });
      onSaved(data.item);
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
          <h3><i className="fa-solid fa-recycle"></i> {isEdit ? "আইটেম সম্পাদনা" : "নতুন আইটেম"}</h3>
          <button className="modal-close" onClick={onClose}><i className="fa-solid fa-xmark"></i></button>
        </div>
        <div className="modal-body-w">
          {result && <div className={`alert-banner ${result.ok ? "alert-success" : "alert-error"}`}>{result.text}</div>}
          <form onSubmit={submit}>
            <div className="field-group"><label className="field-label">নাম (বাংলা)</label><input className="field-input" value={form.nameBn} onChange={set("nameBn")} required /></div>
            <div className="field-group"><label className="field-label">নাম (ইংরেজি)</label><input className="field-input" value={form.nameEn} onChange={set("nameEn")} required /></div>
            <div className="field-group">
              <label className="field-label">একক</label>
              <select className="field-input" value={form.unit} onChange={set("unit")}>
                <option value="kg">কেজি</option>
                <option value="piece">টি (পিস)</option>
              </select>
            </div>
            <div className="field-group"><label className="field-label">স্টক পরিমাণ</label><input type="number" className="field-input" value={form.stock} onChange={set("stock")} /></div>
            <div className="field-group"><label className="field-label">মূল্য / একক (৳)</label><input type="number" step="0.01" className="field-input" value={form.ratePerUnitBDT} onChange={set("ratePerUnitBDT")} required /></div>
            <div className="field-group"><label className="field-label">ছবির ফাইলের নাম (assets/images ফোল্ডারে)</label><input className="field-input" placeholder="e.g. cigarettes.jpg" value={form.image} onChange={set("image")} /></div>
            <label className="terms-check" style={{ marginBottom: "1rem" }}>
              <input type="checkbox" checked={form.active} onChange={(e) => setForm((f) => ({ ...f, active: e.target.checked }))} />
              সক্রিয় (হোম পেজে দেখানো হবে)
            </label>
            <button className="btn btn-primary btn-block" disabled={busy}>{busy ? "সংরক্ষণ হচ্ছে..." : "সংরক্ষণ করুন"}</button>
          </form>
        </div>
      </div>
    </div>
  );
}

export default function AdminItems() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(null);
  const [creating, setCreating] = useState(false);
  const [msg, setMsg] = useState(null);

  const load = () => {
    setLoading(true);
    api.get("/admin/items").then(({ data }) => setItems(data.items)).finally(() => setLoading(false));
  };

  useEffect(load, []);

  const remove = async (item) => {
    if (!window.confirm(`"${item.nameBn}" মুছে ফেলতে চান?`)) return;
    try {
      await api.delete(`/admin/items/${item._id}`);
      setItems((prev) => prev.filter((i) => i._id !== item._id));
    } catch (err) {
      setMsg({ ok: false, text: err.response?.data?.message || "ব্যর্থ হয়েছে।" });
    }
  };

  const upsertLocal = (item) => {
    setItems((prev) => {
      const exists = prev.find((i) => i._id === item._id);
      return exists ? prev.map((i) => (i._id === item._id ? item : i)) : [...prev, item];
    });
    setEditing(null);
    setCreating(false);
  };

  return (
    <div>
      {msg && <div className={`alert-banner ${msg.ok ? "alert-success" : "alert-error"}`}>{msg.text}</div>}

      <div className="admin-toolbar">
        <span className="muted">মোট {items.length}টি আইটেম</span>
        <button className="btn btn-primary btn-sm" onClick={() => setCreating(true)}>
          <i className="fa-solid fa-plus"></i> নতুন আইটেম
        </button>
      </div>

      {loading ? (
        <Loader />
      ) : (
        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead>
              <tr>
                <th>নাম</th>
                <th>একক</th>
                <th>স্টক</th>
                <th>মূল্য/একক</th>
                <th>অবস্থা</th>
                <th>অ্যাকশন</th>
              </tr>
            </thead>
            <tbody>
              {items.map((it) => (
                <tr key={it._id}>
                  <td>{it.nameBn}</td>
                  <td>{it.unit === "kg" ? "কেজি" : "পিস"}</td>
                  <td>{it.stock}</td>
                  <td>৳{it.ratePerUnitBDT}</td>
                  <td><span className={`badge ${it.active ? "badge-active" : "badge-inactive"}`}>{it.active ? "সক্রিয়" : "নিষ্ক্রিয়"}</span></td>
                  <td>
                    <button className="icon-btn" onClick={() => setEditing(it)}><i className="fa-solid fa-pen"></i></button>
                    <button className="icon-btn danger" onClick={() => remove(it)}><i className="fa-solid fa-trash"></i></button>
                  </td>
                </tr>
              ))}
              {items.length === 0 && <tr><td colSpan={6} className="text-center muted">কোনো আইটেম নেই।</td></tr>}
            </tbody>
          </table>
        </div>
      )}

      {creating && <ItemFormModal onClose={() => setCreating(false)} onSaved={upsertLocal} />}
      {editing && <ItemFormModal initial={editing} onClose={() => setEditing(null)} onSaved={upsertLocal} />}
    </div>
  );
}
