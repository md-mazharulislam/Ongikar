import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import logo from "../assets/images/ongikar.jpg";
import "./Auth.css";

export default function Signup() {
  const [form, setForm] = useState({ name: "", phone: "", email: "", password: "", confirm: "" });
  const [showPass, setShowPass] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [agree, setAgree] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { signup } = useAuth();
  const navigate = useNavigate();

  const update = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    if (!form.name || !form.phone || !form.password) {
      setError("নাম, ফোন নম্বর ও পাসওয়ার্ড আবশ্যক।");
      return;
    }
    if (form.password !== form.confirm) {
      setError("পাসওয়ার্ড দুটি মিলছে না।");
      return;
    }
    if (!agree) {
      setError("চালিয়ে যেতে শর্তাবলীতে সম্মত হতে হবে।");
      return;
    }
    setLoading(true);
    try {
      await signup({ name: form.name, phone: form.phone, email: form.email, password: form.password });
      navigate("/home");
    } catch (err) {
      setError(err.response?.data?.message || "অ্যাকাউন্ট তৈরি ব্যর্থ হয়েছে। আবার চেষ্টা করুন।");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-brand">
          <div className="auth-logo-ring">
            <img src={logo} alt="Ongikar Logo" className="auth-logo-img" />
          </div>
          <h1 className="auth-title">স্বাগতম!</h1>
          <p className="auth-sub">নতুন অ্যাকাউন্ট তৈরি করুন</p>
        </div>

        {error && <div className="alert-banner alert-error"><i className="fa-solid fa-circle-exclamation"></i>{error}</div>}

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="field-group">
            <label className="field-label"><i className="fa-solid fa-user"></i> পুরো নাম</label>
            <input className="field-input" placeholder="আপনার নাম লিখুন" value={form.name} onChange={update("name")} />
          </div>

          <div className="field-group">
            <label className="field-label"><i className="fa-solid fa-phone"></i> ফোন নম্বর</label>
            <input className="field-input" placeholder="+880 1XXX XXXXXX" value={form.phone} onChange={update("phone")} />
          </div>

          <div className="field-group">
            <label className="field-label"><i className="fa-solid fa-envelope"></i> ইমেইল (ঐচ্ছিক)</label>
            <input type="email" className="field-input" placeholder="email@example.com" value={form.email} onChange={update("email")} />
          </div>

          <div className="field-group">
            <label className="field-label"><i className="fa-solid fa-lock"></i> পাসওয়ার্ড</label>
            <div className="input-eye-wrap">
              <button type="button" className="eye-btn" onClick={() => setShowPass((s) => !s)} tabIndex={-1}>
                <i className={`fa-solid ${showPass ? "fa-eye-slash" : "fa-eye"}`}></i>
              </button>
              <input
                type={showPass ? "text" : "password"}
                className="field-input"
                placeholder="পাসওয়ার্ড তৈরি করুন (কমপক্ষে ৬ অক্ষর)"
                value={form.password}
                onChange={update("password")}
              />
            </div>
          </div>

          <div className="field-group">
            <label className="field-label"><i className="fa-solid fa-lock"></i> পাসওয়ার্ড নিশ্চিত করুন</label>
            <div className="input-eye-wrap">
              <button type="button" className="eye-btn" onClick={() => setShowConfirm((s) => !s)} tabIndex={-1}>
                <i className={`fa-solid ${showConfirm ? "fa-eye-slash" : "fa-eye"}`}></i>
              </button>
              <input
                type={showConfirm ? "text" : "password"}
                className="field-input"
                placeholder="পুনরায় পাসওয়ার্ড দিন"
                value={form.confirm}
                onChange={update("confirm")}
              />
            </div>
          </div>

          <label className="terms-check">
            <input type="checkbox" checked={agree} onChange={() => setAgree((a) => !a)} />
            আমি <Link to="/conditions" target="_blank">শর্তাবলী</Link> পড়েছি এবং সম্মত আছি
          </label>

          <button className="btn btn-primary btn-block" type="submit" disabled={loading}>
            {loading ? <><i className="fa-solid fa-circle-notch fa-spin"></i> তৈরি হচ্ছে...</> : "অ্যাকাউন্ট তৈরি করুন"}
          </button>

          <div className="auth-divider"><span>অথবা</span></div>

          <button type="button" className="btn google-btn btn-block">
            <i className="fa-brands fa-google"></i> Google অ্যাকাউন্ট দিয়ে সাইনআপ করুন
          </button>

          <p className="auth-switch">ইতিমধ্যে অ্যাকাউন্ট আছে? <Link to="/login">লগইন করুন</Link></p>
        </form>
      </div>
      <p className="auth-footer-tag">"অক্ষুণ্ণ থাকুক মানবতা"</p>
    </div>
  );
}
