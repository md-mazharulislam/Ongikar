import { useEffect, useState } from "react";
import api from "../api/axios";
import { useAuth } from "../context/AuthContext";
import "./Home.css";

const localImages = import.meta.glob("../assets/images/*", { eager: true, import: "default" });
const imgFor = (name) => {
  const match = Object.entries(localImages).find(([path]) => path.endsWith("/" + name));
  return match ? match[1] : "";
};

export default function Home() {
  const [items, setItems] = useState([]);
  const [qty, setQty] = useState({});
  const [status, setStatus] = useState({});
  const [busy, setBusy] = useState({});
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const { setWallet } = useAuth();

  const loadItems = () => {
    setLoading(true);
    setLoadError("");
    api
      .get("/items")
      .then(({ data }) => setItems(data.items))
      .catch((err) => {
        setLoadError(
          err.response
            ? err.response.data?.message || "আইটেম লোড করা যায়নি।"
            : "সার্ভারের সাথে সংযোগ করা যাচ্ছে না। ব্যাকএন্ড চালু আছে কিনা যাচাই করুন।"
        );
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadItems();
  }, []);

  const handleExchange = async (item) => {
    const quantity = Number(qty[item._id]);
    if (!quantity || quantity <= 0) {
      setStatus((s) => ({ ...s, [item._id]: { ok: false, msg: "সঠিক পরিমাণ দিন।" } }));
      return;
    }
    setBusy((b) => ({ ...b, [item._id]: true }));
    try {
      const { data } = await api.post("/wallet/exchange", { itemId: item._id, quantity });
      setWallet(data.wallet);
      setStatus((s) => ({ ...s, [item._id]: { ok: true, msg: data.message } }));
      setQty((q) => ({ ...q, [item._id]: "" }));
    } catch (err) {
      setStatus((s) => ({
        ...s,
        [item._id]: { ok: false, msg: err.response?.data?.message || "কিছু ভুল হয়েছে।" },
      }));
    } finally {
      setBusy((b) => ({ ...b, [item._id]: false }));
    }
  };

  return (
    <div>
      <div className="home-hero">
        <div className="home-hero-inner">
          <h1>উপকরণ বিনিময় করুন, বদলে নিন নগদ অর্থ</h1>
          <p>
            আপনার সংগ্রহ করা সিগারেটের কাগজ, তামাক, তুলা কিংবা তুলার পুতুল জমা দিন — সাথে সাথে তার
            মূল্য যোগ হয়ে যাবে আপনার অঙ্গীকার ওয়ালেটে।
          </p>
        </div>
      </div>

      <div className="items-section">
        {loadError && (
          <div className="alert-banner alert-error">
            <i className="fa-solid fa-circle-exclamation"></i>
            {loadError}
            <button className="btn btn-sm btn-outline" style={{ marginInlineStart: "auto" }} onClick={loadItems}>
              আবার চেষ্টা করুন
            </button>
          </div>
        )}

        {loading ? (
          <p className="muted text-center">লোড হচ্ছে...</p>
        ) : (
          <div className="items-grid">
            {items.map((item) => (
              <div className="item-card" key={item._id}>
                <div className="item-img-ring">
                  <img src={imgFor(item.image)} alt={item.nameBn} />
                </div>
                <h3>{item.nameBn}</h3>
                <span className="item-stock">চাহিদায় আছে: {item.stock} {item.unit === "kg" ? "কেজি" : "টি"}</span>
                <span className="item-rate">৳{item.ratePerUnitBDT} / {item.unit === "kg" ? "কেজি" : "টি"}</span>

                <div className="item-form">
                  <input
                    type="number"
                    min="0"
                    placeholder={item.unit === "kg" ? "গ্রাম/কেজি" : "সংখ্যা"}
                    value={qty[item._id] || ""}
                    onChange={(e) => setQty((q) => ({ ...q, [item._id]: e.target.value }))}
                  />
                  <button onClick={() => handleExchange(item)} disabled={busy[item._id]}>
                    {busy[item._id] ? "..." : "জমা দিন"}
                  </button>
                </div>
                {status[item._id] && (
                  <div className={`item-result ${status[item._id].ok ? "ok" : "bad"}`}>
                    {status[item._id].msg}
                  </div>
                )}
              </div>
            ))}
            {!loadError && items.length === 0 && (
              <p className="muted">কোনো এক্সচেঞ্জ আইটেম পাওয়া যায়নি। অ্যাডমিন প্যানেল থেকে আইটেম যোগ করুন।</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
