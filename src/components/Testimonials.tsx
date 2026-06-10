import { Card, CardContent } from "@/components/ui/card";
import { Quote } from "lucide-react";
import { motion } from "framer-motion";

const testimonials = [
  {
    quote:
      "PhishVision caught a credential-harvesting page targeting our accounting team that Google Safe Browsing missed. The explanation told us exactly what to look for.",
    name: "James K.",
    role: "IT Manager, 120-person firm",
    initials: "JK",
  },
  {
    quote:
      "Finally a phishing scanner that explains WHY something is dangerous, not just that it is. My whole team uses it before clicking any link from a client.",
    name: "Sarah M.",
    role: "Security Analyst",
    initials: "SM",
  },
  {
    quote:
      "The QR code scanner is a game changer. Quishing attacks are everywhere right now and nothing else checks QR codes this easily.",
    name: "David R.",
    role: "CISO, SMB",
    initials: "DR",
  },
];

export const Testimonials = () => (
  <section className="w-full max-w-6xl mx-auto px-4 py-8">
    <div className="text-center mb-10">
      <p className="text-sm font-medium text-primary uppercase tracking-wider mb-2">
        Trusted by security teams
      </p>
      <h2 className="text-2xl sm:text-3xl font-bold tracking-tight">
        Used by security professionals, IT teams, and privacy-conscious individuals
      </h2>
    </div>
    <div className="grid gap-5 md:grid-cols-3">
      {testimonials.map((t, i) => (
        <motion.div
          key={t.name}
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: i * 0.1, duration: 0.4 }}
        >
          <Card className="h-full bg-card/40 backdrop-blur-sm border-border/50 hover:border-primary/40 transition-colors">
            <CardContent className="p-6 flex flex-col h-full">
              <Quote className="w-6 h-6 text-primary/60 mb-3" />
              <p className="text-sm text-foreground/90 leading-relaxed flex-1">
                "{t.quote}"
              </p>
              <div className="flex items-center gap-3 mt-5 pt-5 border-t border-border/40">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center text-primary-foreground text-sm font-semibold">
                  {t.initials}
                </div>
                <div>
                  <div className="text-sm font-semibold">{t.name}</div>
                  <div className="text-xs text-muted-foreground">{t.role}</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      ))}
    </div>
  </section>
);