import { useEffect, useState } from "react";
import toast from "react-hot-toast";

export default function Subscribe() {
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [showCryptoModal, setShowCryptoModal] = useState(false);
  const [wallets, setWallets] = useState(null);

  const openPaymentModal = () => setShowPaymentModal(true);
  const closeModals = () => {
    setShowPaymentModal(false);
    setShowCryptoModal(false);
  };

  const handleCryptoSelect = async () => {
    try {
      const res = await fetch("https://server-4vul.onrender.com/api/wallets/wallet-addresses");
      const data = await res.json();
      setWallets(data);
      setShowPaymentModal(false);
      setShowCryptoModal(true);
    } catch (error) {
      toast.error("Failed to fetch wallet addresses");
      console.error(error);
    }
  };

  const handlePaystackSelect = async () => {
    setShowPaymentModal(false);
    const token = localStorage.getItem("token");
    console.log("Token sent to Paystack route:", token); 

    try {
      const res = await fetch("https://server-4vul.onrender.com/api/paystack/pay", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await res.json();
      if (data.authorization_url) {
        window.location.href = data.authorization_url;
      } else {
        toast.error("Payment initialization failed.");
      }
    } catch (error) {
      console.error("Error starting payment:", error);
      toast.error("An error occurred. Try again.");
    }
  };

  const copyToClipboard = (address) => {
    navigator.clipboard.writeText(address).then(() => {
      toast.success("Copied to clipboard");
    });
  };

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get("success") === "true") {
      toast.success("Subscription successful!");
      localStorage.setItem("subscribed", "true");
    } else if (params.get("success") === "false") {
      toast.error("Payment failed. Try again.");
    }
  }, []);

  return (
    <div className="p-6 text-white">
      <button
        onClick={openPaymentModal}
        className="bg-[#E07A5F] px-6 py-3 rounded-md hover:opacity-90"
      >
        Subscribe Now
      </button>

      {/* Payment Modal */}
      {showPaymentModal && (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50">
          <div className="bg-[#1f1f2e] p-6 rounded-lg w-[90%] max-w-md space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold">Choose Payment Method</h2>
              <button onClick={closeModals} className="text-xl">×</button>
            </div>
            <div className="space-y-4">
              <div className="bg-[#2a2a3d] p-4 rounded">
                <h3 className="font-semibold">Crypto Payment</h3>
                <p className="text-sm">Pay with BTC, ETH, or SOL</p>
                <button
                  onClick={handleCryptoSelect}
                  className="mt-2 px-4 py-2 bg-[#E07A5F] rounded hover:opacity-90"
                >
                  Select
                </button>
              </div>
              <div className="bg-[#2a2a3d] p-4 rounded">
                <h3 className="font-semibold">Paystack</h3>
                <p className="text-sm">Pay via card, bank or transfer</p>
                <button
                  onClick={handlePaystackSelect}
                  className="mt-2 px-4 py-2 bg-[#E07A5F] rounded hover:opacity-90"
                >
                  Select
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Crypto Modal */}
      {showCryptoModal && wallets && (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50">
          <div className="bg-[#1f1f2e] p-6 rounded-lg w-[90%] max-w-md">
            <div className="flex justify-between items-center mb-4">
              <button onClick={() => {
                setShowCryptoModal(false);
                setShowPaymentModal(true);
              }} className="text-sm">&larr; Back</button>
              <button onClick={closeModals} className="text-xl">×</button>
            </div>
            <h3 className="mb-3 font-bold">Select a wallet to deposit to:</h3>
            <ul className="space-y-3">
              {Object.entries(wallets).map(([coin, address]) => (
                <li key={coin} className="flex justify-between items-center border-b border-gray-700 pb-2">
                  <span>
                    <strong>{coin.toUpperCase()}:</strong> {address}
                  </span>
                  <button
                    className="text-xs bg-[#E07A5F] px-2 py-1 rounded"
                    onClick={() => copyToClipboard(address)}
                  >
                    Copy
                  </button>
                </li>
              ))}
            </ul>
            <div className="mt-4 text-sm bg-[#2a2a3d] p-3 rounded">
              <h4 className="font-semibold">Payment Instructions</h4>
              <ol className="list-decimal ml-5 mt-2">
                <li>Send the exact amount to the address shown</li>
                <li>Payment will be verified automatically</li>
                <li>This may take a few minutes</li>
              </ol>
              <div className="mt-4 bg-gray-800 text-center py-6 rounded">
                [QR Code Would Appear Here]
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
