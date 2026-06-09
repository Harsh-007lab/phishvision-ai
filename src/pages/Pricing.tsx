import { useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Check, X, Sparkles, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Footer } from "@/components/Footer";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

type Billing = "monthly" | "annual";

interface Tier {
  name: string;
  tagline: string;
  monthly: number;
  annual: number;
  annualSavings?: string;
  popular?: boolean;
  cta: string;
  ctaHref: string;
  features: string[];
}

const TIERS: Tier[] = [
  {
    name: "Free",
    tagline: "For curious individuals",
    monthly: 0,
    annual: 0,
    cta: "Get Started Free",
    ctaHref: "/signup",
    features: [
      "20 URL scans per day",
      "Basic threat signals (7 of 14)",
      "30-day scan history",
      "Shareable scan reports",
      "No credit card required",
    ],
  },
  {
    name: "Pro",
    tagline: "For power users & creators",
    monthly: 9,
    annual: 79,
    annualSavings: "Save 27%",
    popular: true,
    cta: "Start 14-Day Free Trial",
    ctaHref: "/signup?plan=pro",
    features: [
      "Unlimited URL scans",
      "All 14 threat signals",
      "Unlimited scan history",
      "QR code scanning (upload image)",
      "Bulk URL scanning (up to 100 URLs via CSV)",
      "Priority scan queue (faster results)",
      "API access (1,000 requests/day)",
      "Email alerts on verdict changes",
    ],
  },
  {
    name: "Team",
    tagline: "For security-conscious teams",
    monthly: 49,
    annual: 420,
    annualSavings: "Save 28%",
    cta: "Start Team Trial",
    ctaHref: "/signup?plan=team",
    features: [
      "Everything in Pro",
      "Up to 10 team members",
      "Shared scan history & team dashboard",
      "Weekly threat digest email report",
      "10,000 API requests/day",
      "Bulk scanning up to 1,000 URLs",
      "Dedicated support email",
    ],
  },
];

const COMPARISON: { label: string; values: [string | boolean, string | boolean, string | boolean] }[] = [
  { label: "Daily URL scans", values: ["20/day", "Unlimited", "Unlimited"] },
  { label: "Threat signals", values: ["7 of 14", "All 14", "All 14"] },
  { label: "Scan history", values: ["30 days", "Unlimited", "Unlimited"] },
  { label: "Shareable reports", values: [true, true, true] },
  { label: "QR code scanning", values: [false, true, true] },
  { label: "Bulk CSV scanning", values: [false, "100 URLs", "1,000 URLs"] },
  { label: "Priority scan queue", values: [false, true, true] },
  { label: "API access", values: [false, "1,000 req/day", "10,000 req/day"] },
  { label: "Email alerts on verdict change", values: [false, true, true] },
  { label: "Team members", values: ["1", "1", "Up to 10"] },
  { label: "Shared team dashboard", values: [false, false, true] },
  { label: "Weekly threat digest", values: [false, false, true] },
  { label: "Dedicated support email", values: [false, false, true] },
];

const FAQS = [
  {
    q: "Do you store the URLs I scan?",
    a: "We temporarily store scan results for your history feature. We never sell URL data or share it with third parties. See our Privacy Policy.",
  },
  {
    q: "What happens when my free scans run out?",
    a: "You can sign up for a free account and get 20 scans/day. For unlimited scans, upgrade to Pro.",
  },
  {
    q: "Can I cancel anytime?",
    a: "Yes, cancel anytime. No long-term contracts. Your data remains accessible for 30 days after cancellation.",
  },
  {
    q: "Do you offer refunds?",
    a: "Yes, 30-day no-questions-asked refunds.",
  },
  {
    q: "Is there an API?",
    a: "Yes — Pro plan includes 1,000 API requests/day. Team plan includes 10,000/day. See our API docs.",
  },
];

function CellValue({ value }: { value: string | boolean }) {
  if (value === true) return <Check className="w-5 h-5 text-primary mx-auto" aria-label="Included" />;
  if (value === false) return <X className="w-5 h-5 text-muted-foreground/40 mx-auto" aria-label="Not included" />;
  return <span className="text-sm">{value}</span>;
}

