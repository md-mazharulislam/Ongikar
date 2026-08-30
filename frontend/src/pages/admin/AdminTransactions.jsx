import { useEffect, useState } from "react";
import api from "../../api/axios";
import Loader from "../../components/Loader";

const bn = (n) => Number(n || 0).toLocaleString("bn-BD");

const TYPE_LABEL = {
  add_money: "টাকা যোগ",
  send_money: "টাকা পাঠানো",
  receive_money: "টাকা গ্রহণ",
  withdraw: "উত্তোলন",
  payment: "পেমেন্ট",
  donation: "অনুদান",
  savings: "সঞ্চয়",
  investment: "বিনিয়োগ",
  exchange: "বিনিময়",
  reward_earn: "পয়েন্ট অর্জন",
  reward_redeem: "পয়েন্ট রিডিম",
};

export default function AdminTransactions() {
  const [transactions, setTransactions] = useState([]);
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [loading, setLoading] = useState(true);

  const load = async (p = page) => {
    setLoading(true);
    try {
      const { data } = await api.get("/admin/transactions", { params: { page: p, limit: 20 } });
      setTransactions(data.transactions);
      setPages(data.pages || 1);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load(1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div>
      {loading ? (
        <Loader />
      ) : (
        <>
          <div className="admin-table-wrap">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>ব্যবহারকারী</th>
                  <th>ধরন</th>
                  <th>পরিমাণ</th>
                  <th>অবস্থা</th>
                  <th>তারিখ</th>
                </tr>
              </thead>
              <tbody>
                {transactions.map((t) => (
                  <tr key={t._id}>
                    <td>{t.user?.name || "—"} <span className="muted">({t.user?.phone})</span></td>
                    <td>{TYPE_LABEL[t.type] || t.type}</td>
                    <td>{t.currency === "USD" ? "$" : "৳"}{bn(t.amount)}</td>
                    <td>
                      <span className={`badge ${t.status === "completed" ? "badge-active" : "badge-inactive"}`}>
                        {t.status === "completed" ? "সম্পন্ন" : t.status === "pending" ? "অপেক্ষমাণ" : "ব্যর্থ"}
                      </span>
                    </td>
                    <td>{new Date(t.createdAt).toLocaleString("bn-BD")}</td>
                  </tr>
                ))}
                {transactions.length === 0 && (
                  <tr><td colSpan={5} className="text-center muted">কোনো লেনদেন পাওয়া যায়নি।</td></tr>
                )}
              </tbody>
            </table>
          </div>

          {pages > 1 && (
            <div className="pagination">
              <button disabled={page <= 1} onClick={() => { setPage(page - 1); load(page - 1); }}>আগের</button>
              <span className="muted">{bn(page)} / {bn(pages)}</span>
              <button disabled={page >= pages} onClick={() => { setPage(page + 1); load(page + 1); }}>পরের</button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
