import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

export default function Logout() {
  const navigate = useNavigate();

  useEffect(() => {
    // Clear all relevant data
    localStorage.removeItem("token");
    localStorage.removeItem("subscribed"); // if you use this

    toast.success("Logged out successfully!");

    // Redirect to login
    setTimeout(() => {
      navigate("/");
    }, 2000);
  }, [navigate]);

  return null; // or a spinner/loading screen if you want
}
