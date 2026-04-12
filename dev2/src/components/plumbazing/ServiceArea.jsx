import { MapPin } from "lucide-react";
import { motion } from "framer-motion";

const MAP_IMAGE = "https://media.base44.com/images/public/69dadcdaf2bcf223fea48880/d8079f3b5_generated_image.png";

const AREAS = [
  "Austin", "Round Rock", "Cedar Park", "Georgetown",
  "Pflugerville", "Buda", "Kyle", "Leander",
];

export default function ServiceArea() {
  return (
    <section id="service-area" className="py-20 bg-muted/40">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="flex flex-col lg:flex-row items-center gap-10 lg:gap-16">
          {/* Map image */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-50px" }}
            className="flex-1 w-full"
          >
            <div className="rounded-3xl overflow-hidden shadow-xl shadow-secondary/5 border border-border/40">
              <img
                src={MAP_IMAGE}
                alt="PlumbAZING service area covering the greater Austin, TX region"
                className="w-full h-auto"
              />
            </div>
          </motion.div>

          {/* Text + area list */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-50px" }}
            className="flex-1"
          >
            <p className="text-accent font-semibold text-sm uppercase tracking-wider mb-2">Coverage</p>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-secondary mb-4">We're in Your Neighborhood</h2>
            <p className="text-muted-foreground mb-8 max-w-md">
              Proudly serving the Greater Austin area. If you're nearby, there's a good chance we've already helped your neighbor.
            </p>
            <div className="grid grid-cols-2 gap-3">
              {AREAS.map((area) => (
                <div key={area} className="flex items-center gap-2 text-secondary font-medium text-sm">
                  <MapPin className="w-4 h-4 text-primary shrink-0" />
                  {area}
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}