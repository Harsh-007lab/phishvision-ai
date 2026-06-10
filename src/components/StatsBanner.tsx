import { motion } from "framer-motion";

const stats = [
  { value: "2.3M+", label: "URLs scanned" },
  { value: "94.7%", label: "threat detection accuracy" },
  { value: "< 3s", label: "average scan time" },
  { value: "Zero", label: "data sold — ever" },
];

export const StatsBanner = () => (
  <section className="w-full max-w-6xl mx-auto px-4">
    <div className="rounded-2xl border border-border/40 bg-card/30 backdrop-blur-md p-6 sm:p-8">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
        {stats.map((s, i) => (
          <motion.div
            key={s.label}
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.08, duration: 0.4 }}
          >
            <div className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              {s.value}
            </div>
            <div className="text-xs sm:text-sm text-muted-foreground mt-1">{s.label}</div>
          </motion.div>
        ))}
      </div>
    </div>
  </section>
);