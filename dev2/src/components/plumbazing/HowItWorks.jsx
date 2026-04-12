import { CalendarCheck, Truck, Star } from "lucide-react";
import { motion } from "framer-motion";

const STEPS = [
  {
    icon: CalendarCheck,
    number: "01",
    title: "Easy Booking",
    description: "Request service online or call us — we'll confirm your appointment fast.",
  },
  {
    icon: Truck,
    number: "02",
    title: "Professional Arrival",
    description: "A licensed plumber arrives on time, uniformed, with all the right tools.",
  },
  {
    icon: Star,
    number: "03",
    title: "5-Star Resolution",
    description: "We fix it right the first time. No surprises, just honest work and fair pricing.",
  },
];

export default function HowItWorks() {
  return (
    <section id="how-it-works" className="py-20 bg-muted/40">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-50px" }}
          className="text-center mb-14"
        >
          <p className="text-accent font-semibold text-sm uppercase tracking-wider mb-2">Simple Process</p>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-secondary">How It Works</h2>
        </motion.div>

        <div className="relative grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-6">
          {/* Connector line (desktop) */}
          <div className="hidden md:block absolute top-16 left-[20%] right-[20%] h-0.5 bg-gradient-to-r from-accent/30 via-primary/30 to-accent/30" />

          {STEPS.map((step, i) => (
            <motion.div
              key={step.number}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-30px" }}
              transition={{ delay: i * 0.15 }}
              className="relative flex flex-col items-center text-center"
            >
              <div className="relative z-10 w-16 h-16 rounded-2xl bg-card border-2 border-accent/30 flex items-center justify-center shadow-lg shadow-accent/10 mb-6">
                <step.icon className="w-7 h-7 text-accent" />
              </div>
              <span className="text-xs font-bold text-primary tracking-widest mb-2">{step.number}</span>
              <h3 className="text-xl font-bold text-secondary mb-2">{step.title}</h3>
              <p className="text-muted-foreground text-sm max-w-xs">{step.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}