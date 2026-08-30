import { useEffect, useState } from "react";
import api from "../api/axios";
import { useAuth } from "../context/AuthContext";
import "./Wallet.css";

const bn = (n) => Number(n || 0).toLocaleString("bn-BD");

function Modal({ title, icon, onClose, children }) {
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-box" onClick={(e) => e.stopPropagation()}>
        <div className="modal-head">
          <h3><i className={`fa-solid ${icon}`}></i> {title}</h3>
          <button className="modal-close" onClick={onClose}><i className="fa-solid fa-xmark"></i></button>
        </div>
        <div className="modal-body-w">{children}</div>
      </div>
    </div>
  );
}

function ResultBanner({ result }) {
  if (!result) return null;
  return (
    <div className={`alert-banner ${result.ok ? "alert-success" : "alert-error"}`}>
      <i className={`fa-solid ${result.ok ? "fa-circle-check" : "fa-circle-exclamation"}`}></i>
      {result.text}
    </div>
  );
}

const SERVICES = [
  { key: "send", label: "টাকা পাঠান", icon: "fa-paper-plane" },
  { key: "add", label: "টাকা যোগ করুন", icon: "fa-plus" },
  { key: "withdraw", label: "টাকা উত্তোলন", icon: "fa-money-bill-wave" },
  { key: "request", label: "টাকা চান", icon: "fa-hand-holding-dollar" },
  { key: "payment", label: "পেমেন্ট", icon: "fa-bag-shopping" },
  { key: "savings", label: "সঞ্চয়", icon: "fa-piggy-bank" },
  { key: "donation", label: "অনুদান", icon: "fa-handshake-angle" },
  { key: "reward", label: "রিওয়ার্ড পয়েন্ট", icon: "fa-star" },
  { key: "statement", label: "মিনি স্টেটমেন্ট", icon: "fa-file-invoice" },
  { key: "dps", label: "ডিপিএস", icon: "fa-coins" },
  { key: "investment", label: "বিনিয়োগ", icon: "fa-chart-line" },
];

export default function WalletPage() {
  const { wallet, setWallet, user } = useAuth();
  const [showBalance, setShowBalance] = useState(false);
  const [openModal, setOpenModal] = useState(null);

  const closeModal = () => setOpenModal(null);

  return (
    <div className="wallet-wrapper">
      <div className="card-wrap">
        <div className="gold-card">
          <div className="card-logo">অঙ্গীকার ওয়ালেট</div>
          <div className="card-chip"><i className="fa-solid fa-microchip"></i><span>{wallet?.cardTier || "Silver"} কার্ড</span></div>
          <div className="available-balance">
            <span className="balance-label">উপলব্ধ ব্যালেন্স</span>
            <div className="tap-to-view-wrapper" onClick={() => setShowBalance((s) => !s)}>
              {showBalance ? (
                <span>৳ {bn(wallet?.balanceBDT)}</span>
              ) : (
                <>
                  <span className="tap-icon">👁</span>
                  <span className="tap-text">দেখতে ট্যাপ করুন</span>
                </>
              )}
            </div>
          </div>
          <div className="card-bottom">
            <div className="card-number">**** **** **** {wallet?.cardNumberLast4 || "4821"}</div>
            <div className="card-expiry"><span>মেয়াদ</span><span>{wallet?.cardExpiry || "12/35"}</span></div>
            <div className="card-holder">{user?.name?.toUpperCase()}</div>
          </div>
          <div className="card-provider">VISA</div>
        </div>
      </div>

      <div className="services-title"><h2>পেমেন্ট সেবাসমূহ</h2></div>
      <div className="services-grid">
        {SERVICES.map((s) => (
          <button className="service-item" key={s.key} onClick={() => setOpenModal(s.key)}>
            <div className="icon-circle"><i className={`fa-solid ${s.icon}`}></i></div>
            <span className="grid-label">{s.label}</span>
          </button>
        ))}
      </div>

      {openModal === "send" && <SendMoneyModal onClose={closeModal} setWallet={setWallet} />}
      {openModal === "add" && <AddMoneyModal onClose={closeModal} setWallet={setWallet} />}
      {openModal === "withdraw" && <WithdrawModal onClose={closeModal} setWallet={setWallet} />}
      {openModal === "request" && <RequestMoneyModal onClose={closeModal} />}
      {openModal === "payment" && (
        <SimpleAmountModal title="পেমেন্ট" icon="fa-bag-shopping" endpoint="/wallet/payment" onClose={closeModal} setWallet={setWallet} noteLabel="বিবরণ" />
      )}
      {openModal === "savings" && (
        <SimpleAmountModal title="সঞ্চয়" icon="fa-piggy-bank" endpoint="/wallet/savings" onClose={closeModal} setWallet={setWallet} />
      )}
      {openModal === "donation" && <DonationModal onClose={closeModal} setWallet={setWallet} />}
      {openModal === "reward" && <RewardModal onClose={closeModal} wallet={wallet} setWallet={setWallet} />}
      {openModal === "statement" && <StatementModal onClose={closeModal} />}
      {openModal === "dps" && (
        <SimpleAmountModal title="ডিপিএস" icon="fa-coins" endpoint="/wallet/savings" onClose={closeModal} setWallet={setWallet} />
      )}
      {openModal === "investment" && (
        <SimpleAmountModal title="বিনিয়োগ" icon="fa-chart-line" endpoint="/wallet/investment" onClose={closeModal} setWallet={setWallet} noteLabel="খাত" />
      )}
    </div>
  );
}

