import { useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft, Copy, Check, Terminal, Zap, Shield, Code2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Footer } from "@/components/Footer";
import { cn } from "@/lib/utils";

const Pills = [
  { label: "RESTful JSON", icon: Code2 },
  { label: "< 3s response time", icon: Zap },
  { label: "Free tier: 100 req/day", icon: Shield },
];

const RateLimits = [
  { plan: "Free", daily: "100", minute: "5", bulk: "10 URLs" },
  { plan: "Pro", daily: "1,000", minute: "60", bulk: "100 URLs" },
  { plan: "Team", daily: "10,000", minute: "300", bulk: "1,000 URLs" },
];

const Endpoints = [
  {
    id: "scan",
    method: "POST",
    path: "/api/v1/scan",
    description: "Submit a single URL for phishing analysis.",
    request: {
      url: "https://suspicious-site.com/login",
      options: {
        include_signals: true,
        include_explanation: true,
      },
    },
    response: {
      scan_id: "sc_8f3k2m9x",
      url: "https://suspicious-site.com/login",
      threat_score: 87,
      verdict: "dangerous",
      scanned_at: "2026-05-31T14:22:03Z",
      explanation:
        "This URL shows multiple high-confidence phishing indicators...",
      signals: {
        domain_age_days: 4,
        whois_privacy: true,
        ssl_valid: false,
        redirect_count: 3,
        blacklist_hits: 2,
        typosquatting_score: 0.92,
        ai_confidence: 0.94,
      },
    },
  },
  {
    id: "get-scan",
    method: "GET",
    path: "/api/v1/scan/{scan_id}",
    description: "Retrieve a previously completed scan result by its ID.",
    request: null,
    response: {
      scan_id: "sc_8f3k2m9x",
      url: "https://suspicious-site.com/login",
      threat_score: 87,
      verdict: "dangerous",
      scanned_at: "2026-05-31T14:22:03Z",
      explanation:
        "This URL shows multiple high-confidence phishing indicators...",
      signals: {
        domain_age_days: 4,
        whois_privacy: true,
        ssl_valid: false,
        redirect_count: 3,
        blacklist_hits: 2,
        typosquatting_score: 0.92,
        ai_confidence: 0.94,
      },
    },
  },
  {
    id: "bulk",
    method: "POST",
    path: "/api/v1/scan/bulk",
    description: "Submit up to 100 URLs in a single batch for bulk scanning.",
    request: {
      urls: ["https://url1.com", "https://url2.com"],
      webhook_url: "https://yoursite.com/webhook",
    },
    response: {
      batch_id: "batch_9x2k1m3p",
      status: "accepted",
      urls_submitted: 2,
      urls_limit: 100,
      estimated_seconds: 5,
      check_status_at: "https://api.phishvision.ai/v1/bulk/batch_9x2k1m3p",
    },
  },
];

const CodeExamples = [
  {
    lang: "javascript",
    label: "JavaScript",
    code: `const res = await fetch("https://api.phishvision.ai/v1/scan", {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
    "Authorization": "Bearer YOUR_API_KEY"
  },
  body: JSON.stringify({
    url: "https://suspicious-site.com/login",
    options: {
      include_signals: true,
      include_explanation: true
    }
  })
});
const data = await res.json();
console.log(data.verdict, data.threat_score);`,
  },
  {
    lang: "python",
    label: "Python",
    code: `import requests

response = requests.post(
    "https://api.phishvision.ai/v1/scan",
    headers={
        "Content-Type": "application/json",
        "Authorization": "Bearer YOUR_API_KEY"
    },
    json={
        "url": "https://suspicious-site.com/login",
        "options": {
            "include_signals": True,
            "include_explanation": True
        }
    }
)

data = response.json()
print(data["verdict"], data["threat_score"])`,
  },
  {
    lang: "curl",
    label: "curl",
    code: `curl -X POST https://api.phishvision.ai/v1/scan \\
  -H "Content-Type: application/json" \\
  -H "Authorization: Bearer YOUR_API_KEY" \\
  -d '{
    "url": "https://suspicious-site.com/login",
    "options": {
      "include_signals": true,
      "include_explanation": true
    }
  }'`,
  },
];

