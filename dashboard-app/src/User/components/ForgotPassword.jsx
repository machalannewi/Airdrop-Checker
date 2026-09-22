import { useState } from "react";
import { Link } from "react-router-dom";
import { toast } from "sonner";
import { Zap, Loader2, Mail } from "lucide-react";
import { apiUrl } from "../../config.js";

const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch(apiUrl("/api/auth/forgot-password"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const data = await res.json();

      if (res.ok) {
        setSent(true);
      } else {
        toast.error(data.errors?.[0]?.msg || data.msg || "Something went wrong");
      }
    } catch (error) {
      toast.error("Something went wrong. Try again.");
      console.error("Forgot password error:", error);
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

        <div className="card p-8">
          {sent ? (
            <div className="text-center">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-brand-soft">
                <Mail className="h-5 w-5 text-brand-light" />
              </div>
              <h2 className="mt-4 text-2xl font-medium">Check your email</h2>
              <p className="mt-2 text-sm text-muted">
                If an account exists for <span className="text-white">{email}</span>, we've sent a
                link to reset your password. It expires in 1 hour.
              </p>
              <Link to="/login" className="btn-secondary mt-6 w-full">
                Back to login
              </Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit}>
              <h2 className="text-2xl font-medium">Forgot your password?</h2>
              <p className="mt-1 text-sm text-muted">
                Enter your email and we'll send you a link to reset it.
              </p>

              <label className="mt-6 block text-sm">
                Email
                <input
                  type="email"
                  autoComplete="email"
                  className="input-field mt-1.5"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </label>

              <p className="mt-6 text-sm text-muted">
                Remembered it after all?{" "}
                <Link to="/login" className="text-brand-light hover:underline">
                  Back to login
                </Link>
              </p>

              <button type="submit" disabled={loading} className="btn-primary mt-6 w-full py-2.5">
                {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Send reset link"}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;
