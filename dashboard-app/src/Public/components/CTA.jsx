import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";

export default function CTA() {
  return (
    <section className="relative mx-auto max-w-6xl overflow-hidden rounded-3xl px-6 py-20 sm:mx-6 sm:my-20 sm:px-12">
      <div className="absolute inset-0 -z-10 bg-hero-radial" />
      <div className="pointer-events-none absolute left-1/2 top-1/2 h-72 w-72 -translate-x-1/2 -translate-y-1/2 bg-brand-glow opacity-70 blur-3xl" />

      <div className="mx-auto max-w-xl text-center">
        <span className="section-eyebrow">What you still waiting for</span>
        <h2 className="mt-4 text-3xl font-medium sm:text-4xl">
          Get Started Now with Airdox
        </h2>
        <p className="mt-4 text-muted">
          Unlock your unclaimed airdrops instantly with Airdox.
        </p>
        <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
          <Link to="/register" className="btn-primary px-6 py-3 text-base">
            Get Started Now <ArrowRight className="h-4 w-4" />
          </Link>
          <Link to="/login" className="btn-secondary px-6 py-3 text-base">
            Login
          </Link>
        </div>
      </div>
    </section>
  );
}
