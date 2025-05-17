   
   import { Copy } from "lucide-react";
   import { useState } from "react";
   
   
   
   function Dashboard() {

    const [copied, setCopied] = useState(false);
    const referralLink = "https://swapex.com/ref?user=12345";
  
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
        <main>
          <h2 className="text-xl font-semibold mb-4">Dashboard</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
            <div className="bg-gray-800 p-5 rounded-2xl shadow-md hover:shadow-lg transition">
                <h3 className="text-sm text-gray-400">Total Deposited</h3>
                <p className="text-2xl font-bold text-green-400 mt-2">$500.00</p>
            </div>

            <div className="bg-gray-800 p-5 rounded-2xl shadow-md hover:shadow-lg transition">
                <h3 className="text-sm text-gray-400">Subscription</h3>
                <p className="text-lg font-semibold text-blue-400 mt-2">Pro Plan</p>
                <p className="text-xs text-gray-500 mt-1">Active</p>
            </div>

            <div className="bg-gray-800 p-5 rounded-2xl shadow-md hover:shadow-lg transition">
                <h3 className="text-sm text-gray-400">Available Airdrops</h3>
                <p className="text-2xl font-bold text-purple-400 mt-2">7</p>
            </div>

            <div className="bg-gray-800 p-5 rounded-2xl shadow-md hover:shadow-lg transition">
                <h3 className="text-sm text-gray-400">Expiry</h3>
                <p className="text-lg font-semibold text-red-400 mt-2">Apr 30, 2025</p>
            </div>
            </div>



            <div className="space-y-8 mt-8">
            {/* Referral Link */}
            <div className="bg-[#1f1f2e] p-5 rounded-xl shadow-md flex justify-between items-center">
                <div>
                <h3 className="text-lg font-semibold mb-1">Your Referral Link</h3>
                <p className="text-sm text-gray-300">{referralLink}</p>
                </div>
                <button
                onClick={handleCopy}
                className="flex items-center gap-2 text-sm bg-[#E07A5F] hover:bg-[#d66c53] px-4 py-2 rounded-md transition-all"
                >
                <Copy className="w-4 h-4" />
                {copied ? "Copied!" : "Copy"}
                </button>
            </div>

            {/* Recent Transactions */}
            <div className="bg-[#1f1f2e] p-5 rounded-xl shadow-md">
                <h3 className="text-lg font-semibold mb-4">Recent Transactions</h3>
                <div className="overflow-x-auto">
                <table className="min-w-full text-sm">
                    <thead>
                    <tr className="text-left text-gray-400 border-b border-gray-700">
                        <th className="py-2">Type</th>
                        <th className="py-2">Amount</th>
                        <th className="py-2">Date</th>
                        <th className="py-2">Status</th>
                    </tr>
                    </thead>
                    <tbody>
                    {transactions.slice(0, 3).map((tx) => (
                        <tr key={tx.id} className="border-b border-gray-800 hover:bg-gray-800">
                        <td className="py-2">{tx.type}</td>
                        <td className="py-2">{tx.amount}</td>
                        <td className="py-2">{tx.date}</td>
                        <td className={`py-2 ${tx.status === "Completed" ? "text-green-400" : "text-yellow-400"}`}>
                            {tx.status}
                        </td>
                        </tr>
                    ))}
                    </tbody>
                </table>
                </div>
            </div>
            </div>

        </main>
    )

   }

   export default Dashboard;