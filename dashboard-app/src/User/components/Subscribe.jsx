import { useState } from "react";
import toast from "react-hot-toast";
import { X, Wallet, CreditCard, ArrowLeft, Copy, Loader2, Check } from "lucide-react";
import { apiUrl } from "../../config.js";
import { useAuth } from "../context/AuthContext.jsx";
import SubscriptionStatus from "./SubscriptionStatus.jsx";

export default function Subscribe() {
  const { token, subscribed } = useAuth();
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [showCryptoModal, setShowCryptoModal] = useState(false);
  const [wallets, setWallets] = useState(null);
  const [busy, setBusy] = useState(false);

  const [selectedCurrency, setSelectedCurrency] = useState(null);
  const [depositAmount, setDepositAmount] = useState("");
  const [depositTxHash, setDepositTxHash] = useState("");
  const [submittingDeposit, setSubmittingDeposit] = useState(false);

  const openPaymentModal = () => setShowPaymentModal(true);
  const closeModals = () => {
    setShowPaymentModal(false);
    setShowCryptoModal(false);
    setSelectedCurrency(null);
    setDepositAmount("");
    setDepositTxHash("");
  };

  const handleCryptoSelect = async () => {
    setBusy(true);
    try {
      const res = await fetch(apiUrl("/api/wallets/wallet-addresses"));
      const data = await res.json();
      setWallets(data);
      setSelectedCurrency(Object.keys(data)[0] || null);
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

  const handleSubmitDeposit = async (e) => {
    e.preventDefault();
    if (!selectedCurrency || !wallets) return;

    setSubmittingDeposit(true);
    try {
      const res = await fetch(apiUrl("/api/deposits/submit"), {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          amount: Number(depositAmount),
          currency: selectedCurrency.toUpperCase(),
          walletAddress: wallets[selectedCurrency],
          transactionHash: depositTxHash.trim(),
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        toast.error(data.errors?.[0]?.msg || data.msg || "Couldn't submit deposit");
        return;
      }

      toast.success("Deposit submitted. It'll appear as pending until an admin approves it.");
      closeModals();
    } catch (error) {
      console.error("Deposit submit error:", error);
      toast.error("Something went wrong. Try again.");
    } finally {
      setSubmittingDeposit(false);
    }
  };

  return (
    <div>
      <h2 className="text-xl font-medium">Subscribe</h2>
      <p className="mt-1 text-sm text-muted">
        Unlock the full Pro plan — automated claim reminders, priority support and more.
      </p>

      <div className="mt-6">
        <SubscriptionStatus />
      </div>

      <button onClick={openPaymentModal} className="btn-primary mt-6">
        {subscribed ? "Extend Subscription" : "Subscribe Now"}
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
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4 py-8">
          <div className="card w-full max-w-md max-h-full overflow-y-auto p-6">
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

            <h3 className="mb-3 font-medium">1. Choose a currency and send payment</h3>
            <div className="flex gap-2">
              {Object.keys(wallets).map((coin) => (
                <button
                  key={coin}
                  onClick={() => setSelectedCurrency(coin)}
                  className={`rounded-lg px-3 py-1.5 text-sm font-medium transition-colors ${
                    selectedCurrency === coin
                      ? "bg-brand text-white"
                      : "bg-ink-800 text-muted hover:text-white"
                  }`}
                >
                  {coin.toUpperCase()}
                </button>
              ))}
            </div>

            {selectedCurrency && (
              <div className="mt-3 flex items-center justify-between gap-3 rounded-lg border-b border-ink-700 bg-ink-800 p-3 text-sm">
                <span className="truncate">{wallets[selectedCurrency]}</span>
                <button
                  className="flex flex-shrink-0 items-center gap-1 rounded-md bg-brand px-2 py-1 text-xs"
                  onClick={() => copyToClipboard(wallets[selectedCurrency])}
                >
                  <Copy className="h-3 w-3" /> Copy
                </button>
              </div>
            )}

            <div className="mt-4 rounded-lg bg-ink-800 p-3 text-sm">
              <ol className="ml-5 list-decimal space-y-1 text-muted">
                <li>Send the exact amount to the address above</li>
                <li>Fill in the form below with what you sent</li>
                <li>An admin will verify and approve it — usually within a few minutes</li>
              </ol>
            </div>

            <h3 className="mb-3 mt-5 font-medium">2. Confirm your payment</h3>
            <form onSubmit={handleSubmitDeposit} className="space-y-3">
              <label className="block text-sm">
                Amount sent ({selectedCurrency?.toUpperCase()})
                <input
                  type="number"
                  step="any"
                  min="0"
                  required
                  className="input-field mt-1.5"
                  value={depositAmount}
                  onChange={(e) => setDepositAmount(e.target.value)}
                />
              </label>
              <label className="block text-sm">
                Transaction hash
                <input
                  type="text"
                  required
                  className="input-field mt-1.5"
                  value={depositTxHash}
                  onChange={(e) => setDepositTxHash(e.target.value)}
                  placeholder="0x..."
                />
              </label>
              <button type="submit" disabled={submittingDeposit} className="btn-primary w-full">
                {submittingDeposit ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <>
                    <Check className="h-4 w-4" /> Submit for approval
                  </>
                )}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
