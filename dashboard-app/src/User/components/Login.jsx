import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { Zap, Loader2 } from "lucide-react";
import { apiUrl } from "../../config.js";
import { useAuth } from "../context/AuthContext.jsx";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch(apiUrl("/api/auth/login"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (res.ok) {
        login({ token: data.token, user: data.user, isSubscribed: data.isSubscribed });
        toast.success("Login successful!");
        navigate("/dashboard");
      } else {
        toast.error(data.msg || "Login failed");
      }
    } catch (error) {
      toast.error("Something went wrong. Try again.");
      console.error("Login error:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-hero-radial px-4 text-white">
      <div className="w-full max-w-md">
        <Link to="/" className="mb-8 flex items-center justify-center gap-2 text-lg font-semibold">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand">
            <Zap className="h-4 w-4 text-white" />
          </span>
          Airdox
        </Link>

        <form onSubmit={handleLogin} className="card p-8">
          <h2 className="text-2xl font-medium">Welcome back</h2>
          <p className="mt-1 text-sm text-muted">Log in to access your airdrop dashboard.</p>

          <label className="mt-6 block text-sm">
            Email
            <input
              type="email"
              className="input-field mt-1.5"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </label>

          <label className="mt-4 block text-sm">
            Password
            <input
              type="password"
              className="input-field mt-1.5"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </label>

          <div className="mt-4 flex items-center justify-between text-sm">
            <label className="flex items-center gap-2 text-muted">
              <input type="checkbox" className="accent-brand" />
              Remember me
            </label>
            <a href="#" className="text-brand-light hover:underline">
              Forgot password?
            </a>
          </div>

          <p className="mt-6 text-sm text-muted">
            Don't have an account?{" "}
            <Link to="/register" className="text-brand-light hover:underline">
              Register
            </Link>
          </p>

          <button type="submit" disabled={loading} className="btn-primary mt-6 w-full py-2.5">
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Sign In"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Login;
