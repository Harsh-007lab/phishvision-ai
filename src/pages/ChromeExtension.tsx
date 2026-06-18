import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Eye, Zap, Lock, Shield, Check, Download, ChevronDown } from "lucide-react";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const features = [
  {
    icon: Eye,
    title: "Scans as you hover",
    body: "Before you even click, PhishVision checks the destination URL. Dangerous links show a red warning badge instantly.",
  },
  {
    icon: Zap,
    title: "Under 1 second",
    body: "Our edge-optimised API returns a verdict before your cursor moves to click. No friction, no waiting.",
  },
  {
    icon: Lock,
    title: "Private by design",
    body: "Only the URL you hover is sent for analysis — never your browsing history, never your cookies, never your data.",
  },
];

const steps = [
  {
    n: "01",
    title: "Install the extension",
    body: "One click from the Chrome Web Store. No account needed to start scanning.",
  },
  {
    n: "02",
    title: "Browse normally",
    body: "A small badge appears on links as you hover: green (safe), amber (suspicious), red (dangerous).",
  },
  {
    n: "03",
    title: "Click with confidence",
    body: "Dangerous links are automatically blocked with a warning page. Safe links load normally.",
  },
];

const faqs = [
  {
    q: "Does it slow down my browser?",
    a: "No. The extension uses a non-blocking API call and only activates on hover, not on every page load. Memory footprint is under 10 MB.",
  },
  {
    q: "Does it send my entire browsing history?",
    a: "Never. Only URLs you hover over are sent for analysis. We do not log browsing sessions, track tabs, or read page content.",
  },
  {
    q: "What about HTTPS sites?",
    a: "HTTPS alone does not mean safe. We check 14 signals beyond SSL — 91% of phishing sites now use HTTPS. The padlock icon is no longer enough.",
  },
  {
    q: "Is it really free?",
    a: "Yes. The extension is free forever for personal use, up to 100 hover checks per day. Pro plans lift the limit for power users.",
  },
];

const BrowserMockup = () => (
  <div className="relative w-full max-w-2xl mx-auto">
    <div className="absolute -inset-8 bg-gradient-to-br from-primary/20 via-accent/10 to-transparent blur-3xl -z-10" />
    <div className="rounded-2xl border border-border bg-card/80 backdrop-blur-xl shadow-2xl overflow-hidden">
      {/* chrome bar */}
      <div className="flex items-center gap-2 px-4 py-3 border-b border-border/60 bg-background/60">
        <div className="flex gap-1.5">
          <span className="w-3 h-3 rounded-full bg-red-500/80" />
          <span className="w-3 h-3 rounded-full bg-yellow-500/80" />
          <span className="w-3 h-3 rounded-full bg-green-500/80" />
        </div>
        <div className="flex-1 mx-4 px-3 py-1.5 rounded-md bg-muted/40 border border-border/40 text-xs text-muted-foreground font-mono truncate">
          https://your-bank.com/account
        </div>
        <div className="flex items-center gap-1.5 px-2 py-1 rounded-md bg-primary/10 border border-primary/20">
          <Shield className="w-3.5 h-3.5 text-primary" />
          <span className="text-[10px] font-semibold text-primary">PhishVision</span>
        </div>
      </div>

      {/* page body */}
      <div className="relative p-8 min-h-[280px] bg-gradient-to-br from-background to-background/50">
        <div className="space-y-3">
          <div className="h-3 w-32 rounded bg-muted/60" />
          <div className="h-2 w-full rounded bg-muted/30" />
          <div className="h-2 w-5/6 rounded bg-muted/30" />
          <div className="h-2 w-4/6 rounded bg-muted/30" />
        </div>

        {/* hovered link */}
        <div className="mt-8 inline-block relative">
          <span className="text-primary underline underline-offset-4 decoration-dotted font-medium cursor-pointer">
            Click here to verify your account →
          </span>

          {/* popup badge */}
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6, duration: 0.4 }}
            className="absolute left-0 top-full mt-3 z-10 w-72 rounded-xl border border-success/30 bg-background/95 backdrop-blur-xl shadow-2xl shadow-success/10 p-4"
          >
            <div className="flex items-center gap-2 mb-3">
              <div className="w-8 h-8 rounded-full bg-success/15 flex items-center justify-center">
                <Check className="w-4 h-4 text-success" />
              </div>
              <div className="flex-1">
                <div className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">PhishVision AI</div>
                <div className="text-sm font-bold text-success">SAFE</div>
              </div>
              <div className="text-right">
                <div className="text-[10px] uppercase text-muted-foreground">Score</div>
                <div className="font-mono text-xl font-bold text-success">91</div>
              </div>
            </div>
            <div className="space-y-1.5 text-[11px] text-muted-foreground">
              <div className="flex justify-between"><span>Domain age</span><span className="text-foreground">12 yrs</span></div>
              <div className="flex justify-between"><span>SSL certificate</span><span className="text-success">Valid</span></div>
              <div className="flex justify-between"><span>Reputation</span><span className="text-success">Trusted</span></div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  </div>
);

