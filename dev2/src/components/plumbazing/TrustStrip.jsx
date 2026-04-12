import { ShieldCheck, DollarSign, Clock, Heart } from "lucide-react";
import { motion } from "framer-motion";

const TRUST_POINTS = [
  { icon: ShieldCheck, label: "Licensed & Insured" },
  { icon: DollarSign, label: "Upfront Pricing" },
  { icon: Clock, label: "60-Min Response" },
  { icon: Heart, label: "Local Family Owned" },
];

export default function TrustStrip() {
  return (
    <section className="py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-50px" }}
          transition={{ duration: 0.5 }}
          className="bg-secondary rounded-3xl px-6 py-6 sm:py-5"
        >
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
            {TRUST_POINTS.map(({ icon: Icon, label }) => (
              <div key={label} className="flex items-center gap-3 justify-center text-secondary-foreground/90">
                <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center shrink-0">
                  <Icon className="w-5 h-5" />
                </div>
                <span className="text-sm sm:text-base font-semibold">{label}</span>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
}