/* ── Send Money ── */
function SendMoneyModal({ onClose, setWallet }) {
  const [recipientAccountId, setRecipient] = useState("");
  const [amount, setAmount] = useState("");
  const [note, setNote] = useState("");
  const [result, setResult] = useState(null);
  const [busy, setBusy] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setBusy(true);
    try {
      const { data } = await api.post("/wallet/send-money", { recipientAccountId, amount, note });
      setWallet(data.wallet);
      setResult({ ok: true, text: data.message });
    } catch (err) {
      setResult({ ok: false, text: err.response?.data?.message || "ব্যর্থ হয়েছে।" });
    } finally {
      setBusy(false);
    }
  };

  return (
    <Modal title="টাকা পাঠান" icon="fa-paper-plane" onClose={onClose}>
      <ResultBanner result={result} />
      <form onSubmit={submit}>
        <div className="field-group">
          <label className="field-label">প্রাপকের অ্যাকাউন্ট আইডি</label>
          <input className="field-input" placeholder="ID: 624817-738465" value={recipientAccountId} onChange={(e) => setRecipient(e.target.value)} required />
        </div>
        <div className="field-group">
          <label className="field-label">পরিমাণ (৳)</label>
          <input type="number" min="1" step="0.01" className="field-input" placeholder="0.00" value={amount} onChange={(e) => setAmount(e.target.value)} required />
        </div>
        <div className="field-group">
          <label className="field-label">রেফারেন্স (ঐচ্ছিক)</label>
          <input className="field-input" placeholder="নোট যোগ করুন" value={note} onChange={(e) => setNote(e.target.value)} />
        </div>
        <button className="btn btn-primary btn-block" disabled={busy}>{busy ? "পাঠানো হচ্ছে..." : "এখনই পাঠান"}</button>
      </form>
    </Modal>
  );
}

/* ── Add Money ── */
function AddMoneyModal({ onClose, setWallet }) {
  const [amount, setAmount] = useState("");
  const [method, setMethod] = useState("bkash");
  const [result, setResult] = useState(null);
  const [busy, setBusy] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setBusy(true);
    try {
      const { data } = await api.post("/wallet/add-money", { amount, method });
      setWallet(data.wallet);
      setResult({ ok: true, text: data.message });
    } catch (err) {
      setResult({ ok: false, text: err.response?.data?.message || "ব্যর্থ হয়েছে।" });
    } finally {
      setBusy(false);
    }
  };

  return (
    <Modal title="টাকা যোগ করুন" icon="fa-plus" onClose={onClose}>
      <ResultBanner result={result} />
      <form onSubmit={submit}>
        <div className="field-group">
          <label className="field-label">উৎস নির্বাচন করুন</label>
          <div className="method-choice-row">
            {["bkash", "nagad", "rocket", "bank"].map((m) => (
              <div key={m} className={`method-choice ${method === m ? "active" : ""}`} onClick={() => setMethod(m)}>
                {m === "bkash" ? "বিকাশ" : m === "nagad" ? "নগদ" : m === "rocket" ? "রকেট" : "ব্যাংক"}
              </div>
            ))}
          </div>
        </div>
        <div className="field-group">
          <label className="field-label">পরিমাণ (৳)</label>
          <input type="number" min="1" step="0.01" className="field-input" placeholder="0.00" value={amount} onChange={(e) => setAmount(e.target.value)} required />
        </div>
        <button className="btn btn-primary btn-block" disabled={busy}>{busy ? "যোগ হচ্ছে..." : "যোগ করুন"}</button>
      </form>
    </Modal>
  );
}