const ChromeExtension = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      {/* HERO */}
      <section className="relative overflow-hidden pt-12 pb-24 sm:pt-20 sm:pb-32">
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_30%_20%,hsl(var(--primary)/0.12),transparent_60%)]" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="text-center lg:text-left"
            >
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-border bg-card/50 backdrop-blur text-xs font-medium text-muted-foreground mb-6">
                <span className="w-1.5 h-1.5 rounded-full bg-success animate-pulse" />
                Chrome Extension · Beta
              </div>
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight leading-[1.05] mb-6">
                Scan every link before you click it —{" "}
                <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                  automatically.
                </span>
              </h1>
              <p className="text-lg text-muted-foreground max-w-xl mx-auto lg:mx-0 mb-8">
                The PhishVision Chrome Extension checks every URL you hover over against 14 threat signals in real time. No copy-pasting. No tab-switching. Just instant protection while you browse.
              </p>
              <div className="flex flex-col sm:flex-row gap-3 items-center justify-center lg:justify-start">
                <Button
                  asChild
                  size="lg"
                  className="bg-gradient-to-r from-primary to-accent text-primary-foreground hover:opacity-90 shadow-lg shadow-primary/20 h-12 px-6 text-base"
                >
                  <a href="#chrome-store">
                    <Download className="w-4 h-4 mr-2" />
                    Add to Chrome — It's Free
                  </a>
                </Button>
              </div>
              <div className="mt-4 flex items-center gap-4 justify-center lg:justify-start text-sm text-muted-foreground">
                <span>Also available for</span>
                <a href="#firefox" className="hover:text-foreground transition-colors underline-offset-4 hover:underline">Firefox</a>
                <span className="text-muted-foreground/40">·</span>
                <a href="#edge" className="hover:text-foreground transition-colors underline-offset-4 hover:underline">Edge</a>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6, delay: 0.1 }}
            >
              <BrowserMockup />
            </motion.div>
          </div>
        </div>
      </section>

      {/* FEATURES */}
      <section className="py-20 sm:py-28 border-t border-border/40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="text-center max-w-2xl mx-auto mb-14">
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight mb-4">
              Built for the way you actually browse
            </h2>
            <p className="text-muted-foreground">
              Three things every link-checker should do well — and we obsess over all three.
            </p>
          </div>
          <div className="grid gap-6 md:grid-cols-3">
            {features.map((f, i) => (
              <motion.div
                key={f.title}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: i * 0.08 }}
                className="group rounded-2xl border border-border bg-card/60 backdrop-blur p-6 hover:border-primary/40 hover:bg-card/80 transition-all"
              >
                <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-primary/15 to-accent/15 border border-primary/20 flex items-center justify-center mb-4">
                  <f.icon className="w-5 h-5 text-primary" />
                </div>
                <h3 className="text-lg font-semibold mb-2">{f.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{f.body}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section className="py-20 sm:py-28 border-t border-border/40 bg-gradient-to-b from-transparent via-card/20 to-transparent">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="text-center max-w-2xl mx-auto mb-14">
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight mb-4">
              How the extension works
            </h2>
            <p className="text-muted-foreground">Three steps to safer browsing — start to finish in under a minute.</p>
          </div>
          <div className="grid gap-6 md:grid-cols-3">
            {steps.map((s, i) => (
              <motion.div
                key={s.n}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: i * 0.08 }}
                className="relative rounded-2xl border border-border bg-card/60 backdrop-blur p-6"
              >
                <div className="font-mono text-3xl font-bold bg-gradient-to-br from-primary to-accent bg-clip-text text-transparent mb-3">
                  {s.n}
                </div>
                <h3 className="text-lg font-semibold mb-2">{s.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{s.body}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* SOCIAL PROOF */}
      <section className="py-12 border-y border-border/40 bg-card/30">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 text-center">
          <div className="inline-flex items-center gap-3 text-sm sm:text-base">
            <div className="flex -space-x-2">
              {[0, 1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="w-8 h-8 rounded-full border-2 border-background bg-gradient-to-br from-primary/40 to-accent/40"
                />
              ))}
            </div>
            <p className="text-muted-foreground">
              Join <span className="font-bold text-foreground">12,400+ users</span> protecting themselves while they browse
            </p>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-20 sm:py-28">
        <div className="max-w-3xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight mb-4">
              Extension FAQ
            </h2>
            <p className="text-muted-foreground">Everything you should know before installing.</p>
          </div>
          <Accordion type="single" collapsible className="space-y-3">
            {faqs.map((f, i) => (
              <AccordionItem
                key={i}
                value={`item-${i}`}
                className="rounded-xl border border-border bg-card/60 backdrop-blur px-5 data-[state=open]:border-primary/30"
              >
                <AccordionTrigger className="text-left font-medium hover:no-underline py-4">
                  {f.q}
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground leading-relaxed pb-4">
                  {f.a}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </section>

      {/* BOTTOM CTA */}
      <section className="py-20 sm:py-28 border-t border-border/40">
        <div className="max-w-4xl mx-auto px-4 sm:px-6">
          <div className="relative overflow-hidden rounded-3xl border border-primary/20 bg-gradient-to-br from-primary/10 via-card/60 to-accent/10 backdrop-blur p-10 sm:p-16 text-center">
            <div className="absolute -top-20 -right-20 w-64 h-64 bg-primary/20 rounded-full blur-3xl" />
            <div className="absolute -bottom-20 -left-20 w-64 h-64 bg-accent/20 rounded-full blur-3xl" />
            <div className="relative">
              <h2 className="text-3xl sm:text-4xl font-bold tracking-tight mb-4">
                Ready to browse safely?
              </h2>
              <p className="text-muted-foreground mb-8 max-w-md mx-auto">
                Install in one click. No account required. Free forever for personal use.
              </p>
              <Button
                asChild
                size="lg"
                className="bg-gradient-to-r from-primary to-accent text-primary-foreground hover:opacity-90 shadow-lg shadow-primary/20 h-12 px-6 text-base"
              >
                <a href="#chrome-store">
                  <Download className="w-4 h-4 mr-2" />
                  Add to Chrome — Free
                </a>
              </Button>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default ChromeExtension;