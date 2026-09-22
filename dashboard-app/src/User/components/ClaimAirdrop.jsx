import { useEffect, useState, useCallback } from "react";
import { toast } from "sonner";
import { Loader2, Gift, Lock, AlertTriangle } from "lucide-react";
import { apiUrl } from "../../config.js";
import { useAuth } from "../context/AuthContext.jsx";

const ClaimAirdrop = () => {
  const { token, subscribed, setSubscription } = useAuth();
  const [airdrops, setAirdrops] = useState([]);
  const [countdowns, setCountdowns] = useState({});
  const [loading, setLoading] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const [loadError, setLoadError] = useState(null);

  const fetchAirdrops = useCallback(async () => {
    setLoadError(null);

    try {
      const res = await fetch(apiUrl("/api/airdrops"), {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();

      if (!res.ok || !Array.isArray(data)) {
        setAirdrops([]);
        setLoadError(data?.error || "Couldn't fetch the latest airdrops. Try again shortly.");
        return;
      }

      setAirdrops(data);

      const initialCountdowns = {};
      data.forEach((drop, index) => {
        if (drop.expiry) {
          const secondsLeft = Math.max(
            Math.floor((new Date(drop.expiry).getTime() - Date.now()) / 1000),
            0
          );
          initialCountdowns[index] = secondsLeft;
        } else {
          initialCountdowns[index] = parseInt(drop.timerSeconds) || 0;
        }
      });

      setCountdowns(initialCountdowns);
    } catch (error) {
      console.error("Error fetching airdrops:", error);
      setAirdrops([]);
      setLoadError("Couldn't fetch the latest airdrops. Try again shortly.");
    }
  }, [token]);

  const handleViewAirdrops = useCallback(async () => {
    if (!token) return;

    try {
      setLoading(true);
      const res = await fetch(apiUrl("/api/users/status"), {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();

      setSubscription(Boolean(data.subscribed), data.subscriptionExpiry);
      if (data.subscribed) await fetchAirdrops();
    } catch (error) {
      console.error("Error checking subscription:", error);
      toast.error("Couldn't check your subscription status.");
      setSubscription(false);
    } finally {
      setLoading(false);
      setLoaded(true);
    }
  }, [token, fetchAirdrops, setSubscription]);

  useEffect(() => {
    handleViewAirdrops();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (airdrops.length === 0) return;

    const interval = setInterval(() => {
      setCountdowns((prev) => {
        const updated = { ...prev };
        Object.keys(updated).forEach((key) => {
          if (updated[key] > 0) updated[key]--;
        });
        return updated;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [airdrops]);

  const formatTime = (totalSeconds) => {
    const months = Math.floor(totalSeconds / (30 * 24 * 60 * 60));
    const days = Math.floor((totalSeconds % (30 * 24 * 60 * 60)) / (24 * 60 * 60));
    const hours = Math.floor((totalSeconds % (24 * 60 * 60)) / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;

    return `${months}mo : ${days}d : ${String(hours).padStart(2, "0")}h : ${String(
      minutes
    ).padStart(2, "0")}m : ${String(seconds).padStart(2, "0")}s`;
  };

  return (
    <div>
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-medium">Latest Airdrops</h2>
          <p className="mt-1 text-sm text-muted">Live opportunities available to claim right now.</p>
        </div>
        <button className="btn-secondary text-sm" onClick={handleViewAirdrops} disabled={loading}>
          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Gift className="h-4 w-4" />}
          Refresh
        </button>
      </div>

      {loaded && subscribed === false && (
        <div className="card mt-6 flex flex-col items-center gap-2 p-10 text-center">
          <Lock className="h-6 w-6 text-brand-light" />
          <p className="text-white">You need to subscribe to access airdrops.</p>
          <p className="text-sm text-muted">Head to the Subscribe tab to unlock full access.</p>
        </div>
      )}

      {loading && (
        <div className="mt-10 flex items-center justify-center gap-2 text-muted">
          <Loader2 className="h-4 w-4 animate-spin" /> Fetching latest airdrops…
        </div>
      )}

      {!loading && subscribed && loadError && (
        <div className="card mt-6 flex flex-col items-center gap-2 p-10 text-center">
          <AlertTriangle className="h-6 w-6 text-amber-400" />
          <p className="text-white">{loadError}</p>
          <button onClick={fetchAirdrops} className="btn-secondary mt-2 text-sm">
            Try again
          </button>
        </div>
      )}

      {!loading && subscribed && loaded && !loadError && airdrops.length === 0 && (
        <p className="mt-10 text-center text-muted">No airdrops available right now.</p>
      )}

      {!loading && airdrops.length > 0 && (
        <div className="mt-6 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {airdrops.map((airdrop, index) => (
            <div key={index} className="card overflow-hidden p-4 transition hover:shadow-glow">
              <img
                className="h-40 w-full rounded-xl object-cover"
                src={airdrop.image}
                alt={airdrop.imageAlt || airdrop.title}
              />

              <div className="mt-3 font-mono text-sm text-brand-light">
                {countdowns[index] > 0 ? formatTime(countdowns[index]) : "Expired"}
              </div>

              <h3 className="mt-2 text-lg font-medium">{airdrop.title}</h3>
              <p className="text-sm text-muted">
                Reward: {airdrop.amount} {airdrop.currency}
              </p>

              <a
                href={airdrop.link}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-primary mt-4 w-full"
              >
                Claim Airdrop
              </a>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ClaimAirdrop;
