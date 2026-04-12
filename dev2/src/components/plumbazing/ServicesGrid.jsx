import { ArrowRight } from "lucide-react";
import { motion } from "framer-motion";

const SERVICES = [
  {
    title: "Leak & Pipe Repair",
    description: "Fast detection and lasting fixes for any leak — big or small.",
    image: "https://media.base44.com/images/public/69dadcdaf2bcf223fea48880/a5a0dd74c_generated_3cf49997.png",
  },
  {
    title: "Water Heater Service",
    description: "Installation, repair, and maintenance for all water heater types.",
    image: "https://media.base44.com/images/public/69dadcdaf2bcf223fea48880/308122bcf_generated_638cb5af.png",
  },
  {
    title: "Faucet & Fixture",
    description: "Upgrades, repairs, and installations for kitchens and bathrooms.",
    image: "https://media.base44.com/images/public/69dadcdaf2bcf223fea48880/a8b939274_generated_a3e67b61.png",
  },
  {
    title: "Toilet & Drain",
    description: "Clogs, overflows, replacements — handled fast and clean.",
    image: "https://media.base44.com/images/public/69dadcdaf2bcf223fea48880/1387e5847_generated_31e37f7c.png",
  },
];

export default function ServicesGrid() {
  return (
    <section id="services" className="py-20">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-50px" }}
          className="text-center mb-12"
        >
          <p className="text-accent font-semibold text-sm uppercase tracking-wider mb-2">What We Do</p>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-secondary">Our Core Services</h2>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {SERVICES.map((service, i) => (
            <motion.div
              key={service.title}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-30px" }}
              transition={{ delay: i * 0.1 }}
              className="group bg-card border border-border/60 rounded-3xl overflow-hidden hover:shadow-xl hover:shadow-primary/5 hover:-translate-y-1 transition-all duration-300 cursor-pointer"
            >
              <div className="aspect-square bg-muted/50 flex items-center justify-center p-8 overflow-hidden">
                <img
                  src={service.image}
                  alt={service.title}
                  className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-500"
                />
              </div>
              <div className="p-5">
                <h3 className="text-lg font-bold text-secondary mb-1">{service.title}</h3>
                <p className="text-muted-foreground text-sm leading-relaxed">{service.description}</p>
                <div className="mt-4 flex items-center gap-1 text-primary text-sm font-semibold group-hover:gap-2 transition-all">
                  Learn more <ArrowRight className="w-4 h-4" />
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}