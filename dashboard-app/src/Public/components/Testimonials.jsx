import { motion } from "framer-motion";
import { Star } from "lucide-react";

const testimonials = [
  { quote: "Highly intuitive and polished. It's everything we needed and more!", name: "Alex Jonas", role: "JS Marketing", rating: 5.0 },
  { quote: "This is truly incredible and has saved us countless hours!", name: "John Robert", role: "SM Strategy", rating: 5.0 },
  { quote: "Pure brilliance! This has streamlined our workflow massively.", name: "Maggie Hue", role: "BS Growth CEO", rating: 4.8 },
  { quote: "A top-notch solution! It's been transformative for our entire team.", name: "Tappo Kao", role: "PO Marketing", rating: 5.0 },
  { quote: "Amazing product! It's made our processes seamless and effective.", name: "Jack Hanma", role: "JK Finance", rating: 5.0 },
  { quote: "Incredible design and functionality! This has exceeded our expectations.", name: "John Robert", role: "JO Strategy", rating: 5.0 },
];

export default function Testimonials() {
  return (
    <section className="border-y border-white/5 bg-ink-950 py-24">
      <div className="mx-auto max-w-6xl px-6">
        <div className="mx-auto max-w-2xl text-center">
          <span className="section-eyebrow">Wall of Love</span>
          <h2 className="mt-4 text-3xl font-medium sm:text-4xl">Loved by thinkers</h2>
          <p className="mt-4 text-muted">
            Here's what people worldwide are saying about us.
          </p>
        </div>

        <div className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {testimonials.map((t, i) => (
            <motion.div
              key={t.name + i}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: (i % 3) * 0.08 }}
              className="card flex flex-col gap-4 p-6"
            >
              <div className="flex items-center gap-1 text-brand-light">
                {Array.from({ length: 5 }).map((_, j) => (
                  <Star key={j} className="h-4 w-4 fill-current" />
                ))}
                <span className="ml-2 text-xs text-muted">{t.rating.toFixed(1)}</span>
              </div>
              <p className="text-sm text-white/90">&ldquo;{t.quote}&rdquo;</p>
              <div className="mt-auto flex items-center gap-3 pt-2">
                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-brand-soft text-xs font-semibold text-brand-light ring-1 ring-inset ring-brand/30">
                  {t.name.split(" ").map((n) => n[0]).join("")}
                </div>
                <div>
                  <p className="text-sm font-medium">{t.name}</p>
                  <p className="text-xs text-muted">{t.role}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
