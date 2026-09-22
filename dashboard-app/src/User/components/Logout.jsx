import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { useAuth } from "../context/AuthContext.jsx";

export default function Logout() {
  const navigate = useNavigate();
  const { logout } = useAuth();

  useEffect(() => {
    logout();
    toast.success("Logged out successfully!");
    const timer = setTimeout(() => navigate("/"), 1200);
    return () => clearTimeout(timer);
  }, [navigate, logout]);

  return (
    <div className="flex flex-1 items-center justify-center py-20 text-muted">
      <Loader2 className="h-5 w-5 animate-spin" />
    </div>
  );
}
