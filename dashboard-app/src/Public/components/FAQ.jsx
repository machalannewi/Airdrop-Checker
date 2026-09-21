import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown } from "lucide-react";

const faqs = [
  {
    q: "How do I claim an airdrop?",
    a: "Register on our platform and submit your wallet address. Some airdrops may require social media tasks or gas fees for the transaction.",
  },
  {
    q: "Is this safe to use?",
    a: "Absolutely! All you need to do is enter your wallet address and check if there is any airdrop available for claim.",
  },
  {
    q: "Are there any fees?",
    a: "Claiming is free, but blockchain gas fees may apply depending on the network; never pay anyone directly to receive an airdrop.",
  },
  {
    q: "When will I receive my token?",
    a: "Some airdrops distribute instantly, while others delay allocations — check each project's official schedule for details.",
  },
  {
    q: "What if a claim fails?",
    a: "Ensure you have enough gas funds, try adjusting slippage, or contact the original project's support — we can't resolve distribution issues.",
  },
];

export default function FAQ() {
  const [open, setOpen] = useState(0);

  return (
    <section id="faq" className="border-y border-white/5 bg-ink-950 py-24">
      <div className="mx-auto max-w-3xl px-6">
        <div className="text-center">
          <span className="section-eyebrow">FAQ's Section</span>
          <h2 className="mt-4 text-3xl font-medium sm:text-4xl">Some Common FAQ's</h2>
          <p className="mt-4 text-muted">
            Get answers to your questions and learn about our platform.
          </p>
        </div>

        <div className="mt-12 space-y-3">
          {faqs.map((f, i) => (
            <div key={f.q} className="card overflow-hidden">
              <button
                onClick={() => setOpen(open === i ? -1 : i)}
                className="flex w-full items-center justify-between px-5 py-4 text-left text-sm font-medium"
              >
                {f.q}
                <ChevronDown
                  className={`h-4 w-4 flex-shrink-0 text-brand-light transition-transform ${
                    open === i ? "rotate-180" : ""
                  }`}
                />
              </button>
              <AnimatePresence initial={false}>
                {open === i && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.25 }}
                  >
                    <p className="px-5 pb-4 text-sm text-muted">{f.a}</p>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
