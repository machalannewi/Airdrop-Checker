import { Copy, Check, Wallet, Sparkles, Timer, TrendingUp } from "lucide-react";
import { useState } from "react";
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
  const { user, subscribed } = useAuth();
  const [copied, setCopied] = useState(false);

  const referralLink = user?.username
    ? `https://airdox.app/ref?user=${user.username}`
    : "https://airdox.app/ref";

  const handleCopy = () => {
    navigator.clipboard.writeText(referralLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  const transactions = [
    { id: 1, type: "Deposit", amount: "$150", date: "2025-04-13", status: "Completed" },
    { id: 2, type: "Airdrop", amount: "$30", date: "2025-04-11", status: "Pending" },
    { id: 3, type: "Subscription", amount: "$50", date: "2025-04-08", status: "Completed" },
  ];

  return (
    <div>
      <h2 className="text-xl font-medium">Dashboard</h2>
      <p className="mt-1 text-sm text-muted">
        Welcome back{user?.username ? `, ${user.username}` : ""}. Here's what's happening with your account.
      </p>

      <div className="mt-6 grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-4">
        <StatCard icon={Wallet} label="Total Deposited" value="$500.00" valueClass="text-brand-light" />
        <StatCard
          icon={Sparkles}
          label="Subscription"
          value="Pro Plan"
          sub={subscribed ? "Active" : "Inactive"}
          valueClass={subscribed ? "text-brand-light" : "text-white"}
        />
        <StatCard icon={TrendingUp} label="Available Airdrops" value="7" />
        <StatCard icon={Timer} label="Next Expiry" value="Apr 30, 2025" valueClass="text-red-400" />
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
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead>
                <tr className="border-b border-ink-700 text-left text-muted">
                  <th className="py-2 font-normal">Type</th>
                  <th className="py-2 font-normal">Amount</th>
                  <th className="py-2 font-normal">Date</th>
                  <th className="py-2 font-normal">Status</th>
                </tr>
              </thead>
              <tbody>
                {transactions.map((tx) => (
                  <tr key={tx.id} className="border-b border-ink-800 hover:bg-ink-800/60">
                    <td className="py-2.5">{tx.type}</td>
                    <td className="py-2.5">{tx.amount}</td>
                    <td className="py-2.5">{tx.date}</td>
                    <td
                      className={`py-2.5 ${
                        tx.status === "Completed" ? "text-emerald-400" : "text-amber-400"
                      }`}
                    >
                      {tx.status}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
