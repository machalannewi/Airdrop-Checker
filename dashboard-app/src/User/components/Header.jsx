import { useState } from "react";
import { Menu, LogOut, User } from "lucide-react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import Dashboard from "./Dashboard.jsx";
import Subscribe from "./Subscribe.jsx";
import Payments from "./Payments.jsx";
import Transactions from "./Transactions.jsx";
import ClaimAirdrop from "./ClaimAirdrop.jsx";
import Logout from "./Logout.jsx";
import { useLocation } from 'react-router-dom';






const SidebarLinks = [
  { name: "Dashboard", href: "#" },
  { name: "Subscribe", href: "#" },
  { name: "View Airdrop", href: "#" },
  { name: "Payments", href: "#" },
  { name: "Transactions", href: "#" },
  { name: "Logout" },
];



export default function UserDashboardLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeLink, setActiveLink] = useState("Dashboard");
  const location = useLocation();
  const userName = location.state?.userName || 'Guest';


  const handleLinkClick = (name) => {
    setActiveLink(name);
    setSidebarOpen(false); // close on mobile
  };

  const navigate = useNavigate();

const handleLogout = () => {
  // Clear authentication data (adjust if needed)
  localStorage.removeItem("token");
  localStorage.removeItem("subscribed");

  toast.success("Logged out successfully!");

  // Redirect to login page
  setTimeout(() => {
  navigate("/");
  }, 2000);
};

  

  return (
    <div className="flex h-screen bg-radial-dark text-white">
      {/* Sidebar for desktop */}
      <aside className="hidden md:flex flex-col w-64 bg-radial-dark p-5 shadow-lg">
        <h1 className="text-2xl font-bold mb-10">SwapEX</h1>
        <nav className="flex flex-col gap-3">
          {SidebarLinks.map((link) => (
            <a
              key={link.name}
              href={link.href}
              onClick={() => handleLinkClick(link.name)}
              className={`rounded-lg px-4 py-2 transition-colors duration-200 ${
                activeLink === link.name ? "bg-[#E07A5F]" : "hover:bg-[#E07A5F]"
              }`}
            >
              {link.name}
            </a>
          ))}
        </nav>
      </aside>

      {/* Sidebar for mobile with animation */}
      {sidebarOpen && (
        <motion.aside
          initial={{ x: "-100%" }}
          animate={{ x: 0 }}
          exit={{ x: "-100%" }}
          transition={{ duration: 0.3 }}
          className="fixed md:hidden z-40 top-0 left-0 h-full w-64 bg-radial-dark shadow-lg p-5"
        >
          <div className="flex items-center justify-between mb-10">
            <h1 className="text-2xl font-bold">SwapEX</h1>
            <button
              className="text-gray-400 hover:text-white"
              onClick={() => setSidebarOpen(false)}
            >
              ✕
            </button>
          </div>
          <nav className="flex flex-col gap-3">
            {SidebarLinks.map((link) => (
              <a
                key={link.name}
                href={link.href}
                onClick={() => handleLinkClick(link.name)}
                className={`rounded-lg px-4 py-2 transition-colors duration-200 ${
                  activeLink === link.name
                    ? "bg-[#E07A5F]"
                    : "hover:bg-[#E07A5F]"
                }`}
              >
                {link.name}
              </a>
            ))}
          </nav>
        </motion.aside>
      )}

      {/* Overlay for mobile */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-30 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Main content */}
      <div className="flex-1 flex flex-col">
        {/* Top Navbar */}
        <header className="flex justify-between items-center bg-[#1f1f2e] p-4 shadow-md">
          <div className="flex items-center gap-4">
            <button
              className="md:hidden text-gray-400 hover:text-white"
              onClick={() => setSidebarOpen(true)}
            >
              <Menu />
            </button>
            <div className="hidden md:flex items-center gap-2">
              <User className="w-5 h-5" />
              <span className="text-sm">Hi, {userName}</span>
            </div>
          </div>

          <button onClick={handleLogout}
          className="text-sm bg-[#E07A5F] hover:bg-[#E07A5F] px-4 py-2 rounded-md flex items-center gap-2 logout">
            <LogOut className="w-4 h-4" /> Logout
          </button>
        </header>
        

          {/* Conditionally Render Pages */}
        <main className="flex-1 p-6 overflow-y-auto">
          {activeLink === "Dashboard" && <Dashboard />}
          {activeLink === "Subscribe" && <Subscribe />}
          {activeLink === "View Airdrop" && <ClaimAirdrop />}
          {activeLink === "Payments" && <Payments />}
          {activeLink === "Transactions" && <Transactions />}
          {activeLink === "Logout" && <Logout/>}

        </main>

      </div>
    </div>
  );
}
