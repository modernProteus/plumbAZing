import { Phone, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";

const HERO_IMAGE = "https://media.base44.com/images/public/69dadcdaf2bcf223fea48880/20d8b72f0_Jax.png";

export default function HeroSection() {
  return (
    <section className="relative pt-28 pb-16 md:pt-36 md:pb-24 overflow-hidden">
      {/* Subtle background gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-background via-background to-accent/5 pointer-events-none" />

      <div className="relative max-w-6xl mx-auto px-4 sm:px-6">
        <div className="flex flex-col lg:flex-row items-center gap-10 lg:gap-16">
          {/* Text column */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
            className="flex-1 text-center lg:text-left"
          >
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-accent/10 text-accent text-sm font-medium mb-6">
              <span className="w-2 h-2 rounded-full bg-accent animate-pulse" />
              Serving Greater Austin, TX
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold leading-tight text-balance">
              <span style={{ color: '#0C3C83' }}>Honest Plumbing,</span>{" "}
              <span className="text-primary">Austin Proud.</span>
            </h1>

            <p className="mt-5 text-muted-foreground text-lg max-w-lg mx-auto lg:mx-0">
              Residential plumbing repairs, installs, and drain help from a locally owned Austin team. Fast response, clean work, no runaround. Free estimates for most jobs.
            </p>

            <div className="mt-8 flex flex-col items-center lg:items-start gap-3">
              <a
                href="tel:+15128884406"
                className="group flex flex-col items-center gap-1 rounded-2xl px-6 py-3 shadow-xl hover:-translate-y-0.5 transition-all duration-200"
                style={{ backgroundColor: '#0C3C83', boxShadow: '0 10px 30px rgba(12,60,131,0.35)' }}
              >
                <div className="flex items-center gap-2 text-white/60 text-xs font-semibold uppercase tracking-widest">
                  <Phone className="w-3.5 h-3.5" />
                  Call or Text Us
                </div>
                <span className="text-3xl sm:text-4xl font-black text-white tracking-tight leading-none group-hover:text-primary transition-colors">
                  (512) 888-4406
                </span>
              </a>
              <Button size="lg" className="w-full rounded-full px-8 py-6 text-base font-semibold shadow-lg shadow-primary/20 gap-2 group">
                Request Service
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Button>
            </div>
          </motion.div>

          {/* Image column */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.7, delay: 0.2 }}
            className="flex-1 flex justify-center lg:justify-end"
          >
            <div className="relative w-72 sm:w-80 lg:w-96">
              <div className="absolute -inset-6 bg-gradient-to-br from-accent/20 via-primary/10 to-transparent rounded-full blur-3xl" />
              <img
                src={HERO_IMAGE}
                alt="Jax — the PlumbAZING mascot"
                className="relative w-full h-auto drop-shadow-2xl"
              />
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}