function CodeBlock({ code, className }: { code: string; className?: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <div className={cn("relative group", className)}>
      <pre className="overflow-x-auto rounded-lg bg-black/60 border border-border/50 p-4 text-sm font-mono leading-relaxed text-foreground/90">
        <code>{code}</code>
      </pre>
      <Button
        size="icon"
        variant="ghost"
        className="absolute top-2 right-2 h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity bg-background/80"
        onClick={() => {
          navigator.clipboard.writeText(code);
          setCopied(true);
          setTimeout(() => setCopied(false), 1500);
        }}
        aria-label="Copy code"
      >
        {copied ? <Check className="w-4 h-4 text-primary" /> : <Copy className="w-4 h-4" />}
      </Button>
    </div>
  );
}

function EndpointCard({ endpoint, index }: { endpoint: typeof Endpoints[0]; index: number }) {
  return (
    <motion.section
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.1 * index }}
      className="scroll-mt-24"
      id={endpoint.id}
    >
      <Card className="glass p-6 sm:p-8 overflow-hidden">
        <div className="flex flex-wrap items-center gap-3 mb-3">
          <Badge
            variant={endpoint.method === "GET" ? "secondary" : "default"}
            className="text-xs font-bold tracking-wide uppercase px-2 py-1"
          >
            {endpoint.method}
          </Badge>
          <code className="text-sm sm:text-base font-mono text-primary">{endpoint.path}</code>
        </div>
        <p className="text-muted-foreground mb-6">{endpoint.description}</p>

        <div className="grid lg:grid-cols-2 gap-6">
          {endpoint.request && (
            <div>
              <h4 className="text-sm font-semibold mb-2 flex items-center gap-2">
                <Terminal className="w-4 h-4 text-primary" /> Request
              </h4>
              <CodeBlock code={JSON.stringify(endpoint.request, null, 2)} />
            </div>
          )}
          <div className={endpoint.request ? "" : "lg:col-span-2"}>
            <h4 className="text-sm font-semibold mb-2 flex items-center gap-2">
              <Terminal className="w-4 h-4 text-accent" /> Response
            </h4>
            <CodeBlock code={JSON.stringify(endpoint.response, null, 2)} />
          </div>
        </div>
      </Card>
    </motion.section>
  );
}

