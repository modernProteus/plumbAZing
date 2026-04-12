import { motion } from "framer-motion";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const FAQS = [
  {
    q: "Do you charge for estimates?",
    a: "Never. We'll give you a clear, upfront estimate before any work begins — no hidden fees.",
  },
  {
    q: "Are you available on weekends?",
    a: "Absolutely. Plumbing emergencies don't wait, and neither do we. We're available 7 days a week.",
  },
  {
    q: "What areas do you serve?",
    a: "We serve the Greater Austin area including Round Rock, Cedar Park, Georgetown, Pflugerville, Buda, Kyle, and Leander.",
  },
  {
    q: "Are your plumbers licensed and insured?",
    a: "Yes — every technician on our team is fully licensed, insured, and background-checked for your peace of mind.",
  },
  {
    q: "How fast can you get here?",
    a: "For most service calls, we aim for a 60-minute response window. Emergency calls are prioritized.",
  },
];

export default function FAQSection() {
  return (
    <section id="faq" className="py-20">
      <div className="max-w-3xl mx-auto px-4 sm:px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-50px" }}
          className="text-center mb-12"
        >
          <p className="text-accent font-semibold text-sm uppercase tracking-wider mb-2">Common Questions</p>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-secondary">Frequently Asked Questions</h2>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-30px" }}
        >
          <Accordion type="single" collapsible className="space-y-3">
            {FAQS.map((faq, i) => (
              <AccordionItem
                key={i}
                value={`faq-${i}`}
                className="bg-card border border-border/60 rounded-2xl px-6 data-[state=open]:shadow-lg data-[state=open]:shadow-primary/5 transition-shadow"
              >
                <AccordionTrigger className="text-secondary font-semibold text-base hover:no-underline py-5">
                  {faq.q}
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground text-sm pb-5">
                  {faq.a}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </motion.div>
      </div>
    </section>
  );
}