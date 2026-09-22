import { useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { toast } from "sonner";
import { Zap, Loader2, ShieldAlert } from "lucide-react";
import { apiUrl } from "../../config.js";
import PasswordInput from "../../components/ui/PasswordInput.jsx";
import { getPasswordError, getPasswordStrength } from "../../lib/validation.js";

const ResetPassword = () => {
  const [searchParams] = useSearchParams();
  const email = searchParams.get("email") || "";
  const token = searchParams.get("token") || "";

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [touched, setTouched] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const passwordError = getPasswordError(password);
  const confirmError = confirmPassword && confirmPassword !== password ? "Passwords don't match" : null;
  const strength = getPasswordStrength(password);

  if (!email || !token) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-hero-radial px-4 text-white">
        <div className="w-full max-w-md text-center">
          <div className="card p-8">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-red-500/10">
              <ShieldAlert className="h-5 w-5 text-red-400" />
            </div>
            <h2 className="mt-4 text-2xl font-medium">Invalid reset link</h2>
            <p className="mt-2 text-sm text-muted">
              This password reset link is missing or malformed. Request a new one below.
            </p>
            <Link to="/forgot-password" className="btn-primary mt-6 w-full">
              Request new link
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setTouched(true);

    if (passwordError || confirmError) {
      toast.error(passwordError || confirmError);
      return;
    }

    setLoading(true);

    try {
      const res = await fetch(apiUrl("/api/auth/reset-password"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, token, password }),
      });

      const data = await res.json();

      if (res.ok) {
        toast.success("Password reset. You can now log in.");
        setTimeout(() => navigate("/login"), 1200);
      } else {
        toast.error(data.errors?.[0]?.msg || data.msg || "Couldn't reset password");
      }
    } catch (error) {
      toast.error("Something went wrong. Try again.");
      console.error("Reset password error:", error);
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

        <form onSubmit={handleSubmit} className="card p-8">
          <h2 className="text-2xl font-medium">Choose a new password</h2>
          <p className="mt-1 text-sm text-muted">Resetting the password for {email}.</p>

          <label className="mt-6 block text-sm">
            New password
            <PasswordInput
              autoComplete="new-password"
              className="mt-1.5"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            {password && <p className="mt-1 text-xs text-muted">Strength: {strength.label}</p>}
            {touched && passwordError && <p className="mt-1 text-xs text-red-400">{passwordError}</p>}
          </label>

          <label className="mt-4 block text-sm">
            Confirm new password
            <PasswordInput
              autoComplete="new-password"
              className="mt-1.5"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
            />
            {touched && confirmError && <p className="mt-1 text-xs text-red-400">{confirmError}</p>}
          </label>

          <button type="submit" disabled={loading} className="btn-primary mt-6 w-full py-2.5">
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Reset password"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default ResetPassword;
