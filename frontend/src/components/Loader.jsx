import "./Loader.css";

export default function Loader({ label = "লোড হচ্ছে..." }) {
  return (
    <div className="loader-wrap">
      <div className="loader-seal seal">
        <i className="fas fa-infinity"></i>
      </div>
      <p className="muted">{label}</p>
    </div>
  );
}
