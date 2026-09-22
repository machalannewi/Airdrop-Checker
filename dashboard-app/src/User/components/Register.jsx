import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { Zap, Loader2 } from "lucide-react";
import { apiUrl } from "../../config.js";
import PasswordInput from "../../components/ui/PasswordInput.jsx";
import { getPasswordError, getPasswordStrength } from "../../lib/validation.js";

const textFields = [
  { name: "fullname", label: "Full Name", type: "text", autoComplete: "name" },
  { name: "username", label: "Username", type: "text", autoComplete: "username" },
  { name: "email", label: "Email", type: "email", autoComplete: "email" },
];

const Register = () => {
  const [formData, setFormData] = useState({
    fullname: "",
    username: "",
    email: "",
    password: "",
  });
  const [confirmPassword, setConfirmPassword] = useState("");
  const [touched, setTouched] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  const passwordError = getPasswordError(formData.password);
  const confirmError =
    confirmPassword && confirmPassword !== formData.password ? "Passwords don't match" : null;
  const strength = getPasswordStrength(formData.password);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setTouched(true);

    if (passwordError || confirmError) {
      toast.error(passwordError || confirmError);
      return;
    }

    setLoading(true);

    try {
      const res = await fetch(apiUrl("/api/auth/signup"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (res.ok) {
        toast.success("Registration successful. You can now log in.");
        setTimeout(() => navigate("/login"), 1500);
      } else {
        toast.error(data.errors?.[0]?.msg || data.msg || "Registration failed");
      }
    } catch (err) {
      toast.error("Server error. Please try again.");
      console.error("Register error:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-hero-radial px-4 py-10 text-white">
      <div className="w-full max-w-md">
        <Link to="/" className="mb-8 flex items-center justify-center gap-2 text-lg font-semibold">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand">
            <Zap className="h-4 w-4 text-white" />
          </span>
          Airdox
        </Link>

        <form onSubmit={handleSubmit} className="card p-8">
          <h2 className="text-2xl font-medium">Create an account</h2>
          <p className="mt-1 text-sm text-muted">
            Start discovering airdrops built for you.
          </p>

          {textFields.map((f) => (
            <label key={f.name} className="mt-4 block text-sm">
              {f.label}
              <input
                type={f.type}
                name={f.name}
                autoComplete={f.autoComplete}
                value={formData[f.name]}
                onChange={handleChange}
                required
                className="input-field mt-1.5"
              />
            </label>
          ))}

          <label className="mt-4 block text-sm">
            Password
            <PasswordInput
              name="password"
              autoComplete="new-password"
              className="mt-1.5"
              value={formData.password}
              onChange={handleChange}
              required
            />
            {formData.password && (
              <p className="mt-1 text-xs text-muted">Strength: {strength.label}</p>
            )}
            {touched && passwordError && (
              <p className="mt-1 text-xs text-red-400">{passwordError}</p>
            )}
          </label>

          <label className="mt-4 block text-sm">
            Confirm Password
            <PasswordInput
              autoComplete="new-password"
              className="mt-1.5"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
            />
            {touched && confirmError && (
              <p className="mt-1 text-xs text-red-400">{confirmError}</p>
            )}
          </label>

          <p className="mt-6 text-sm text-muted">
            Already have an account?{" "}
            <Link to="/login" className="text-brand-light hover:underline">
              Login
            </Link>
          </p>

          <button type="submit" disabled={loading} className="btn-primary mt-6 w-full py-2.5">
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Register"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Register;
