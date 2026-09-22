import { Copy, Check, Wallet, Sparkles, Timer, Receipt, Loader2 } from "lucide-react";
import { useEffect, useState } from "react";
import { apiUrl } from "../../config.js";
import { useAuth } from "../context/AuthContext.jsx";

function StatCard({ icon: Icon, label, value, valueClass = "text-white", sub }) {
  return (
    <div className="card p-5 transition hover:shadow-glow">
      <div className="flex items-center justify-between">
        <h3 className="text-sm text-muted">{label}</h3>
        <Icon className="h-4 w-4 text-brand-light" />
      </div>
      <p className={`mt-2 text-2xl font-semibold ${valueClass}`}>{value}</p>
      {sub && <p className="mt-1 text-xs text-muted">{sub}</p>}
    </div>
  );
}

function Dashboard() {
  const { user, token, subscribed, subscriptionExpiry } = useAuth();
  const [copied, setCopied] = useState(false);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);

  const referralLink = user?.username
    ? `https://airdox.app/ref?user=${user.username}`
    : "https://airdox.app/ref";

  const handleCopy = () => {
    navigator.clipboard.writeText(referralLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  useEffect(() => {
    const fetchTransactions = async () => {
      try {
        const res = await fetch(apiUrl("/api/deposits/user"), {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        setTransactions(data.deposits || []);
      } catch (err) {
        console.error("Error fetching transactions:", err);
      } finally {
        setLoading(false);
      }
    };

    if (token) fetchTransactions();
    else setLoading(false);
  }, [token]);

  const verifiedCount = transactions.filter((t) => t.status === "verified").length;
  const pendingCount = transactions.filter((t) => t.status === "pending").length;
  const recentTransactions = transactions.slice(0, 5);

  const expiryDate = subscriptionExpiry ? new Date(subscriptionExpiry) : null;
  const expiryText =
    expiryDate && !Number.isNaN(expiryDate.getTime())
      ? expiryDate.toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" })
      : "—";

  return (
    <div>
      <h2 className="text-xl font-medium">Dashboard</h2>
      <p className="mt-1 text-sm text-muted">
        Welcome back{user?.username ? `, ${user.username}` : ""}. Here's what's happening with your account.
      </p>

      <div className="mt-6 grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-4">
        <StatCard icon={Wallet} label="Verified Deposits" value={verifiedCount} valueClass="text-brand-light" />
        <StatCard
          icon={Sparkles}
          label="Subscription"
          value="Pro Plan"
          sub={subscribed ? "Active" : "Inactive"}
          valueClass={subscribed ? "text-brand-light" : "text-white"}
        />
        <StatCard icon={Receipt} label="Pending Deposits" value={pendingCount} />
        <StatCard
          icon={Timer}
          label={subscribed ? "Renews On" : "Next Expiry"}
          value={expiryText}
          valueClass="text-red-400"
        />
      </div>

      <div className="mt-8 space-y-8">
        <div className="card flex flex-col items-start justify-between gap-4 p-5 sm:flex-row sm:items-center">
          <div>
            <h3 className="mb-1 text-lg font-medium">Your Referral Link</h3>
            <p className="break-all text-sm text-muted">{referralLink}</p>
          </div>
          <button onClick={handleCopy} className="btn-primary flex-shrink-0">
            {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
            {copied ? "Copied!" : "Copy"}
          </button>
        </div>

        <div className="card p-5">
          <h3 className="mb-4 text-lg font-medium">Recent Transactions</h3>

          {loading && (
            <div className="flex items-center justify-center gap-2 py-8 text-muted">
              <Loader2 className="h-4 w-4 animate-spin" /> Loading…
            </div>
          )}

          {!loading && recentTransactions.length === 0 && (
            <p className="py-8 text-center text-muted">No transactions yet.</p>
          )}

          {!loading && recentTransactions.length > 0 && (
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead>
                  <tr className="border-b border-ink-700 text-left text-muted">
                    <th className="py-2 font-normal">Method</th>
                    <th className="py-2 font-normal">Amount</th>
                    <th className="py-2 font-normal">Date</th>
                    <th className="py-2 font-normal">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {recentTransactions.map((tx) => (
                    <tr key={tx._id} className="border-b border-ink-800 hover:bg-ink-800/60">
                      <td className="py-2">{tx.paymentMethod}</td>
                      <td className="py-2">
                        {tx.amount} {tx.currency || ""}
                      </td>
                      <td className="py-2">{new Date(tx.createdAt).toLocaleDateString()}</td>
                      <td
                        className={`py-2 ${
                          tx.status === "verified" ? "text-emerald-400" : "text-amber-400"
                        }`}
                      >
                        {tx.status}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
