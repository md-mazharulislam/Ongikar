import logo from "../assets/images/ongikar.jpg";
import "./Settings.css";

export default function About() {
  return (
    <div className="page-w">
      <div className="text-center mb-3">
        <div className="auth-logo-ring" style={{ margin: "0 auto 1rem" }}>
          <img src={logo} alt="Ongikar" className="auth-logo-img" />
        </div>
        <h1 className="page-title">আমাদের সম্পর্কে</h1>
        <p className="page-description">"অক্ষুণ্ণ থাকুক মানবতা"</p>
      </div>

      <div className="card mb-3">
        <h2 className="mb-2">অঙ্গীকার কী?</h2>
        <p className="muted" style={{ lineHeight: 1.8 }}>
          অঙ্গীকার একটি কমিউনিটি-চালিত প্ল্যাটফর্ম, যেখানে মানুষ পুনর্ব্যবহারযোগ্য উপকরণ — যেমন সিগারেটের কাগজ,
          তামাক, তুলা ও তুলাজাত পণ্য — জমা দিয়ে সরাসরি তাদের ডিজিটাল ওয়ালেটে নগদ মূল্য পেতে পারেন। এর পাশাপাশি
          আমরা সদস্যদের জন্য একটি সম্পূর্ণ ওয়ালেট ব্যবস্থা দিয়ে থাকি — টাকা পাঠানো, সঞ্চয়, দান ও বিনিয়োগের সুবিধাসহ।
        </p>
      </div>

      <div className="card mb-3">
        <h2 className="mb-2">আমাদের লক্ষ্য</h2>
        <ul style={{ paddingRight: "1rem", lineHeight: 2, color: "var(--ink-soft)" }}>
          <li>পরিবেশ দূষণ ও তামাকজাত বর্জ্য হ্রাস করা</li>
          <li>স্বাস্থ্য সচেতনতা বৃদ্ধি করা</li>
          <li>এতিম ও অসহায় মানুষের পাশে দাঁড়ানো</li>
          <li>একটি স্বচ্ছ ও নিরাপদ ডিজিটাল ওয়ালেট সেবা প্রদান করা</li>
        </ul>
      </div>

      <div className="card">
        <h2 className="mb-2">যোগাযোগ</h2>
        <p className="muted"><i className="fa-solid fa-envelope"></i> support@ongikar.org</p>
        <p className="muted mt-1"><i className="fa-solid fa-phone"></i> +880 1234 567890</p>
      </div>
    </div>
  );
}
