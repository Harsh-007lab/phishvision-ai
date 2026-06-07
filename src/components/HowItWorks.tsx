import { motion } from "framer-motion";
import { ShieldCheck, Cpu, BarChart3 } from "lucide-react";

const steps = [
  {
    icon: ShieldCheck,
    title: "Paste any suspicious URL",
    body:
      "From an email, SMS, WhatsApp, or social media. We support full URLs, shortened links, and redirects.",
  },
  {
    icon: Cpu,
    title: "We run 14 checks instantly",
    body:
      "Domain age, WHOIS data, SSL certificate validity, blacklist status, redirect chains, malware signatures, and AI-powered visual analysis.",
  },
  {
    icon: BarChart3,
    title: "Get a clear threat verdict",
    body:
      "A 0–100 safety score with plain-language explanation of every risk signal we found. Know exactly why a URL is dangerous.",
  },
];

export const HowItWorks = () => {
  return (
    <section
      aria-labelledby="how-it-works-heading"
      className="w-full max-w-5xl mx-auto px-3 sm:px-6"
    >
      <div className="text-center mb-8">
        <h2
          id="how-it-works-heading"
          className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent"
        >
          How it works
        </h2>
        <p className="mt-2 text-sm sm:text-base text-muted-foreground">
          Three steps from suspicious link to clear verdict.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6">
        {steps.map((step, idx) => {
          const Icon = step.icon;
          return (
            <motion.div
              key={step.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.1 }}
              className="glass rounded-2xl p-5 sm:p-6 border border-primary/20 hover:border-primary/40 transition-all relative overflow-hidden group"
            >
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-gradient-to-br from-primary/30 to-accent/20 flex items-center justify-center border border-primary/30">
                  <Icon className="w-6 h-6 text-primary" />
                </div>
                <div className="flex-1">
                  <div className="text-xs font-mono text-primary/70 mb-1">
                    Step {idx + 1}
                  </div>
                  <h3 className="text-base sm:text-lg font-semibold mb-2">
                    {step.title}
                  </h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {step.body}
                  </p>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>
    </section>
  );
};