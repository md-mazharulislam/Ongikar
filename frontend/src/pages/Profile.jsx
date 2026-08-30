import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import api from "../api/axios";
import defaultAvatar from "../assets/images/mazharul.jpg";
import "./Profile.css";

const bn = (n) => Number(n || 0).toLocaleString("bn-BD");

export default function Profile() {
  const { user, setUser, wallet, setWallet } = useAuth();
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({
    name: user?.name || "",
    email: user?.email || "",
    phone: user?.phone || "",
    address: user?.address || "",
    dob: user?.dob ? user.dob.substring(0, 10) : "",
  });
  const [msg, setMsg] = useState(null);

  const [methods, setMethods] = useState([]);
  const [activeMethod, setActiveMethod] = useState("bank");
  const [methodForm, setMethodForm] = useState({});
  const [methodMsg, setMethodMsg] = useState(null);

  useEffect(() => {
    api.get("/users/payment-methods").then(({ data }) => setMethods(data.methods)).catch(() => {});
  }, []);

  const handleAvatarChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = async () => {
      try {
        const { data } = await api.put("/users/photo", { avatar: reader.result });
        setUser(data.user);
      } catch {
        setMsg({ ok: false, text: "ছবি আপলোড ব্যর্থ হয়েছে।" });
      }
    };
    reader.readAsDataURL(file);
  };

  const saveProfile = async () => {
    try {
      const { data } = await api.put("/users/profile", form);
      setUser(data.user);
      setEditing(false);
      setMsg({ ok: true, text: "প্রোফাইল হালনাগাদ হয়েছে।" });
    } catch (err) {
      setMsg({ ok: false, text: err.response?.data?.message || "সংরক্ষণ ব্যর্থ হয়েছে।" });
    }
  };

  const saveMethod = async () => {
    try {
      const { data } = await api.post("/users/payment-methods", { type: activeMethod, ...methodForm });
      setMethods((prev) => {
        const rest = prev.filter((m) => m.type !== activeMethod);
        return [...rest, data.method];
      });
      setMethodMsg({ ok: true, text: "সংরক্ষণ করা হয়েছে।" });
      setMethodForm({});
    } catch (err) {
      setMethodMsg({ ok: false, text: err.response?.data?.message || "ব্যর্থ হয়েছে।" });
    }
  };

  const savedMethod = methods.find((m) => m.type === activeMethod);

  return (
    <div className="profile-wrapper">
      <div className="profile-cover">
        <div className="cover-bg"></div>
        <div className="avatar-wrap">
          <div className="avatar-ring">
            <img src={user?.avatar || defaultAvatar} alt="প্রোফাইল ছবি" />
          </div>
          <label className="avatar-edit-btn" title="ছবি পরিবর্তন করুন">
            <i className="fa-solid fa-camera"></i>
            <input type="file" accept="image/*" hidden onChange={handleAvatarChange} />
          </label>
        </div>
      </div>

      <div className="profile-name-section">
        <h1 className="profile-name">{user?.name}</h1>
        <span className="profile-role"><i className="fa-solid fa-briefcase"></i> সদস্য : অঙ্গীকার</span>
      </div>

      <div className="stats-row">
        <div className="stat-item">
          <span className="stat-num">৳{bn(wallet?.balanceBDT)}</span>
          <span className="stat-label">ব্যালেন্স (BDT)</span>
        </div>
        <div className="stat-divider"></div>
        <div className="stat-item">
          <span className="stat-num">${bn(wallet?.balanceUSD)}</span>
          <span className="stat-label">ব্যালেন্স (USD)</span>
        </div>
        <div className="stat-divider"></div>
        <div className="stat-item">
          <span className="stat-num">{bn(user?.ordersCount)}</span>
          <span className="stat-label">অর্ডার</span>
        </div>
      </div>

      {msg && (
        <div className={`alert-banner ${msg.ok ? "alert-success" : "alert-error"}`}>
          <i className={`fa-solid ${msg.ok ? "fa-circle-check" : "fa-circle-exclamation"}`}></i>
          {msg.text}
        </div>
      )}

      <div className="info-card card">
        <div className="info-card-header">
          <h2><i className="fa-solid fa-user"></i> ব্যক্তিগত তথ্য</h2>
          <button className="edit-btn" onClick={() => setEditing((e) => !e)}>
            <i className="fa-solid fa-pen"></i> {editing ? "বাতিল" : "সম্পাদনা"}
          </button>
        </div>

        {!editing ? (
          <div>
            <div className="info-item">
              <i className="fa-solid fa-envelope"></i>
              <div><span className="info-label">ইমেইল</span><span className="info-value">{user?.email || "যোগ করা হয়নি"}</span></div>
            </div>
            <div className="info-item">
              <i className="fa-solid fa-phone"></i>
              <div><span className="info-label">ফোন</span><span className="info-value">{user?.phone}</span></div>
            </div>
            <div className="info-item">
              <i className="fa-solid fa-map-marker-alt"></i>
              <div><span className="info-label">ঠিকানা</span><span className="info-value">{user?.address || "যোগ করা হয়নি"}</span></div>
            </div>
            <div className="info-item">
              <i className="fa-solid fa-birthday-cake"></i>
              <div><span className="info-label">জন্ম তারিখ</span><span className="info-value">{form.dob || "যোগ করা হয়নি"}</span></div>
            </div>
          </div>
        ) : (
          <div>
            <div className="field-group"><input className="field-input" placeholder="নাম" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></div>
            <div className="field-group"><input type="email" className="field-input" placeholder="ইমেইল" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} /></div>
            <div className="field-group"><input className="field-input" placeholder="ফোন" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} /></div>
            <div className="field-group"><input className="field-input" placeholder="ঠিকানা" value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} /></div>
            <div className="field-group"><input type="date" className="field-input" value={form.dob} onChange={(e) => setForm({ ...form, dob: e.target.value })} /></div>
            <div className="flex gap-1">
              <button className="btn btn-primary btn-sm" onClick={saveProfile}>সংরক্ষণ করুন</button>
              <button className="btn btn-ghost btn-sm" onClick={() => setEditing(false)}>বাতিল</button>
            </div>
          </div>
        )}
      </div>

      <div className="payment-card card">
        <div className="payment-header">
          <div>
            <h2><i className="fa-solid fa-credit-card"></i> পেমেন্ট পদ্ধতি</h2>
            <p>আপনার পছন্দের পেমেন্ট পদ্ধতি নির্বাচন করে বিবরণ দিন।</p>
          </div>
        </div>

        <div className="method-tabs">
          {[
            { key: "bank", label: "ব্যাংক" },
            { key: "bkash", label: "বিকাশ" },
            { key: "nagad", label: "নগদ" },
            { key: "rocket", label: "রকেট" },
          ].map((m) => (
            <button
              key={m.key}
              className={`method-tab ${activeMethod === m.key ? "active" : ""}`}
              onClick={() => { setActiveMethod(m.key); setMethodForm({}); setMethodMsg(null); }}
            >
              {m.label}
            </button>
          ))}
        </div>

        {methodMsg && (
          <div className={`alert-banner ${methodMsg.ok ? "alert-success" : "alert-error"}`}>{methodMsg.text}</div>
        )}

        {activeMethod === "bank" ? (
          <div>
            <div className="field-group"><input className="field-input" placeholder="ব্যাংকের নাম" value={methodForm.bankName || ""} onChange={(e) => setMethodForm({ ...methodForm, bankName: e.target.value })} /></div>
            <div className="field-group"><input className="field-input" placeholder="অ্যাকাউন্ট নম্বর" value={methodForm.accountNumber || ""} onChange={(e) => setMethodForm({ ...methodForm, accountNumber: e.target.value })} /></div>
            <div className="field-group"><input className="field-input" placeholder="রাউটিং নম্বর" value={methodForm.routingNumber || ""} onChange={(e) => setMethodForm({ ...methodForm, routingNumber: e.target.value })} /></div>
          </div>
        ) : (
          <div>
            <div className="field-group"><input className="field-input" placeholder={`${activeMethod} নম্বর`} value={methodForm.mfsNumber || ""} onChange={(e) => setMethodForm({ ...methodForm, mfsNumber: e.target.value })} /></div>
            <div className="field-group"><input type="password" className="field-input" placeholder="পিন" value={methodForm.mfsPin || ""} onChange={(e) => setMethodForm({ ...methodForm, mfsPin: e.target.value })} /></div>
          </div>
        )}
        <button className="btn btn-primary btn-sm" onClick={saveMethod}>সংরক্ষণ করুন</button>

        {savedMethod && (
          <div className="method-list">
            <div className="method-row">
              <span>
                {savedMethod.type === "bank"
                  ? `${savedMethod.bankName || ""} — ${savedMethod.accountNumber || ""}`
                  : `${savedMethod.mfsNumber || ""}`}
              </span>
              <i className="fa-solid fa-circle-check" style={{ color: "var(--success)" }}></i>
            </div>
          </div>
        )}

        <div className="security-note">🔒 সুরক্ষিত ও এনক্রিপ্টেড পেমেন্ট প্রক্রিয়াকরণ</div>
      </div>
    </div>
  );
}