export default function ApiDocs() {
  return (
    <div className="min-h-screen relative overflow-x-hidden">
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-primary/10 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] bg-accent/10 rounded-full blur-3xl" />
      </div>

      <header className="relative z-10 flex items-center justify-between p-4 sm:p-6">
        <Button asChild variant="ghost" size="sm" className="gap-2">
          <Link to="/">
            <ArrowLeft className="w-4 h-4" /> Back
          </Link>
        </Button>
      </header>

      <main className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 pb-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <h1 className="text-4xl sm:text-5xl font-bold mb-4 bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
            PhishVision AI API
          </h1>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Integrate phishing detection into any product. RESTful JSON API. Free tier available.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-3 mt-8">
            {Pills.map((pill) => (
              <div
                key={pill.label}
                className="flex items-center gap-2 px-4 py-2 rounded-full glass text-sm font-medium"
              >
                <pill.icon className="w-4 h-4 text-primary" />
                {pill.label}
              </div>
            ))}
          </div>
        </motion.div>

        <div className="grid lg:grid-cols-[1fr_300px] gap-8 items-start">
          <div className="space-y-12">
            <motion.section
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              id="auth"
              className="scroll-mt-24"
            >
              <h2 className="text-2xl sm:text-3xl font-bold mb-4">Authentication</h2>
              <Card className="glass p-6 sm:p-8">
                <p className="text-muted-foreground mb-4">
                  Get your API key from the dashboard, then include it in every request as a Bearer token.
                </p>
                <div className="space-y-3">
                  <p className="text-sm">
                    <span className="font-semibold">GET your API key:</span>{" "}
                    <a
                      href="https://phishvision.ai/dashboard/api-keys"
                      className="text-primary underline underline-offset-2"
                    >
                      https://phishvision.ai/dashboard/api-keys
                    </a>
                  </p>
                  <CodeBlock code={`Authorization: Bearer YOUR_API_KEY`} />
                </div>
              </Card>
            </motion.section>

            <motion.section
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <h2 className="text-2xl sm:text-3xl font-bold mb-4">Endpoints</h2>
              <div className="space-y-6">
                {Endpoints.map((endpoint, i) => (
                  <EndpointCard key={endpoint.id} endpoint={endpoint} index={i} />
                ))}
              </div>
            </motion.section>

            <motion.section
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              <h2 className="text-2xl sm:text-3xl font-bold mb-4">Rate limits</h2>
              <Card className="glass overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Plan</TableHead>
                      <TableHead className="text-right">Requests/day</TableHead>
                      <TableHead className="text-right">Requests/minute</TableHead>
                      <TableHead className="text-right">Bulk size</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {RateLimits.map((row) => (
                      <TableRow key={row.plan}>
                        <TableCell className="font-semibold">{row.plan}</TableCell>
                        <TableCell className="text-right">{row.daily}</TableCell>
                        <TableCell className="text-right">{row.minute}</TableCell>
                        <TableCell className="text-right">{row.bulk}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </Card>
            </motion.section>

            <motion.section
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
            >
              <h2 className="text-2xl sm:text-3xl font-bold mb-4">Code examples</h2>
              <Card className="glass p-6 sm:p-8">
                <Tabs defaultValue="javascript" className="w-full">
                  <TabsList className="mb-4 bg-background/60 border border-border/50">
                    {CodeExamples.map((ex) => (
                      <TabsTrigger key={ex.lang} value={ex.lang} className="text-sm">
                        {ex.label}
                      </TabsTrigger>
                    ))}
                  </TabsList>
                  {CodeExamples.map((ex) => (
                    <TabsContent key={ex.lang} value={ex.lang}>
                      <CodeBlock code={ex.code} />
                    </TabsContent>
                  ))}
                </Tabs>
              </Card>
            </motion.section>
          </div>

          <motion.aside
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.5 }}
            className="lg:sticky lg:top-24 space-y-6"
          >
            <Card className="glass p-6 border-primary/30 bg-gradient-to-br from-primary/10 to-accent/5">
              <h3 className="text-lg font-bold mb-2">Ready to integrate?</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Get your free API key and start scanning URLs in minutes. No credit card required.
              </p>
              <Button
                asChild
                className="w-full bg-gradient-to-r from-primary to-accent text-primary-foreground hover:opacity-90 shadow-lg shadow-primary/20"
              >
                <Link to="/signup">Sign Up Free</Link>
              </Button>
            </Card>

            <Card className="glass p-6">
              <h3 className="text-sm font-semibold mb-3">On this page</h3>
              <nav className="space-y-2 text-sm">
                <a href="#auth" className="block text-muted-foreground hover:text-primary transition-colors">
                  Authentication
                </a>
                {Endpoints.map((e) => (
                  <a
                    key={e.id}
                    href={`#${e.id}`}
                    className="block text-muted-foreground hover:text-primary transition-colors"
                  >
                    <code className="text-xs mr-2">{e.method}</code>
                    {e.path}
                  </a>
                ))}
                <a href="#rate-limits" className="block text-muted-foreground hover:text-primary transition-colors">
                  Rate limits
                </a>
                <a href="#code-examples" className="block text-muted-foreground hover:text-primary transition-colors">
                  Code examples
                </a>
              </nav>
            </Card>
          </motion.aside>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="mt-16"
        >
          <Card className="glass p-8 sm:p-10 text-center bg-gradient-to-r from-primary/10 via-accent/5 to-primary/10 border-primary/20">
            <h2 className="text-2xl sm:text-3xl font-bold mb-3">
              Get your free API key
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto mb-6">
              Start building with 100 free requests per day. Upgrade to Pro for 1,000 requests/day and bulk scanning.
            </p>
            <Button
              asChild
              size="lg"
              className="bg-gradient-to-r from-primary to-accent text-primary-foreground hover:opacity-90 shadow-lg shadow-primary/20"
            >
              <Link to="/signup">Sign Up Free</Link>
            </Button>
          </Card>
        </motion.div>
      </main>

      <Footer />
    </div>
  );
}