/* ── Withdraw ── */
function WithdrawModal({ onClose, setWallet }) {
  const [amount, setAmount] = useState("");
  const [method, setMethod] = useState("bank");
  const [result, setResult] = useState(null);
  const [busy, setBusy] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setBusy(true);
    try {
      const { data } = await api.post("/wallet/withdraw", { amount, method });
      setWallet(data.wallet);
      setResult({ ok: true, text: data.message });
    } catch (err) {
      setResult({ ok: false, text: err.response?.data?.message || "ব্যর্থ হয়েছে।" });
    } finally {
      setBusy(false);
    }
  };

  return (
    <Modal title="টাকা উত্তোলন" icon="fa-money-bill-wave" onClose={onClose}>
      <ResultBanner result={result} />
      <form onSubmit={submit}>
        <p className="muted mb-2">আমাদের অ্যাকাউন্ট আইডি: 624817-738465</p>
        <div className="field-group">
          <label className="field-label">পরিমাণ (৳)</label>
          <input type="number" min="1" step="0.01" className="field-input" placeholder="0.00" value={amount} onChange={(e) => setAmount(e.target.value)} required />
        </div>
        <div className="field-group">
          <label className="field-label">আপনি টাকা কীভাবে নিতে চান?</label>
          <div className="method-choice-row">
            {["bank", "bkash", "nagad", "rocket"].map((m) => (
              <div key={m} className={`method-choice ${method === m ? "active" : ""}`} onClick={() => setMethod(m)}>
                {m === "bkash" ? "বিকাশ" : m === "nagad" ? "নগদ" : m === "rocket" ? "রকেট" : "ব্যাংক"}
              </div>
            ))}
          </div>
        </div>
        <button className="btn btn-primary btn-block" disabled={busy}>{busy ? "প্রক্রিয়াধীন..." : "অনুরোধ পাঠান"}</button>
      </form>
    </Modal>
  );
}

/* ── Request Money ── */
function RequestMoneyModal({ onClose }) {
  const [senderAccountId, setSender] = useState("");
  const [amount, setAmount] = useState("");
  const [returnDate, setReturnDate] = useState("");
  const [reference, setReference] = useState("");
  const [result, setResult] = useState(null);
  const [busy, setBusy] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setBusy(true);
    try {
      const { data } = await api.post("/wallet/request-money", { senderAccountId, amount, returnDate, reference });
      setResult({ ok: true, text: data.message });
    } catch (err) {
      setResult({ ok: false, text: err.response?.data?.message || "ব্যর্থ হয়েছে।" });
    } finally {
      setBusy(false);
    }
  };

  return (
    <Modal title="টাকা চান" icon="fa-hand-holding-dollar" onClose={onClose}>
      <ResultBanner result={result} />
      <form onSubmit={submit}>
        <div className="field-group">
          <label className="field-label">প্রেরকের অ্যাকাউন্ট আইডি</label>
          <input className="field-input" placeholder="ID: 624817-738465" value={senderAccountId} onChange={(e) => setSender(e.target.value)} required />
        </div>
        <div className="field-group">
          <label className="field-label">পরিমাণ (৳)</label>
          <input type="number" min="1" step="0.01" className="field-input" value={amount} onChange={(e) => setAmount(e.target.value)} required />
        </div>
        <div className="field-group">
          <label className="field-label">ফেরতের তারিখ</label>
          <input type="date" className="field-input" value={returnDate} onChange={(e) => setReturnDate(e.target.value)} />
        </div>
        <div className="field-group">
          <label className="field-label">রেফারেন্স</label>
          <input className="field-input" placeholder="নোট যোগ করুন" value={reference} onChange={(e) => setReference(e.target.value)} />
        </div>
        <button className="btn btn-primary btn-block" disabled={busy}>{busy ? "পাঠানো হচ্ছে..." : "অনুরোধ পাঠান"}</button>
      </form>
    </Modal>
  );
}