export default function Pricing() {
  const [billing, setBilling] = useState<Billing>("monthly");
  const annual = billing === "annual";

  return (
    <div className="min-h-screen relative overflow-x-hidden">
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/20 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-accent/20 rounded-full blur-3xl" />
      </div>

      <header className="relative z-10 flex items-center justify-between p-4 sm:p-6">
        <Button asChild variant="ghost" size="sm" className="gap-2">
          <Link to="/"><ArrowLeft className="w-4 h-4" />Back</Link>
        </Button>
      </header>

      <main className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 pb-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-10"
        >
          <h1 className="text-4xl sm:text-5xl font-bold mb-4 bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
            Simple, transparent pricing
          </h1>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Start free. Upgrade when you need unlimited scans, the full threat-signal
            suite, bulk scanning, and the API.
          </p>

          <div className="inline-flex items-center gap-3 mt-8 glass rounded-full px-4 py-2">
            <span className={!annual ? "font-semibold" : "text-muted-foreground"}>Monthly</span>
            <Switch checked={annual} onCheckedChange={(v) => setBilling(v ? "annual" : "monthly")} aria-label="Toggle annual billing" />
            <span className={annual ? "font-semibold" : "text-muted-foreground"}>
              Annual <span className="text-xs text-primary ml-1">(save ~27%)</span>
            </span>
          </div>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-6 mb-20">
          {TIERS.map((t, i) => {
            const price = annual ? t.annual : t.monthly;
            const suffix = t.monthly === 0 ? "" : annual ? "/year" : "/month";
            return (
              <motion.div
                key={t.name}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
              >
                <Card
                  className={`relative h-full p-6 glass ${
                    t.popular ? "border-primary/60 ring-1 ring-primary/40 shadow-[0_0_40px_-10px_hsl(var(--primary)/0.5)]" : ""
                  }`}
                >
                  {t.popular && (
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2 flex items-center gap-1 bg-gradient-to-r from-primary to-accent text-primary-foreground text-xs font-semibold px-3 py-1 rounded-full">
                      <Sparkles className="w-3 h-3" /> Most Popular
                    </div>
                  )}
                  <div className="mb-6">
                    <h2 className="text-2xl font-bold">{t.name}</h2>
                    <p className="text-sm text-muted-foreground mt-1">{t.tagline}</p>
                  </div>
                  <div className="mb-6">
                    <div className="flex items-baseline gap-1">
                      <span className="text-4xl font-bold">${price}</span>
                      {suffix && <span className="text-muted-foreground">{suffix}</span>}
                    </div>
                    {annual && t.annualSavings && (
                      <p className="text-xs text-primary mt-1">{t.annualSavings}</p>
                    )}
                  </div>
                  <Button
                    asChild
                    className="w-full mb-6"
                    variant={t.popular ? "default" : "outline"}
                  >
                    <Link to={t.ctaHref}>{t.cta}</Link>
                  </Button>
                  <ul className="space-y-3">
                    {t.features.map((f) => (
                      <li key={f} className="flex items-start gap-2 text-sm">
                        <Check className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                        <span>{f}</span>
                      </li>
                    ))}
                  </ul>
                </Card>
              </motion.div>
            );
          })}
        </div>

        <section className="mb-20">
          <h2 className="text-2xl sm:text-3xl font-bold text-center mb-8">Compare plans</h2>
          <Card className="glass overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-1/3">Feature</TableHead>
                  <TableHead className="text-center">Free</TableHead>
                  <TableHead className="text-center text-primary">Pro</TableHead>
                  <TableHead className="text-center">Team</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {COMPARISON.map((row) => (
                  <TableRow key={row.label}>
                    <TableCell className="font-medium">{row.label}</TableCell>
                    <TableCell className="text-center"><CellValue value={row.values[0]} /></TableCell>
                    <TableCell className="text-center"><CellValue value={row.values[1]} /></TableCell>
                    <TableCell className="text-center"><CellValue value={row.values[2]} /></TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Card>
        </section>

        <section className="max-w-3xl mx-auto">
          <h2 className="text-2xl sm:text-3xl font-bold text-center mb-8">
            Frequently asked questions
          </h2>
          <Card className="glass p-2 sm:p-4">
            <Accordion type="single" collapsible className="w-full">
              {FAQS.map((f, i) => (
                <AccordionItem key={i} value={`item-${i}`}>
                  <AccordionTrigger className="text-left px-2">{f.q}</AccordionTrigger>
                  <AccordionContent className="px-2 text-muted-foreground">{f.a}</AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </Card>
        </section>
      </main>

      <Footer />
    </div>
  );
}