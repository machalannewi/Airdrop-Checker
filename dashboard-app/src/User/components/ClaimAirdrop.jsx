

// function ClaimAirdrop() {
//   return (
//     <div className="claim-airdrop">
//       <h2>Claim Airdrop</h2>
//       <p>Congratulations! You are eligible for an airdrop.</p>
//       <button className="claim-button">Claim Now</button>
//     </div>
//   );
// }
// export default ClaimAirdrop;



import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

const ClaimAirdrop = () => {
  const [airdrops, setAirdrops] = useState([]);
  const [countdowns, setCountdowns] = useState({});
  const [loading, setLoading] = useState(false);
  const [subscribed, setSubscribed] = useState(null);
  const navigate = useNavigate();

  const handleViewAirdrops = async () => {
    const token = localStorage.getItem("token");

    if (!token) {
      alert("You need to login first.");
      navigate("/login");
      return;
    }

    try {
      setLoading(true);
      const res = await fetch("https://server-4vul.onrender.com/api/users/status", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();

      if (!data.subscribed) {
        setSubscribed(false);
        return;
      }

      setSubscribed(true);
      localStorage.setItem("subscribed", "true");
      fetchAirdrops(token);
    } catch (error) {
      console.error("Error checking subscription:", error);
      setSubscribed(false);
    } finally {
      setLoading(false);
    }
  };

  const fetchAirdrops = async (token) => {
    try {
      const res = await fetch("https://server-4vul.onrender.com/api/airdrops", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();

      if (!data || data.length === 0) {
        setAirdrops([]);
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
    }
  };

  useEffect(() => {
    if (airdrops.length === 0) return;

    const interval = setInterval(() => {
      setCountdowns((prev) => {
        const updated = { ...prev };
        Object.keys(updated).forEach((key) => {
          if (updated[key] > 0) {
            updated[key]--;
          }
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

    return `${months}mo : ${days}d : ${String(hours).padStart(2, '0')}h : ${String(minutes).padStart(2, '0')}m : ${String(seconds).padStart(2, '0')}s`;
  };

  return (
    <div className="p-4 min-h-screen bg-gray-950 text-white">
      <button
        className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        onClick={handleViewAirdrops}
      >
        View Airdrop
      </button>

      <h1 className="text-2xl font-bold my-4">Latest Airdrops</h1>

      {subscribed === false && (
        <p className="text-red-500">You need to subscribe to access airdrops.</p>
      )}

      {subscribed && airdrops.length === 0 && (
        <p>Fetching latest airdrops...</p>
      )}

      {!loading && subscribed && airdrops.length < 0 && (
        <p>No airdrops available.</p>
      )}


      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {airdrops.map((airdrop, index) => (
          <div
            key={index}
            className="bg-gray-900 p-4 rounded shadow hover:shadow-lg transition duration-300"
          >
            <img
              className="rounded-lg w-full h-40 object-cover"
              src={airdrop.image}
              alt={airdrop.imageAlt}
            />

            <div className="mt-2 font-mono text-sm text-green-400">
              {countdowns[index] > 0
                ? formatTime(countdowns[index])
                : "Expired"}
            </div>

            <h3 className="font-bold text-xl mt-2">{airdrop.title}</h3>
            <p className="text-sm text-gray-300">
              Reward: {airdrop.amount} {airdrop.currency}
            </p>

            <a
              href={airdrop.link}
              target="_blank"
              rel="noopener noreferrer"
              className="bg-[#E07A5F] px-3 py-2 rounded-lg mt-3 block text-center text-white hover:bg-[#d86f56] transition duration-200 ease-in-out"
            >
              Claim Airdrop
            </a>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ClaimAirdrop;

