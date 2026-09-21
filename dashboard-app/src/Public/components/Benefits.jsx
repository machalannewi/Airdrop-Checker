import { motion } from "framer-motion";
import {
  Coins,
  Radar,
  SlidersHorizontal,
  ShieldCheck,
  Zap,
  Headset,
} from "lucide-react";

const benefits = [
  {
    icon: Coins,
    title: "Maximize Earnings",
    desc: "Our platform helps you find the best airdrops, ensuring you never leave free tokens on the table.",
  },
  {
    icon: Radar,
    title: "Real-Time Insights",
    desc: "Never miss out! Get real-time notifications on the latest and expiring airdrops.",
  },
  {
    icon: SlidersHorizontal,
    title: "Flexible Plans",
    desc: "Choose plans that adapt to your needs, offering unparalleled scalability and cost-effectiveness.",
  },
  {
    icon: ShieldCheck,
    title: "Secure Transactions",
    desc: "We ensure your data and transactions remain safe while you claim rewards hassle-free.",
  },
  {
    icon: Zap,
    title: "Easy & Fast Access",
    desc: "Simplified processes make claiming airdrops quicker and more efficient than ever.",
  },
  {
    icon: Headset,
    title: "Dedicated Support",
    desc: "Access expert assistance 24/7 to ensure you're never alone.",
  },
];

export default function Benefits() {
  return (
    <section id="features" className="mx-auto max-w-6xl px-6 py-24">
      <div className="mx-auto max-w-2xl text-center">
        <span className="section-eyebrow">Benefits</span>
        <h2 className="mt-4 text-3xl font-medium sm:text-4xl">Why Choose Us?</h2>
        <p className="mt-4 text-muted">
          We offer a number of services that prioritize our customers.
        </p>
      </div>

      <div className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {benefits.map((b, i) => (
          <motion.div
            key={b.title}
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4, delay: (i % 3) * 0.08 }}
            className="card p-6"
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-brand-soft ring-1 ring-inset ring-brand/30">
              <b.icon className="h-5 w-5 text-brand-light" />
            </div>
            <h3 className="mt-4 text-lg font-medium">{b.title}</h3>
            <p className="mt-2 text-sm text-muted">{b.desc}</p>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
