import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { X, Wallet, CreditCard, ArrowLeft, Copy, Loader2 } from "lucide-react";
import { apiUrl } from "../../config.js";
import { useAuth } from "../context/AuthContext.jsx";

export default function Subscribe() {
  const { token, setSubscription } = useAuth();
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [showCryptoModal, setShowCryptoModal] = useState(false);
  const [wallets, setWallets] = useState(null);
  const [busy, setBusy] = useState(false);

  const openPaymentModal = () => setShowPaymentModal(true);
  const closeModals = () => {
    setShowPaymentModal(false);
    setShowCryptoModal(false);
  };

  const handleCryptoSelect = async () => {
    setBusy(true);
    try {
      const res = await fetch(apiUrl("/api/wallets/wallet-addresses"));
      const data = await res.json();
      setWallets(data);
      setShowPaymentModal(false);
      setShowCryptoModal(true);
    } catch (error) {
      toast.error("Failed to fetch wallet addresses");
      console.error(error);
    } finally {
      setBusy(false);
    }
  };

  const handlePaystackSelect = async () => {
    setShowPaymentModal(false);
    setBusy(true);

    try {
      const res = await fetch(apiUrl("/api/paystack/pay"), {
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
    } finally {
      setBusy(false);
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
      setSubscription(true);
    } else if (params.get("success") === "false") {
      toast.error("Payment failed. Try again.");
    }
  }, [setSubscription]);

  return (
    <div>
      <h2 className="text-xl font-medium">Subscribe</h2>
      <p className="mt-1 text-sm text-muted">
        Unlock the full Pro plan — automated claim reminders, priority support and more.
      </p>

      <button onClick={openPaymentModal} className="btn-primary mt-6">
        Subscribe Now
      </button>

      {showPaymentModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4">
          <div className="card w-full max-w-md space-y-4 p-6">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-medium">Choose Payment Method</h2>
              <button onClick={closeModals} className="text-muted hover:text-white">
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="space-y-3">
              <div className="rounded-xl bg-ink-800 p-4 ring-1 ring-inset ring-ink-700">
                <div className="flex items-center gap-2 font-medium">
                  <Wallet className="h-4 w-4 text-brand-light" /> Crypto Payment
                </div>
                <p className="mt-1 text-sm text-muted">Pay with BTC, ETH, or SOL</p>
                <button
                  onClick={handleCryptoSelect}
                  disabled={busy}
                  className="btn-primary mt-3 w-full"
                >
                  {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : "Select"}
                </button>
              </div>
              <div className="rounded-xl bg-ink-800 p-4 ring-1 ring-inset ring-ink-700">
                <div className="flex items-center gap-2 font-medium">
                  <CreditCard className="h-4 w-4 text-brand-light" /> Paystack
                </div>
                <p className="mt-1 text-sm text-muted">Pay via card, bank or transfer</p>
                <button
                  onClick={handlePaystackSelect}
                  disabled={busy}
                  className="btn-primary mt-3 w-full"
                >
                  {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : "Select"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {showCryptoModal && wallets && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4">
          <div className="card w-full max-w-md p-6">
            <div className="mb-4 flex items-center justify-between">
              <button
                onClick={() => {
                  setShowCryptoModal(false);
                  setShowPaymentModal(true);
                }}
                className="flex items-center gap-1 text-sm text-muted hover:text-white"
              >
                <ArrowLeft className="h-4 w-4" /> Back
              </button>
              <button onClick={closeModals} className="text-muted hover:text-white">
                <X className="h-5 w-5" />
              </button>
            </div>
            <h3 className="mb-3 font-medium">Select a wallet to deposit to:</h3>
            <ul className="space-y-3">
              {Object.entries(wallets).map(([coin, address]) => (
                <li
                  key={coin}
                  className="flex items-center justify-between gap-3 border-b border-ink-700 pb-2 text-sm"
                >
                  <span className="truncate">
                    <strong>{coin.toUpperCase()}:</strong> {address}
                  </span>
                  <button
                    className="flex flex-shrink-0 items-center gap-1 rounded-md bg-brand px-2 py-1 text-xs"
                    onClick={() => copyToClipboard(address)}
                  >
                    <Copy className="h-3 w-3" /> Copy
                  </button>
                </li>
              ))}
            </ul>
            <div className="mt-4 rounded-lg bg-ink-800 p-3 text-sm">
              <h4 className="font-medium">Payment Instructions</h4>
              <ol className="ml-5 mt-2 list-decimal space-y-1 text-muted">
                <li>Send the exact amount to the address shown</li>
                <li>Payment will be verified automatically</li>
                <li>This may take a few minutes</li>
              </ol>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
