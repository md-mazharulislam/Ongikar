import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import api from "../api/axios";
import "./Settings.css";

export default function Settings() {
  const { user, setUser, logout } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState(user?.email || "");
  const [phone, setPhone] = useState(user?.phone || "");
  const [language, setLanguage] = useState(user?.language || "bn");
  const [channel, setChannel] = useState(user?.notificationChannel || "sms");

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");

  const [msg, setMsg] = useState(null);
  const [pwMsg, setPwMsg] = useState(null);

  const saveGeneral = async () => {
    try {
      const { data } = await api.put("/users/profile", { email, phone });
      await api.put("/users/settings", { language, notificationChannel: channel });
      setUser(data.user);
      setMsg({ ok: true, text: "সেটিংস সংরক্ষণ করা হয়েছে।" });
    } catch (err) {
      setMsg({ ok: false, text: err.response?.data?.message || "ব্যর্থ হয়েছে।" });
    }
  };

  const changePassword = async () => {
    if (!currentPassword || !newPassword) {
      setPwMsg({ ok: false, text: "উভয় ঘর পূরণ করুন।" });
      return;
    }
    try {
      await api.put("/users/settings", { currentPassword, newPassword });
      setPwMsg({ ok: true, text: "পাসওয়ার্ড পরিবর্তন হয়েছে।" });
      setCurrentPassword("");
      setNewPassword("");
    } catch (err) {
      setPwMsg({ ok: false, text: err.response?.data?.message || "ব্যর্থ হয়েছে।" });
    }
  };

  const deactivate = async () => {
    if (!window.confirm("আপনি কি নিশ্চিতভাবে অ্যাকাউন্ট নিষ্ক্রিয় করতে চান?")) return;
    await api.delete("/users/me");
    logout();
    navigate("/login");
  };

  return (
    <div className="page-w">
      <h1 className="page-title">সেটিংস</h1>
      <p className="page-description">আপনার অ্যাকাউন্ট ও পছন্দসমূহ পরিচালনা করুন।</p>

      {msg && <div className={`alert-banner ${msg.ok ? "alert-success" : "alert-error"}`}>{msg.text}</div>}

      <div className="settings-card card">
        <h2>ব্যক্তিগত তথ্য</h2>
        <div className="setting-row">
          <div className="setting-label-wrap">
            <span className="setting-label">ইমেইল ঠিকানা</span>
            <span className="setting-description">লগইন ও রসিদের জন্য ব্যবহৃত হয়</span>
          </div>
          <input className="setting-input" type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
        </div>
        <div className="setting-row">
          <div className="setting-label-wrap">
            <span className="setting-label">ফোন নম্বর</span>
            <span className="setting-description">দুই-স্তর যাচাইকরণের জন্য</span>
          </div>
          <input className="setting-input" value={phone} onChange={(e) => setPhone(e.target.value)} />
        </div>
        <div className="setting-row">
          <div className="setting-label-wrap">
            <span className="setting-label">ভাষা</span>
            <span className="setting-description">আপনার পছন্দের ভাষা নির্বাচন করুন</span>
          </div>
          <select className="setting-input" value={language} onChange={(e) => setLanguage(e.target.value)}>
            <option value="bn">বাংলা</option>
            <option value="en">English</option>
          </select>
        </div>
        <div className="setting-row">
          <div className="setting-label-wrap">
            <span className="setting-label">নোটিফিকেশন চ্যানেল</span>
            <span className="setting-description">যেভাবে আপনি বিজ্ঞপ্তি ও রসিদ পাবেন</span>
          </div>
          <select className="setting-input" value={channel} onChange={(e) => setChannel(e.target.value)}>
            <option value="sms">এসএমএস</option>
            <option value="email">ইমেইল</option>
            <option value="push">পুশ নোটিফিকেশন</option>
          </select>
        </div>
        <button className="btn btn-primary btn-sm mt-2" onClick={saveGeneral}>সংরক্ষণ করুন</button>
      </div>

      <div className="settings-card card">
        <h2>পাসওয়ার্ড পরিবর্তন</h2>
        {pwMsg && <div className={`alert-banner ${pwMsg.ok ? "alert-success" : "alert-error"}`}>{pwMsg.text}</div>}
        <div className="field-group">
          <label className="field-label">বর্তমান পাসওয়ার্ড</label>
          <input type="password" className="field-input" value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} />
        </div>
        <div className="field-group">
          <label className="field-label">নতুন পাসওয়ার্ড</label>
          <input type="password" className="field-input" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} />
        </div>
        <button className="btn btn-primary btn-sm" onClick={changePassword}>পাসওয়ার্ড পরিবর্তন করুন</button>
      </div>

      <div className="settings-card card danger-zone">
        <h2>বিপজ্জনক অঞ্চল</h2>
        <p className="setting-description mb-2">আপনার অ্যাকাউন্ট নিষ্ক্রিয় করা হলে আপনি আর লগইন করতে পারবেন না।</p>
        <button className="btn btn-danger btn-sm" onClick={deactivate}>অ্যাকাউন্ট নিষ্ক্রিয় করুন</button>
      </div>
    </div>
  );
}
