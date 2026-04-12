import { X, Phone } from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";

export default function MobileNav({ open, onClose }) {
  const links = ["Services", "How It Works", "Reviews", "Service Area", "FAQ"];

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[60] bg-secondary/95 backdrop-blur-md flex flex-col"
        >
          <div className="flex items-center justify-between px-6 pt-6">
            <img
              src="https://media.base44.com/images/public/69dadcdaf2bcf223fea48880/6a1d7aa8b_PlumbAZing_logo_noBack_sq.png"
              alt="PlumbAZING logo"
              className="h-12 w-auto brightness-0 invert"
            />
            <button onClick={onClose} className="p-2 text-white/70 hover:text-white" aria-label="Close menu">
              <X className="w-7 h-7" />
            </button>
          </div>

          <nav className="flex-1 flex flex-col items-center justify-center gap-5 px-8">
            {links.map((link) => (
              <motion.a
                key={link}
                href={`#${link.toLowerCase().replace(/\s/g, "-")}`}
                onClick={onClose}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-2xl font-semibold text-white/90 hover:text-white py-3 w-full text-center rounded-2xl hover:bg-white/10 transition-colors"
              >
                {link}
              </motion.a>
            ))}
          </nav>

          <div className="px-6 pb-8 flex flex-col gap-3">
            <a href="tel:+15128884406" className="w-full">
              <Button variant="outline" className="w-full rounded-full border-white/20 text-white hover:bg-white/10 gap-2 py-6 text-base">
                <Phone className="w-5 h-5" /> (512) 888-4406
              </Button>
            </a>
            <Button className="w-full rounded-full py-6 text-base font-semibold shadow-lg shadow-primary/30">
              Request Service
            </Button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}