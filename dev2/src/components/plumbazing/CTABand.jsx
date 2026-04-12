import { ArrowRight, Phone } from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";

export default function CTABand() {
  return (
    <section className="py-16">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-50px" }}
          className="relative bg-secondary rounded-3xl overflow-hidden px-8 py-14 sm:py-16 text-center"
        >
          {/* Decorative gradient */}
          <div className="absolute inset-0 bg-gradient-to-br from-accent/10 via-transparent to-primary/10 pointer-events-none" />

          <div className="relative z-10">
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white mb-4 text-balance">
              Got a Plumbing Problem? Let's Fix It.
            </h2>
            <p className="text-white/70 text-lg max-w-lg mx-auto mb-8">
              Call or text us, send a photo, or request service online. We'll get back to you fast with real options and an honest quote.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Button size="lg" className="rounded-full px-8 py-6 text-base font-semibold shadow-lg shadow-primary/30 gap-2 group">
                Request Service
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Button>
              <a href="tel:+15128884406">
                <Button
                  variant="outline"
                  size="lg"
                  className="rounded-full px-8 py-6 text-base font-semibold border-white/20 text-white hover:bg-white/10 gap-2 w-full sm:w-auto"
                >
                  <Phone className="w-4 h-4" /> Call (512) 888-4406
                </Button>
              </a>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}