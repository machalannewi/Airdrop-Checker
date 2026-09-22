import { useEffect, useState } from "react";
import {
  Menu,
  LogOut,
  User,
  X,
  Zap,
  LayoutDashboard,
  CreditCard,
  Gift,
  Receipt,
  ChevronsLeft,
  ChevronsRight,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate, useSearchParams } from "react-router-dom";
import { toast } from "sonner";
import Dashboard from "./Dashboard.jsx";
import Subscribe from "./Subscribe.jsx";
import Payments from "./Payments.jsx";
import Transactions from "./Transactions.jsx";
import ClaimAirdrop from "./ClaimAirdrop.jsx";
import { useAuth } from "../context/AuthContext.jsx";
import { cn } from "../../lib/utils.js";

const SidebarLinks = [
  { name: "Dashboard", icon: LayoutDashboard },
  { name: "Subscribe", icon: CreditCard },
  { name: "View Airdrop", icon: Gift },
  { name: "Payments", icon: CreditCard },
  { name: "Transactions", icon: Receipt },
];

export default function UserDashboardLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(
    () => localStorage.getItem("sidebarCollapsed") === "true"
  );
  const [activeLink, setActiveLink] = useState("Dashboard");
  const { user, logout, refreshSubscription } = useAuth();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  useEffect(() => {
    localStorage.setItem("sidebarCollapsed", String(collapsed));
  }, [collapsed]);

  // Always get a fresh subscription status on load, instead of trusting
  // whatever was last cached locally.
  useEffect(() => {
    refreshSubscription();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Paystack redirects back to /dashboard?success=true|false, not to any
  // specific tab, so this has to be handled at the shell level — a
  // useEffect inside the Subscribe component alone would never run unless
  // the user happened to already be on that tab.
  useEffect(() => {
    const success = searchParams.get("success");
    if (!success) return;

    if (success === "true") {
      toast.success("Payment successful! Your subscription is now active.");
      refreshSubscription();
    } else {
      const reason = searchParams.get("reason");
      toast.error(reason === "payment_failed" ? "Payment failed. Please try again." : "Something went wrong with your payment.");
    }

    setActiveLink("Subscribe");
    setSearchParams({}, { replace: true });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams]);

  const handleLinkClick = (name) => {
    setActiveLink(name);
    setSidebarOpen(false);
  };

  const handleLogout = () => {
    logout();
    toast.success("Logged out successfully!");
    setTimeout(() => navigate("/"), 1200);
  };

  const NavItems = ({ onClick, iconOnly = false }) => (
    <nav className="flex flex-col gap-1">
      {SidebarLinks.map((link) => {
        const active = activeLink === link.name;
        return (
          <button
            key={link.name}
            onClick={() => onClick(link.name)}
            title={iconOnly ? link.name : undefined}
            className={cn(
              "flex items-center gap-3 rounded-xl px-4 py-2.5 text-left text-sm transition-colors duration-200",
              iconOnly && "justify-center px-0",
              active
                ? "bg-brand text-white shadow-glow"
                : "text-muted hover:bg-ink-800 hover:text-white"
            )}
          >
            <link.icon className="h-4 w-4 flex-shrink-0" />
            {!iconOnly && link.name}
          </button>
        );
      })}
    </nav>
  );

  return (
    <div className="flex h-screen bg-black text-white">
      {/* Sidebar for desktop */}
      <aside
        className={cn(
          "hidden flex-col border-r border-white/5 bg-ink-950 p-5 transition-[width] duration-200 md:flex",
          collapsed ? "w-20" : "w-64"
        )}
      >
        <div className={cn("mb-10 flex items-center", collapsed ? "flex-col gap-3" : "justify-between")}>
          <div className="flex items-center gap-2 text-lg font-semibold">
            <span className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg bg-brand">
              <Zap className="h-4 w-4 text-white" />
            </span>
            {!collapsed && "Airdox"}
          </div>
          <button
            onClick={() => setCollapsed((v) => !v)}
            className="text-muted hover:text-white"
            aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            {collapsed ? <ChevronsRight className="h-4 w-4" /> : <ChevronsLeft className="h-4 w-4" />}
          </button>
        </div>
        <NavItems onClick={handleLinkClick} iconOnly={collapsed} />
      </aside>

      {/* Sidebar for mobile */}
      <AnimatePresence>
        {sidebarOpen && (
          <>
            <motion.aside
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ duration: 0.25 }}
              className="fixed left-0 top-0 z-40 h-full w-64 border-r border-white/5 bg-ink-950 p-5 md:hidden"
            >
              <div className="mb-10 flex items-center justify-between">
                <div className="flex items-center gap-2 text-lg font-semibold">
                  <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand">
                    <Zap className="h-4 w-4 text-white" />
                  </span>
                  Airdox
                </div>
                <button className="text-muted hover:text-white" onClick={() => setSidebarOpen(false)}>
                  <X className="h-5 w-5" />
                </button>
              </div>
              <NavItems onClick={handleLinkClick} />
            </motion.aside>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-30 bg-black/60 md:hidden"
              onClick={() => setSidebarOpen(false)}
            />
          </>
        )}
      </AnimatePresence>

      {/* Main content */}
      <div className="flex flex-1 flex-col">
        <header className="flex items-center justify-between border-b border-white/5 bg-ink-950/60 p-4 backdrop-blur">
          <div className="flex items-center gap-4">
            <button className="text-muted hover:text-white md:hidden" onClick={() => setSidebarOpen(true)}>
              <Menu />
            </button>
            <div className="hidden items-center gap-2 text-sm text-muted md:flex">
              <User className="h-4 w-4" />
              <span>Hi, {user?.username || user?.fullname || "there"}</span>
            </div>
          </div>

          <button onClick={handleLogout} className="btn-secondary text-sm">
            <LogOut className="h-4 w-4" /> Logout
          </button>
        </header>

        <main className="flex-1 overflow-y-auto bg-ink-950 p-6">
          {activeLink === "Dashboard" && <Dashboard />}
          {activeLink === "Subscribe" && <Subscribe />}
          {activeLink === "View Airdrop" && <ClaimAirdrop />}
          {activeLink === "Payments" && <Payments />}
          {activeLink === "Transactions" && <Transactions />}
        </main>
      </div>
    </div>
  );
}
