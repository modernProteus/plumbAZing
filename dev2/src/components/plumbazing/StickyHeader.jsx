import { useState } from "react";
import { Phone, Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import MobileNav from "./MobileNav";

export default function StickyHeader() {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <>
      <header className="fixed top-0 left-0 right-0 z-50 flex justify-center px-3 pt-3">
        <div className="w-full max-w-6xl bg-white/80 backdrop-blur-xl border border-border/50 rounded-2xl shadow-lg px-4 py-3 flex items-center justify-between">
          {/* Left: Jax icon */}
          <a href="/" className="flex items-center">
            <img
              src="https://media.base44.com/images/public/69dadcdaf2bcf223fea48880/07aede62b_apple-touch-icon.png"
              alt="Jax icon"
              className="h-12 w-12 object-contain"
            />
          </a>

          {/* Center: biz name */}
          <div className="absolute left-1/2 -translate-x-1/2">
            <img
              src="https://media.base44.com/images/public/69dadcdaf2bcf223fea48880/678008944_bizName.png"
              alt="PlumbAZING"
              className="h-8 w-auto object-contain"
            />
          </div>

          {/* Desktop actions */}
          <button
            onClick={() => setMobileOpen(true)}
            className="md:hidden p-2 rounded-xl hover:bg-muted transition-colors"
            aria-label="Open menu"
          >
            <Menu className="w-6 h-6 text-secondary" />
          </button>
        </div>
      </header>

      <MobileNav open={mobileOpen} onClose={() => setMobileOpen(false)} />
    </>
  );
}