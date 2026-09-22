import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowRight, LayoutDashboard } from "lucide-react";
import { useAuth } from "../../User/context/AuthContext.jsx";

const brands = ["Airdox", "Crystalio", "Voyage", "Chase app", "Robinson jr"];

export default function Hero() {
  const { isAuthenticated } = useAuth();

  return (
    <section className="relative overflow-hidden bg-hero-radial pb-20 pt-24">
      <div className="pointer-events-none absolute left-1/2 top-0 h-[36rem] w-[60rem] -translate-x-1/2 bg-brand-glow opacity-60 blur-3xl" />

      <div className="relative mx-auto max-w-4xl px-6 text-center">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mx-auto inline-flex items-center gap-2 rounded-full bg-ink-800 px-4 py-1.5 text-xs text-muted ring-1 ring-inset ring-ink-700"
        >
          <span className="font-semibold text-white">Join</span> 15,725+ other loving customers
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="mt-6 text-4xl font-medium leading-tight sm:text-5xl md:text-6xl"
        >
          Unlock Your Unclaimed Airdrops{" "}
          <span className="bg-gradient-to-r from-brand-light to-brand bg-clip-text text-transparent">
            Instantly
          </span>{" "}
          with Airdox!
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="mx-auto mt-6 max-w-2xl text-base text-muted md:text-lg"
        >
          Connect your wallet to discover and claim your free tokens. Don't let your
          airdrops go to waste — find out what's waiting for you!
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="mt-8 flex flex-wrap items-center justify-center gap-4"
        >
          {isAuthenticated ? (
            <Link to="/dashboard" className="btn-primary px-6 py-3 text-base">
              <LayoutDashboard className="h-4 w-4" /> Go to Dashboard
            </Link>
          ) : (
            <>
              <Link to="/register" className="btn-primary px-6 py-3 text-base">
                Get Started Now <ArrowRight className="h-4 w-4" />
              </Link>
              <Link to="/login" className="btn-secondary px-6 py-3 text-base">
                Login
              </Link>
            </>
          )}
        </motion.div>
      </div>

      <div className="relative mx-auto mt-20 max-w-5xl px-6">
        <p className="mb-6 text-center text-xs uppercase tracking-widest text-muted">
          Trusted by teams building the next generation of web3
        </p>
        <div className="flex flex-wrap items-center justify-center gap-x-10 gap-y-4 opacity-70">
          {brands.map((b) => (
            <span key={b} className="text-lg font-semibold text-muted">
              {b}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}
