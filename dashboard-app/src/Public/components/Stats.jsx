import { motion } from "framer-motion";
import { Bell, TrendingUp, ShieldCheck } from "lucide-react";

const stats = [
  { label: "Monthly Visits", value: "248K" },
  { label: "Last 24hrs", value: "3,412" },
  { label: "Retention", value: "94%" },
];

export default function Stats() {
  return (
    <section className="relative border-y border-white/5 bg-ink-950 py-24">
      <div className="mx-auto grid max-w-6xl gap-16 px-6 md:grid-cols-2 md:items-center">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          <span className="section-eyebrow">Statistics</span>
          <h2 className="mt-4 text-3xl font-medium sm:text-4xl">Stay Updated</h2>
          <p className="mt-4 max-w-md text-muted">
            Never miss out again! Stay ahead with real-time alerts for new and
            expiring airdrops, ensuring you claim them before they're gone.
          </p>
          <div className="mt-8 flex items-center gap-3 text-sm text-muted">
            <Bell className="h-4 w-4 text-brand-light" />
            100% real time updates
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 20 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="card grid grid-cols-3 gap-4 p-6"
        >
          {stats.map((s) => (
            <div key={s.label} className="rounded-xl bg-ink-900/60 p-4 text-center">
              <p className="text-2xl font-semibold text-white">{s.value}</p>
              <p className="mt-1 text-xs text-muted">{s.label}</p>
            </div>
          ))}
          <div className="col-span-3 mt-2 flex items-center justify-center gap-6 border-t border-ink-700 pt-4 text-xs text-muted">
            <span className="flex items-center gap-1">
              <TrendingUp className="h-3.5 w-3.5 text-brand-light" /> Conversion up
            </span>
            <span className="flex items-center gap-1">
              <ShieldCheck className="h-3.5 w-3.5 text-brand-light" /> Secure & audited
            </span>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
