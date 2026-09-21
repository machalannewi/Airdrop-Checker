import { useEffect, useState } from "react";
import { Loader2, CreditCard } from "lucide-react";
import { apiUrl } from "../../config.js";
import { useAuth } from "../context/AuthContext.jsx";

function Payments() {
  const { token } = useAuth();
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchPayments = async () => {
      try {
        const res = await fetch(apiUrl("/api/deposits/user"), {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        setPayments(data.deposits || []);
      } catch (err) {
        console.error("Error fetching payments:", err);
        setError("Couldn't load your payments right now.");
      } finally {
        setLoading(false);
      }
    };

    if (token) fetchPayments();
    else setLoading(false);
  }, [token]);

  return (
    <div>
      <h2 className="text-xl font-medium">Payments</h2>
      <p className="mt-1 text-sm text-muted">Your subscription and deposit history.</p>

      <div className="card mt-6 p-5">
        {loading && (
          <div className="flex items-center justify-center gap-2 py-10 text-muted">
            <Loader2 className="h-4 w-4 animate-spin" /> Loading payments…
          </div>
        )}

        {!loading && error && <p className="py-10 text-center text-red-400">{error}</p>}

        {!loading && !error && payments.length === 0 && (
          <div className="flex flex-col items-center gap-2 py-10 text-muted">
            <CreditCard className="h-6 w-6" />
            <p>No payments yet.</p>
          </div>
        )}

        {!loading && !error && payments.length > 0 && (
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead>
                <tr className="border-b border-ink-700 text-left text-muted">
                  <th className="py-2 font-normal">Amount</th>
                  <th className="py-2 font-normal">Method</th>
                  <th className="py-2 font-normal">Status</th>
                  <th className="py-2 font-normal">Date</th>
                </tr>
              </thead>
              <tbody>
                {payments.map((p) => (
                  <tr key={p._id} className="border-b border-ink-800 hover:bg-ink-800/60">
                    <td className="py-2.5">${p.amount}</td>
                    <td className="py-2.5">{p.paymentMethod}</td>
                    <td
                      className={`py-2.5 ${
                        p.status === "verified" ? "text-emerald-400" : "text-amber-400"
                      }`}
                    >
                      {p.status}
                    </td>
                    <td className="py-2.5">{new Date(p.createdAt).toLocaleDateString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

export default Payments;
