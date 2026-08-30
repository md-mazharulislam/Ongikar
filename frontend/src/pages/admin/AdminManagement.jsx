import { useEffect, useState } from "react";
import api from "../../api/axios";
import Loader from "../../components/Loader";
import "../Wallet.css";

const emptyForm = {
  name: "",
  designationBn: "",
  designationEn: "",
  category: "founder",
  bio: "",
  photo: "",
  email: "",
  facebook: "",
  linkedin: "",
  order: 0,
  active: true,
};

const CATEGORY_LABEL = {
  founder: "প্রতিষ্ঠাতা",
  "co-founder": "সহ-প্রতিষ্ঠাতা",
  advisor: "উপদেষ্টা",
  team: "টিম সদস্য",
  volunteer: "স্বেচ্ছাসেবক",
};

function MemberFormModal({ initial, onClose, onSaved }) {
  const [form, setForm] = useState(initial || emptyForm);
  const [result, setResult] = useState(null);
  const [busy, setBusy] = useState(false);
  const isEdit = Boolean(initial?._id);

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const handlePhoto = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => setForm((f) => ({ ...f, photo: reader.result }));
    reader.readAsDataURL(file);
  };

  const submit = async (e) => {
    e.preventDefault();
    setBusy(true);
    try {
      const payload = { ...form, order: Number(form.order) || 0 };
      const { data } = isEdit
        ? await api.put(`/admin/management/${initial._id}`, payload)
        : await api.post(`/admin/management`, payload);
      setResult({ ok: true, text: data.message });
      onSaved(data.member);
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
          <h3><i className="fa-solid fa-user-tie"></i> {isEdit ? "সদস্য সম্পাদনা" : "নতুন সদস্য"}</h3>
          <button className="modal-close" onClick={onClose}><i className="fa-solid fa-xmark"></i></button>
        </div>
        <div className="modal-body-w">
          {result && <div className={`alert-banner ${result.ok ? "alert-success" : "alert-error"}`}>{result.text}</div>}
          <form onSubmit={submit}>
            <div className="field-group"><label className="field-label">নাম</label><input className="field-input" value={form.name} onChange={set("name")} required /></div>
            <div className="field-group">
              <label className="field-label">শ্রেণী</label>
              <select className="field-input" value={form.category} onChange={set("category")}>
                {Object.entries(CATEGORY_LABEL).map(([k, v]) => (
                  <option key={k} value={k}>{v}</option>
                ))}
              </select>
            </div>
            <div className="field-group"><label className="field-label">পদবি (বাংলা)</label><input className="field-input" value={form.designationBn} onChange={set("designationBn")} required /></div>
            <div className="field-group"><label className="field-label">পদবি (ইংরেজি, ঐচ্ছিক)</label><input className="field-input" value={form.designationEn} onChange={set("designationEn")} /></div>
            <div className="field-group"><label className="field-label">সংক্ষিপ্ত পরিচিতি</label><textarea className="field-input" rows={3} value={form.bio} onChange={set("bio")}></textarea></div>
            <div className="field-group">
              <label className="field-label">ছবি</label>
              <input type="file" accept="image/*" className="field-input" onChange={handlePhoto} />
              {form.photo && <img src={form.photo} alt="preview" style={{ width: 60, height: 60, borderRadius: "50%", marginTop: 8, objectFit: "cover" }} />}
            </div>
            <div className="field-group"><label className="field-label">ইমেইল</label><input className="field-input" value={form.email} onChange={set("email")} /></div>
            <div className="field-group"><label className="field-label">Facebook URL</label><input className="field-input" value={form.facebook} onChange={set("facebook")} /></div>
            <div className="field-group"><label className="field-label">LinkedIn URL</label><input className="field-input" value={form.linkedin} onChange={set("linkedin")} /></div>
            <div className="field-group"><label className="field-label">ক্রম (ছোট সংখ্যা আগে দেখাবে)</label><input type="number" className="field-input" value={form.order} onChange={set("order")} /></div>
            <label className="terms-check" style={{ marginBottom: "1rem" }}>
              <input type="checkbox" checked={form.active} onChange={(e) => setForm((f) => ({ ...f, active: e.target.checked }))} />
              সক্রিয় (ম্যানেজমেন্ট পেজে দেখানো হবে)
            </label>
            <button className="btn btn-primary btn-block" disabled={busy}>{busy ? "সংরক্ষণ হচ্ছে..." : "সংরক্ষণ করুন"}</button>
          </form>
        </div>
      </div>
    </div>
  );
}

export default function AdminManagement() {
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(null);
  const [creating, setCreating] = useState(false);
  const [msg, setMsg] = useState(null);

  const load = () => {
    setLoading(true);
    api.get("/admin/management").then(({ data }) => setMembers(data.members)).finally(() => setLoading(false));
  };

  useEffect(load, []);

  const remove = async (m) => {
    if (!window.confirm(`"${m.name}" কে মুছে ফেলতে চান?`)) return;
    try {
      await api.delete(`/admin/management/${m._id}`);
      setMembers((prev) => prev.filter((x) => x._id !== m._id));
    } catch (err) {
      setMsg({ ok: false, text: err.response?.data?.message || "ব্যর্থ হয়েছে।" });
    }
  };

  const upsertLocal = (member) => {
    setMembers((prev) => {
      const exists = prev.find((x) => x._id === member._id);
      return exists ? prev.map((x) => (x._id === member._id ? member : x)) : [...prev, member];
    });
    setEditing(null);
    setCreating(false);
  };

  return (
    <div>
      {msg && <div className={`alert-banner ${msg.ok ? "alert-success" : "alert-error"}`}>{msg.text}</div>}

      <div className="admin-toolbar">
        <span className="muted">মোট {members.length}জন সদস্য</span>
        <button className="btn btn-primary btn-sm" onClick={() => setCreating(true)}>
          <i className="fa-solid fa-plus"></i> নতুন সদস্য
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
                <th>শ্রেণী</th>
                <th>পদবি</th>
                <th>ক্রম</th>
                <th>অবস্থা</th>
                <th>অ্যাকশন</th>
              </tr>
            </thead>
            <tbody>
              {members.map((m) => (
                <tr key={m._id}>
                  <td>{m.name}</td>
                  <td>{CATEGORY_LABEL[m.category] || m.category}</td>
                  <td>{m.designationBn}</td>
                  <td>{m.order}</td>
                  <td><span className={`badge ${m.active ? "badge-active" : "badge-inactive"}`}>{m.active ? "সক্রিয়" : "নিষ্ক্রিয়"}</span></td>
                  <td>
                    <button className="icon-btn" onClick={() => setEditing(m)}><i className="fa-solid fa-pen"></i></button>
                    <button className="icon-btn danger" onClick={() => remove(m)}><i className="fa-solid fa-trash"></i></button>
                  </td>
                </tr>
              ))}
              {members.length === 0 && <tr><td colSpan={6} className="text-center muted">কোনো সদস্য নেই।</td></tr>}
            </tbody>
          </table>
        </div>
      )}

      {creating && <MemberFormModal onClose={() => setCreating(false)} onSaved={upsertLocal} />}
      {editing && <MemberFormModal initial={editing} onClose={() => setEditing(null)} onSaved={upsertLocal} />}
    </div>
  );
}
