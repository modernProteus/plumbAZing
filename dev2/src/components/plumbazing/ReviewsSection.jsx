import { Star, Quote } from "lucide-react";
import { motion } from "framer-motion";

const REVIEWS = [
  {
    name: "Sarah M.",
    location: "Austin, TX",
    text: "They came out the same day and fixed a nasty leak under our kitchen sink. Professional, clean, and the price was exactly what they quoted. Couldn't ask for more!",
    rating: 5,
  },
  {
    name: "David R.",
    location: "Round Rock, TX",
    text: "Had a water heater emergency on a Saturday. Josh showed up within the hour, didn't charge an arm and a leg, and explained everything clearly. Best plumbing experience I've had.",
    rating: 5,
  },
  {
    name: "Jennifer L.",
    location: "Cedar Park, TX",
    text: "We've used PlumbAZING three times now. Always on time, always fair pricing, always leaves the space clean. They're our go-to for anything plumbing.",
    rating: 5,
  },
];

export default function ReviewsSection() {
  return (
    <section id="reviews" className="py-20">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-50px" }}
          className="text-center mb-12"
        >
          <p className="text-accent font-semibold text-sm uppercase tracking-wider mb-2">Real Stories</p>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-secondary">What Our Neighbors Say</h2>
        </motion.div>

        {/* Team photo */}
        <div className="mb-10 rounded-3xl overflow-hidden relative shadow-lg">
          <img
            src="https://media.base44.com/images/public/69dadcdaf2bcf223fea48880/dbd2cea5c_ad-team.png"
            alt="Josh, Alan, and Jax — the PlumbAZING team"
            className="w-full max-h-96 object-cover object-top"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-secondary/80 via-transparent to-transparent flex items-end px-6 pb-5">
            <p className="text-white font-semibold text-sm">Josh, Alan & Jax — Your Austin Plumbing Team</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {REVIEWS.map((review, i) => (
            <motion.div
              key={review.name}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-30px" }}
              transition={{ delay: i * 0.1 }}
              className="bg-card border border-border/60 rounded-3xl p-6 flex flex-col"
            >
              <Quote className="w-8 h-8 text-primary/20 mb-3" />
              <p className="text-secondary/80 text-sm leading-relaxed flex-1">"{review.text}"</p>
              <div className="mt-5 flex items-center justify-between">
                <div>
                  <p className="font-bold text-secondary text-sm">{review.name}</p>
                  <p className="text-muted-foreground text-xs">{review.location}</p>
                </div>
                <div className="flex gap-0.5">
                  {Array.from({ length: review.rating }).map((_, j) => (
                    <Star key={j} className="w-4 h-4 fill-amber-400 text-amber-400" />
                  ))}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}