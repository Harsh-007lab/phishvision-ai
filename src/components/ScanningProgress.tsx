import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Check, Loader2, Circle } from "lucide-react";

const CHECKS = [
  "Resolving domain and checking DNS",
  "Checking WHOIS registration date",
  "Validating SSL certificate chain",
  "Querying malware blacklists",
  "Tracing redirect chain",
  "Analysing domain similarity to known brands",
  "Running AI threat model",
];

type StepState = "queued" | "active" | "done";

export const ScanningProgress = () => {
  const [active, setActive] = useState(0);

  useEffect(() => {
    const total = CHECKS.length;
    // Total ~2.8s: ~400ms per step
    const stepMs = 400;
    const id = window.setInterval(() => {
      setActive((a) => (a >= total ? total : a + 1));
    }, stepMs);
    return () => window.clearInterval(id);
  }, []);

  const stateOf = (i: number): StepState => {
    if (i < active) return "done";
    if (i === active) return "active";
    return "queued";
  };

  const progress = Math.min(100, Math.round((active / CHECKS.length) * 100));

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -12 }}
      className="glass rounded-2xl p-5 sm:p-6 border border-primary/30 space-y-4"
      aria-live="polite"
    >
      <div className="flex items-center justify-between gap-3">
        <div>
          <h3 className="text-base sm:text-lg font-semibold">Scanning in progress</h3>
          <p className="text-xs text-muted-foreground">
            Running 7 of 14 security checks…
          </p>
        </div>
        <div className="text-sm font-mono text-primary">{progress}%</div>
      </div>

      <div className="relative h-1.5 w-full bg-secondary rounded-full overflow-hidden">
        <motion.div
          className="absolute inset-y-0 left-0 bg-gradient-to-r from-primary via-accent to-primary"
          animate={{ width: `${progress}%` }}
          transition={{ duration: 0.3, ease: "easeOut" }}
        />
      </div>

      <ul className="space-y-2">
        {CHECKS.map((label, i) => {
          const state = stateOf(i);
          return (
            <li
              key={label}
              className="flex items-center gap-3 text-sm rounded-lg px-3 py-2 bg-secondary/30"
            >
              <span className="w-5 h-5 flex items-center justify-center flex-shrink-0">
                <AnimatePresence mode="wait">
                  {state === "done" && (
                    <motion.span
                      key="done"
                      initial={{ scale: 0.5, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      className="w-5 h-5 rounded-full bg-success/20 flex items-center justify-center"
                    >
                      <Check className="w-3.5 h-3.5 text-success" />
                    </motion.span>
                  )}
                  {state === "active" && (
                    <motion.span
                      key="active"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                    >
                      <Loader2 className="w-4 h-4 text-primary animate-spin" />
                    </motion.span>
                  )}
                  {state === "queued" && (
                    <Circle
                      key="queued"
                      className="w-4 h-4 text-muted-foreground/40"
                    />
                  )}
                </AnimatePresence>
              </span>
              <span
                className={
                  state === "done"
                    ? "text-foreground/80"
                    : state === "active"
                    ? "text-foreground font-medium"
                    : "text-muted-foreground"
                }
              >
                {label}…
              </span>
              <span
                className={`ml-auto text-xs font-mono ${
                  state === "done"
                    ? "text-success"
                    : state === "active"
                    ? "text-primary"
                    : "text-muted-foreground/60"
                }`}
              >
                {state === "done"
                  ? "Done"
                  : state === "active"
                  ? "Checking…"
                  : "Queued"}
              </span>
            </li>
          );
        })}
      </ul>
    </motion.div>
  );
};