import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";


const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();

    try {
      const res = await fetch("https://server-4vul.onrender.com/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (res.ok) {
        localStorage.setItem("token", data.token);
        localStorage.setItem('user', JSON.stringify(data.user));
        localStorage.setItem("subscribed", data.isSubscribed);
        toast.success("Login successful!");
        // Redirect to dashboard or home page
        setTimeout(() => {
            // navigate("/dashboard");
            navigate('/dashboard', { state: { userName: data.user.username, isSubscribed: data.isSubscribed } });
        }, 2000);
      } else {
        toast.error(data.msg || "Login failed");
      }
    } catch (error) {
      toast.error("Something went wrong. Try again.");
      console.error("Login error:", error);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-900 text-white">
      <form
        onSubmit={handleLogin}
        className="bg-gray-800 p-8 rounded-xl w-full max-w-md shadow-lg"
      >
        <h2 className="text-2xl font-semibold mb-6">Login</h2>

        <label className="block mb-3">
          Email
          <input
            type="email"
            className="w-full mt-1 p-2 bg-gray-700 rounded"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </label>

        <label className="block mb-4">
          Password
          <input
            type="password"
            className="w-full mt-1 p-2 bg-gray-700 rounded"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </label>
        <div className="flex items-center justify-between mb-4">
          <label className="flex items-center">
            <input type="checkbox" className="mr-2" />
            Remember me
          </label>
          <a href="#" className="text-sm text-[#E07A5F] hover:underline">
            Forgot password?
          </a>
        </div>
        <p className="text-sm text-gray-400 mb-4">
          Don't have an account?{" "}
          <a href="register" className="text-[#E07A5F] hover:underline">
            Register
          </a>
        </p>

        <button
          type="submit"
          className="w-full bg-[#E07A5F] hover:bg-[#d86f56] py-2 rounded-md mt-4"
        >
          Sign In
        </button>
      </form>
    </div>
  );
};

export default Login;
