import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import logo from "../assets/images/ongikar.jpg";
import "./Auth.css";

export default function Login() {
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [remember, setRemember] = useState(true);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    if (!phone || !password) {
      setError("ফোন নম্বর ও পাসওয়ার্ড দিন।");
      return;
    }
    setLoading(true);
    try {
      await login(phone, password);
      navigate("/home");
    } catch (err) {
      setError(err.response?.data?.message || "লগইন ব্যর্থ হয়েছে। আবার চেষ্টা করুন।");
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
          <p className="auth-sub">আপনার অ্যাকাউন্টে লগইন করুন</p>
        </div>

        {error && <div className="alert-banner alert-error"><i className="fa-solid fa-circle-exclamation"></i>{error}</div>}

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="field-group">
            <label className="field-label"><i className="fa-solid fa-phone"></i> ফোন নম্বর</label>
            <input
              type="tel"
              className="field-input"
              placeholder="+880 1XXX XXXXXX"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
            />
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
                placeholder="পাসওয়ার্ড দিন"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          </div>

          <div className="auth-options">
            <label className="remember-me">
              <input type="checkbox" checked={remember} onChange={() => setRemember((r) => !r)} /> মনে রাখুন
            </label>
            <a href="#!" className="forgot-link">পাসওয়ার্ড ভুলে গেছেন?</a>
          </div>

          <button className="btn btn-primary btn-block" type="submit" disabled={loading}>
            {loading ? <><i className="fa-solid fa-circle-notch fa-spin"></i> লগইন হচ্ছে...</> : "লগইন করুন"}
          </button>

          <div className="auth-divider"><span>অথবা</span></div>

          <button type="button" className="btn google-btn btn-block">
            <i className="fa-brands fa-google"></i> Google অ্যাকাউন্ট দিয়ে লগইন করুন
          </button>

          <p className="auth-switch">
            অ্যাকাউন্ট নেই? <Link to="/signup">নতুন অ্যাকাউন্ট তৈরি করুন</Link>
          </p>
        </form>
      </div>
      <p className="auth-footer-tag">"অক্ষুণ্ণ থাকুক মানবতা"</p>
    </div>
  );
}
