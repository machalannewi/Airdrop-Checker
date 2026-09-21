import { useEffect, useState } from "react";
import { Loader2, Receipt } from "lucide-react";
import { apiUrl } from "../../config.js";
import { useAuth } from "../context/AuthContext.jsx";

const TransactionList = () => {
  const { token } = useAuth();
  const [deposits, setDeposits] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDeposits = async () => {
      try {
        const res = await fetch(apiUrl("/api/deposits/user"), {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });

        const data = await res.json();
        setDeposits(data.deposits || []);
      } catch (err) {
        console.error("Error fetching deposits:", err);
        setDeposits([]);
      } finally {
        setLoading(false);
      }
    };

    if (token) fetchDeposits();
    else setLoading(false);
  }, [token]);

  return (
    <div>
      <h2 className="text-xl font-medium">Transactions</h2>
      <p className="mt-1 text-sm text-muted">All of your deposits in one place.</p>

      {loading && (
        <div className="mt-10 flex items-center justify-center gap-2 text-muted">
          <Loader2 className="h-4 w-4 animate-spin" /> Loading deposits…
        </div>
      )}

      {!loading && deposits.length === 0 && (
        <div className="mt-10 flex flex-col items-center gap-2 text-muted">
          <Receipt className="h-6 w-6" />
          <p>No deposits yet.</p>
        </div>
      )}

      {!loading && deposits.length > 0 && (
        <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {deposits.map((deposit) => (
            <div key={deposit._id} className="card p-4">
              <p className="text-sm text-muted">Amount</p>
              <p className="text-lg font-semibold">${deposit.amount}</p>
              <p className="mt-2 text-sm text-muted">Currency</p>
              <p className="text-sm">{deposit.paymentMethod}</p>
              <div className="mt-3 flex items-center justify-between">
                <span
                  className={`rounded-full px-2 py-1 text-xs font-medium ${
                    deposit.status === "verified"
                      ? "bg-emerald-500/15 text-emerald-400"
                      : "bg-amber-500/15 text-amber-400"
                  }`}
                >
                  {deposit.status}
                </span>
                <span className="text-xs text-muted">
                  {new Date(deposit.createdAt).toLocaleDateString()}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default TransactionList;
