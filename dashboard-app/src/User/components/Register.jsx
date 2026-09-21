import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { Zap, Loader2 } from "lucide-react";
import { apiUrl } from "../../config.js";

const fields = [
  { name: "fullname", label: "Full Name", type: "text" },
  { name: "username", label: "Username", type: "text" },
  { name: "email", label: "Email", type: "email" },
  { name: "password", label: "Password", type: "password" },
];

const Register = () => {
  const [formData, setFormData] = useState({
    fullname: "",
    username: "",
    email: "",
    password: "",
  });
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
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
        toast.error(data.message || "Registration failed");
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

          {fields.map((f) => (
            <label key={f.name} className="mt-4 block text-sm">
              {f.label}
              <input
                type={f.type}
                name={f.name}
                value={formData[f.name]}
                onChange={handleChange}
                required
                className="input-field mt-1.5"
              />
            </label>
          ))}

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