/* ── Donation ── */
function DonationModal({ onClose, setWallet }) {
  const [amount, setAmount] = useState("");
  const [reference, setReference] = useState("");
  const [result, setResult] = useState(null);
  const [busy, setBusy] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setBusy(true);
    try {
      const { data } = await api.post("/wallet/donation", { amount, note: reference });
      setWallet(data.wallet);
      setResult({ ok: true, text: data.message });
    } catch (err) {
      setResult({ ok: false, text: err.response?.data?.message || "ব্যর্থ হয়েছে।" });
    } finally {
      setBusy(false);
    }
  };

  return (
    <Modal title="অনুদান" icon="fa-handshake-angle" onClose={onClose}>
      <ResultBanner result={result} />
      <form onSubmit={submit}>
        <p className="muted mb-2">
          আপনি অঙ্গীকার সংগঠনের মাধ্যমে এতিম ও অসহায় মানুষের পাশে দাঁড়াতে চান — কত টাকা দিতে চাচ্ছেন?
        </p>
        <div className="field-group">
          <label className="field-label">পরিমাণ (৳)</label>
          <input type="number" min="1" step="0.01" className="field-input" value={amount} onChange={(e) => setAmount(e.target.value)} required />
        </div>
        <div className="field-group">
          <label className="field-label">রেফারেন্স</label>
          <input className="field-input" placeholder="নোট যোগ করুন" value={reference} onChange={(e) => setReference(e.target.value)} />
        </div>
        <button className="btn btn-primary btn-block" disabled={busy}>{busy ? "পাঠানো হচ্ছে..." : "দান করুন"}</button>
      </form>
    </Modal>
  );
}

/* ── Generic simple amount modal (payment/savings/investment/dps) ── */
function SimpleAmountModal({ title, icon, endpoint, onClose, setWallet, noteLabel }) {
  const [amount, setAmount] = useState("");
  const [note, setNote] = useState("");
  const [result, setResult] = useState(null);
  const [busy, setBusy] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setBusy(true);
    try {
      const payload = noteLabel ? { amount, note } : { amount };
      const { data } = await api.post(endpoint, payload);
      setWallet(data.wallet);
      setResult({ ok: true, text: data.message });
    } catch (err) {
      setResult({ ok: false, text: err.response?.data?.message || "ব্যর্থ হয়েছে।" });
    } finally {
      setBusy(false);
    }
  };

  return (
    <Modal title={title} icon={icon} onClose={onClose}>
      <ResultBanner result={result} />
      <form onSubmit={submit}>
        <div className="field-group">
          <label className="field-label">পরিমাণ (৳)</label>
          <input type="number" min="1" step="0.01" className="field-input" value={amount} onChange={(e) => setAmount(e.target.value)} required />
        </div>
        {noteLabel && (
          <div className="field-group">
            <label className="field-label">{noteLabel}</label>
            <input className="field-input" value={note} onChange={(e) => setNote(e.target.value)} />
          </div>
        )}
        <button className="btn btn-primary btn-block" disabled={busy}>{busy ? "প্রক্রিয়াধীন..." : "নিশ্চিত করুন"}</button>
      </form>
    </Modal>
  );
}

