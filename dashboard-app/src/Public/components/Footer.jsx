import { Link } from "react-router-dom";
import { Zap, Instagram, Twitter, Facebook } from "lucide-react";
import { useAuth } from "../../User/context/AuthContext.jsx";

export default function Footer() {
  const { isAuthenticated } = useAuth();

  return (
    <footer className="border-t border-white/5 bg-black py-12">
      <div className="mx-auto flex max-w-6xl flex-col gap-8 px-6 md:flex-row md:items-start md:justify-between">
        <div>
          <Link to="/" className="flex items-center gap-2 text-lg font-semibold">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand">
              <Zap className="h-4 w-4 text-white" />
            </span>
            Airdox
          </Link>
          <p className="mt-3 max-w-xs text-sm text-muted">
            Discover, track, and claim the top crypto airdrops — simple, fast and
            always up to date.
          </p>
        </div>

        <div className="grid grid-cols-2 gap-8 text-sm sm:grid-cols-3">
          <div>
            <p className="font-medium text-white">Company</p>
            <ul className="mt-3 space-y-2 text-muted">
              <li><a href="#features" className="hover:text-white">Features</a></li>
              <li><a href="#pricing" className="hover:text-white">Pricing</a></li>
              <li><a href="#faq" className="hover:text-white">Contact</a></li>
            </ul>
          </div>
          <div>
            <p className="font-medium text-white">Account</p>
            <ul className="mt-3 space-y-2 text-muted">
              {isAuthenticated ? (
                <li><Link to="/dashboard" className="hover:text-white">Dashboard</Link></li>
              ) : (
                <>
                  <li><Link to="/login" className="hover:text-white">Login</Link></li>
                  <li><Link to="/register" className="hover:text-white">Get Started</Link></li>
                </>
              )}
            </ul>
          </div>
          <div>
            <p className="font-medium text-white">Connect</p>
            <div className="mt-3 flex gap-3 text-muted">
              <a href="#" aria-label="Instagram" className="hover:text-white"><Instagram className="h-4 w-4" /></a>
              <a href="#" aria-label="Twitter" className="hover:text-white"><Twitter className="h-4 w-4" /></a>
              <a href="#" aria-label="Facebook" className="hover:text-white"><Facebook className="h-4 w-4" /></a>
            </div>
            <p className="mt-3 text-muted">voyagetechnologies10@gmail.com</p>
          </div>
        </div>
      </div>

      <div className="mx-auto mt-10 max-w-6xl border-t border-white/5 px-6 pt-6 text-xs text-muted">
        © {new Date().getFullYear()} Airdox. All rights reserved.
      </div>
    </footer>
  );
}
