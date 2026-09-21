import { useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Check } from "lucide-react";

const plans = [
  {
    name: "Starter",
    price: 12,
    popular: false,
    features: [
      "Access to limited airdrop alerts",
      "Basic real-time price tracking",
      "Manual claim reminders",
      "Private Discord with the Airdox team",
      "Community support",
      "Regular updates",
    ],
  },
  {
    name: "Pro",
    price: 17,
    popular: true,
    features: [
      "All Starter features",
      "Access to more airdrop opportunities",
      "Automated claim reminders",
      "Priority support",
      "Wallet integration for tracking",
      "Detailed usage reports",
    ],
  },
  {
    name: "Enterprise",
    price: null,
    popular: false,
    features: [
      "All Pro features",
      "Early access to exclusive airdrops",
      "Advanced analytics & insights",
      "24/7 priority support",
    ],
  },
];

export default function Pricing() {
  const [yearly, setYearly] = useState(false);

  return (
    <section id="pricing" className="mx-auto max-w-6xl px-6 py-24">
      <div className="mx-auto max-w-2xl text-center">
        <span className="section-eyebrow">Pricing &amp; Plans</span>
        <h2 className="mt-4 text-3xl font-medium sm:text-4xl">Flexible Pricing Plans</h2>
        <p className="mt-4 text-muted">
          Choose a plan that fits your needs and unlock the full potential of our platform.
        </p>

        <div className="mx-auto mt-8 inline-flex items-center gap-3 rounded-full bg-ink-800 p-1 ring-1 ring-inset ring-ink-700">
          <button
            onClick={() => setYearly(false)}
            className={`rounded-full px-4 py-1.5 text-sm transition-colors ${
              !yearly ? "bg-brand text-white" : "text-muted"
            }`}
          >
            Monthly
          </button>
          <button
            onClick={() => setYearly(true)}
            className={`rounded-full px-4 py-1.5 text-sm transition-colors ${
              yearly ? "bg-brand text-white" : "text-muted"
            }`}
          >
            Yearly <span className="text-brand-light">(30% off)</span>
          </button>
        </div>
      </div>

      <div className="mt-14 grid gap-6 md:grid-cols-3">
        {plans.map((plan, i) => {
          const price = plan.price === null ? null : yearly ? Math.round(plan.price * 0.7) : plan.price;
          return (
            <motion.div
              key={plan.name}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: i * 0.08 }}
              className={`card relative flex flex-col p-6 ${
                plan.popular ? "ring-2 ring-brand" : ""
              }`}
            >
              {plan.popular && (
                <span className="absolute -top-3 left-6 rounded-full bg-brand px-3 py-1 text-xs font-semibold">
                  Popular
                </span>
              )}
              <h3 className="text-lg font-medium">{plan.name}</h3>
              <div className="mt-4 flex items-baseline gap-1">
                {price === null ? (
                  <span className="text-3xl font-semibold">Custom</span>
                ) : (
                  <>
                    <span className="text-3xl font-semibold">${price}</span>
                    <span className="text-sm text-muted">/ month</span>
                  </>
                )}
              </div>
              <Link
                to="/register"
                className={`mt-6 ${plan.popular ? "btn-primary" : "btn-secondary"}`}
              >
                Get Started Now
              </Link>
              <p className="mt-6 text-xs font-semibold uppercase tracking-wider text-muted">
                Includes
              </p>
              <ul className="mt-3 space-y-3 text-sm">
                {plan.features.map((f) => (
                  <li key={f} className="flex items-start gap-2">
                    <Check className="mt-0.5 h-4 w-4 flex-shrink-0 text-brand-light" />
                    <span className="text-white/90">{f}</span>
                  </li>
                ))}
              </ul>
            </motion.div>
          );
        })}
      </div>
    </section>
  );
}