/* ── Reward points ── */
function RewardModal({ onClose, wallet, setWallet }) {
  const [tab, setTab] = useState("earn");
  const [points, setPoints] = useState("");
  const [result, setResult] = useState(null);
  const [busy, setBusy] = useState(false);

  const redeem = async (e) => {
    e.preventDefault();
    setBusy(true);
    try {
      const { data } = await api.post("/wallet/reward/redeem", { points });
      setWallet(data.wallet);
      setResult({ ok: true, text: data.message });
      setPoints("");
    } catch (err) {
      setResult({ ok: false, text: err.response?.data?.message || "ব্যর্থ হয়েছে।" });
    } finally {
      setBusy(false);
    }
  };

  return (
    <Modal title="রিওয়ার্ড পয়েন্ট" icon="fa-star" onClose={onClose}>
      <div className="reward-banner" style={{ margin: "-1.3rem -1.3rem 1rem" }}>
        <div className="muted" style={{ color: "#cfe0d4" }}>মোট রিওয়ার্ড পয়েন্ট</div>
        <div className="reward-pts">{bn(wallet?.rewardPoints)} <small style={{ fontSize: "0.9rem" }}>pts</small></div>
        <div style={{ color: "#cfe0d4", fontSize: "0.8rem" }}>৳{bn((wallet?.rewardPoints || 0) / 10)} সমমূল্য</div>
        <span className="reward-tier-badge"><i className="fa-solid fa-medal"></i> সিলভার সদস্য</span>
      </div>

      <div className="reward-tabs">
        <button className={`reward-tab ${tab === "earn" ? "active" : ""}`} onClick={() => setTab("earn")}>পয়েন্ট অর্জন</button>
        <button className={`reward-tab ${tab === "redeem" ? "active" : ""}`} onClick={() => setTab("redeem")}>রিডিম করুন</button>
      </div>

      {tab === "earn" ? (
        <ul style={{ listStyle: "none", marginTop: "1rem" }}>
          <li className="tx-row"><span>পেমেন্ট প্রতি ৳৫০০</span><span className="tx-amount-pos">+১০ pt</span></li>
          <li className="tx-row"><span>টাকা পাঠানো প্রতি ৳৫০০</span><span className="tx-amount-pos">+১৫ pt</span></li>
          <li className="tx-row"><span>অনুদান প্রতি ৳১০০</span><span className="tx-amount-pos">+৫ pt</span></li>
          <li className="tx-row"><span>সঞ্চয়/ডিপিএস প্রতি ৳৫০০</span><span className="tx-amount-pos">+১০ pt</span></li>
        </ul>
      ) : (
        <form onSubmit={redeem} className="mt-2">
          <ResultBanner result={result} />
          <div className="field-group">
            <label className="field-label">পয়েন্ট (সর্বনিম্ন ১,০০০)</label>
            <input type="number" min="1000" className="field-input" value={points} onChange={(e) => setPoints(e.target.value)} required />
          </div>
          <p className="muted mb-2">১০ পয়েন্ট = ৳১ ওয়ালেট ব্যালেন্স</p>
          <button className="btn btn-primary btn-block" disabled={busy}>{busy ? "প্রক্রিয়াধীন..." : "রিডিম করুন"}</button>
        </form>
      )}
    </Modal>
  );
}

/* ── Mini statement ── */
function StatementModal({ onClose }) {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get("/wallet/transactions?limit=15").then(({ data }) => setTransactions(data.transactions)).finally(() => setLoading(false));
  }, []);

  const typeLabel = {
    add_money: "টাকা যোগ", send_money: "টাকা পাঠানো", receive_money: "টাকা গ্রহণ",
    withdraw: "উত্তোলন", payment: "পেমেন্ট", donation: "অনুদান", savings: "সঞ্চয়",
    investment: "বিনিয়োগ", exchange: "বিনিময়", reward_earn: "পয়েন্ট অর্জন", reward_redeem: "পয়েন্ট রিডিম",
  };
  const isPositive = (t) =>
    ["add_money", "receive_money", "exchange", "reward_earn", "reward_redeem"].includes(t);

  return (
    <Modal title="মিনি স্টেটমেন্ট" icon="fa-file-invoice" onClose={onClose}>
      {loading && <p className="muted">লোড হচ্ছে...</p>}
      {!loading && transactions.length === 0 && <p className="muted">কোনো লেনদেন পাওয়া যায়নি।</p>}
      {transactions.map((t) => (
        <div className="tx-row" key={t._id}>
          <div>
            <div>{typeLabel[t.type] || t.type}</div>
            <div className="tx-date">{new Date(t.createdAt).toLocaleDateString("bn-BD")}</div>
          </div>
          <span className={isPositive(t.type) ? "tx-amount-pos" : "tx-amount-neg"}>
            {isPositive(t.type) ? "+" : "-"}৳{bn(t.amount)}
          </span>
        </div>
      ))}
    </Modal>
  );
}
