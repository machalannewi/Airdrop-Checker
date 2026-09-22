import { useState } from "react";
import { Link } from "react-router-dom";
import { Menu, X, Zap, LayoutDashboard } from "lucide-react";
import { useAuth } from "../../User/context/AuthContext.jsx";

const links = [
  { name: "Features", href: "#features" },
  { name: "Pricing", href: "#pricing" },
  { name: "Contact", href: "#faq" },
];

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const { isAuthenticated } = useAuth();

  return (
    <header className="sticky top-0 z-50 border-b border-white/5 bg-black/70 backdrop-blur-md">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
        <Link to="/" className="flex items-center gap-2 text-lg font-semibold">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand">
            <Zap className="h-4 w-4 text-white" />
          </span>
          Airdox
        </Link>

        <nav className="hidden items-center gap-8 text-sm text-muted md:flex">
          {links.map((l) => (
            <a key={l.name} href={l.href} className="transition-colors hover:text-white">
              {l.name}
            </a>
          ))}
        </nav>

        <div className="hidden items-center gap-3 md:flex">
          {isAuthenticated ? (
            <Link to="/dashboard" className="btn-primary">
              <LayoutDashboard className="h-4 w-4" /> Dashboard
            </Link>
          ) : (
            <>
              <Link to="/login" className="btn-secondary">
                Login
              </Link>
              <Link to="/register" className="btn-primary">
                Get started
              </Link>
            </>
          )}
        </div>

        <button
          className="text-white md:hidden"
          onClick={() => setOpen((v) => !v)}
          aria-label="Toggle menu"
        >
          {open ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      {open && (
        <div className="border-t border-white/5 bg-black px-6 py-4 md:hidden">
          <nav className="flex flex-col gap-4 text-sm text-muted">
            {links.map((l) => (
              <a key={l.name} href={l.href} onClick={() => setOpen(false)}>
                {l.name}
              </a>
            ))}
          </nav>
          <div className="mt-4 flex flex-col gap-3">
            {isAuthenticated ? (
              <Link to="/dashboard" className="btn-primary" onClick={() => setOpen(false)}>
                <LayoutDashboard className="h-4 w-4" /> Dashboard
              </Link>
            ) : (
              <>
                <Link to="/login" className="btn-secondary" onClick={() => setOpen(false)}>
                  Login
                </Link>
                <Link to="/register" className="btn-primary" onClick={() => setOpen(false)}>
                  Get started
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
