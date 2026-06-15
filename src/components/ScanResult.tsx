import { useEffect, useMemo, useState } from "react";
import { motion, useMotionValue, useTransform, animate } from "framer-motion";
import { Link } from "react-router-dom";
import {
  RotateCw,
  Share2,
  Flag,
  ShieldCheck,
  Sparkles,
  Loader2,
  Chrome,
  UserPlus,
  Check,
  Copy,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { PDFReport } from "@/components/PDFReport";
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import {
  computeVerdict,
  deriveThreatSignals,
  type RiskLevel,
  type VerdictBand,
} from "@/lib/threatSignals";

export interface ScanResultData {
  id?: string;
  url: string;
  label: string;
  confidence: number;
  score: number;
  explanation?: string | null;
  timestamp: Date;
}

interface Props {
  result: ScanResultData;
  onScanAnother?: () => void;
  onExplain?: () => void;
  isExplaining?: boolean;
}

const BAND_THEME: Record<
  VerdictBand,
  { ring: string; bg: string; text: string; chip: string }
> = {
  dangerous: {
    ring: "stroke-destructive",
    bg: "from-destructive/30 to-destructive/5 border-destructive/60",
    text: "text-destructive",
    chip: "bg-destructive text-destructive-foreground",
  },
  suspicious: {
    ring: "stroke-orange-500",
    bg: "from-orange-500/25 to-orange-500/5 border-orange-500/60",
    text: "text-orange-500",
    chip: "bg-orange-500 text-white",
  },
  unverified: {
    ring: "stroke-yellow-400",
    bg: "from-yellow-400/20 to-yellow-400/5 border-yellow-400/60",
    text: "text-yellow-500",
    chip: "bg-yellow-400 text-black",
  },
  safe: {
    ring: "stroke-success",
    bg: "from-success/25 to-success/5 border-success/60",
    text: "text-success",
    chip: "bg-success text-white",
  },
};

const RISK_STYLE: Record<RiskLevel, { label: string; cls: string }> = {
  high: { label: "HIGH RISK", cls: "bg-destructive/20 text-destructive border-destructive/40" },
  medium: { label: "MEDIUM RISK", cls: "bg-orange-500/20 text-orange-500 border-orange-500/40" },
  low: { label: "LOW RISK", cls: "bg-yellow-400/20 text-yellow-500 border-yellow-400/40" },
  clear: { label: "CLEAR", cls: "bg-success/20 text-success border-success/40" },
};

function ScoreGauge({
  score,
  band,
}: {
  score: number;
  band: VerdictBand;
}) {
  const theme = BAND_THEME[band];
  const radius = 70;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (score / 100) * circumference;

  const count = useMotionValue(0);
  const rounded = useTransform(count, (v) => Math.round(v));
  const [display, setDisplay] = useState(0);

  useEffect(() => {
    const controls = animate(count, score, { duration: 1, ease: "easeOut" });
    const unsub = rounded.on("change", (v) => setDisplay(v));
    return () => {
      controls.stop();
      unsub();
    };
  }, [score, count, rounded]);

  return (
    <div className="relative w-44 h-44 flex-shrink-0">
      <svg viewBox="0 0 160 160" className="w-full h-full -rotate-90">
        <circle
          cx="80"
          cy="80"
          r={radius}
          strokeWidth="12"
          className="stroke-secondary/60"
          fill="none"
        />
        <motion.circle
          cx="80"
          cy="80"
          r={radius}
          strokeWidth="12"
          strokeLinecap="round"
          fill="none"
          className={theme.ring}
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: offset }}
          transition={{ duration: 0.8, ease: "easeOut" }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span
          className={`font-mono leading-none ${theme.text}`}
          style={{ fontSize: "56px", fontWeight: 500 }}
        >
          {display}
        </span>
        <span className="text-[13px] text-muted-foreground mt-1 tracking-wide">
          / 100 safety
        </span>
      </div>
    </div>
  );
}

function StayProtectedCTA() {
  return (
    <div className="rounded-2xl border border-primary/30 bg-gradient-to-br from-primary/15 to-accent/10 p-5 sm:p-6">
      <div className="flex flex-col md:flex-row items-start md:items-center gap-4">
        <div className="flex-1">
          <p className="text-sm font-semibold text-primary uppercase tracking-wide">
            Get protected automatically
          </p>
          <p className="mt-1 text-sm text-foreground/90">
            Install the PhishVision Chrome Extension and every link you hover
            over gets scanned before you click. Free.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button asChild size="sm" className="gap-2">
            <a
              href="https://chromewebstore.google.com/"
              target="_blank"
              rel="noreferrer"
            >
              <Chrome className="w-4 h-4" />
              Install Chrome Extension →
            </a>
          </Button>
          <Button asChild variant="outline" size="sm" className="gap-2">
            <Link to="/auth">
              <UserPlus className="w-4 h-4" />
              Create Free Account →
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
}

function plainLanguageVerdict(
  band: VerdictBand,
  url: string,
  signals: ReturnType<typeof deriveThreatSignals>,
) {
  const high = signals.filter((s) => s.risk === "high").map((s) => s.name.toLowerCase());
  let host = url;
  try {
    host = new URL(url).hostname;
  } catch {
    /* noop */
  }

  if (band === "dangerous") {
    return `This URL shows multiple high-confidence phishing indicators${
      high.length ? ` — including ${high.slice(0, 3).join(", ")}` : ""
    }. Do not enter any personal information on ${host}. If you received this link via email or SMS, report it to your email provider and delete the message.`;
  }
  if (band === "suspicious") {
    return `${host} shows mixed signals. Some checks raised concerns${
      high.length ? ` (notably ${high.slice(0, 2).join(", ")})` : ""
    }, but others came back clean. Avoid entering credentials or payment details until you can independently verify the domain.`;
  }
  if (band === "unverified") {
    return `No active threats were detected on ${host}, but this domain doesn't have a long-established reputation. Standard caution applies — confirm you typed the URL correctly and avoid entering sensitive data unless you're sure of the source.`;
  }
  return `No significant threats detected on ${host}. The domain has been established for some time, uses a valid SSL certificate from a trusted authority, and matches known safe patterns. Standard caution still applies — always verify you're on the correct domain before entering personal information.`;
}

export const ScanResult = ({
  result,
  onScanAnother,
  onExplain,
  isExplaining,
}: Props) => {
  const [copied, setCopied] = useState(false);
  const [reportOpen, setReportOpen] = useState(false);
  const [feedbackVerdict, setFeedbackVerdict] = useState<string>("");
  const [feedbackNote, setFeedbackNote] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const verdict = useMemo(
    () => computeVerdict(result.label, result.confidence),
    [result.label, result.confidence],
  );
  const signals = useMemo(
    () => deriveThreatSignals(result.url, result.label, result.confidence),
    [result.url, result.label, result.confidence],
  );
  const theme = BAND_THEME[verdict.band];
  const verdictText =
    result.explanation && result.explanation.length > 40
      ? result.explanation
      : plainLanguageVerdict(verdict.band, result.url, signals);

  const handleShare = async () => {
    if (!result.id) {
      toast({
        title: "Share unavailable",
        description: "This scan wasn't saved — re-run it to get a shareable link.",
        variant: "destructive",
      });
      return;
    }
    const shareUrl = `${window.location.origin}/report/${result.id}`;
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      toast({ title: "Link copied", description: shareUrl });
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      window.prompt("Copy this link", shareUrl);
    }
  };

  const submitFeedback = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!feedbackVerdict) return;
    setSubmitting(true);
    try {
      await supabase.functions.invoke("report-phishing", {
        body: {
          url: result.url,
          description: `Verdict feedback: ${feedbackVerdict}. ${feedbackNote || ""}`.slice(0, 1900),
        },
      });
      toast({
        title: "Feedback submitted",
        description: "Thanks — we use this to improve detection accuracy.",
      });
      setReportOpen(false);
      setFeedbackVerdict("");
      setFeedbackNote("");
    } catch {
      toast({
        title: "Failed to submit",
        description: "Please try again later.",
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-5"
    >
      {/* Threat Score Card */}
      <div
        className={`rounded-2xl p-5 sm:p-7 border-2 bg-gradient-to-br ${theme.bg}`}
      >
        <div className="flex flex-col md:flex-row items-center md:items-start gap-6">
          <ScoreGauge score={verdict.safetyScore} band={verdict.band} />
          <div className="flex-1 min-w-0 space-y-3 text-center md:text-left">
            <span
              className={`inline-block px-3 py-1 rounded-full text-xs font-bold tracking-wide ${theme.chip}`}
            >
              {verdict.label}
            </span>
            <h2 className={`text-xl sm:text-2xl font-bold ${theme.text}`}>
              {verdict.description}
            </h2>
            <p
              className="block max-w-full overflow-hidden text-ellipsis whitespace-nowrap rounded-md bg-background/40 px-3 py-2 text-sm text-muted-foreground font-mono"
              title={result.url}
            >
              {result.url}
            </p>
            <p className="text-xs text-muted-foreground">
              Scanned {new Date(result.timestamp).toLocaleString()}
            </p>
          </div>
        </div>
      </div>

      {/* Threat Signals Grid */}
      <div className="glass rounded-2xl p-5 sm:p-6 space-y-4">
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-5 h-5 text-primary" />
          <h3 className="text-lg font-semibold">Threat signals breakdown</h3>
          <span className="ml-auto text-xs text-muted-foreground">
            {signals.length} checks
          </span>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {signals.map((sig, i) => {
            const r = RISK_STYLE[sig.risk];
            return (
              <motion.div
                key={sig.name}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.03 }}
                className="rounded-xl border border-border bg-secondary/30 p-4 space-y-2"
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="text-sm font-semibold">{sig.name}</span>
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${r.cls}`}
                  >
                    {r.label}
                  </span>
                </div>
                <p
                  className="text-sm text-foreground/90 truncate font-mono"
                  title={sig.value}
                >
                  {sig.value}
                </p>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  {sig.explanation}
                </p>
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* What does this mean? */}
      <div className="glass rounded-2xl p-5 sm:p-6 border border-primary/20 space-y-3">
        <div className="flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-primary" />
          <h3 className="text-lg font-semibold">What does this mean?</h3>
          {onExplain && !result.explanation && (
            <Button
              size="sm"
              variant="ghost"
              onClick={onExplain}
              disabled={isExplaining}
              className="ml-auto gap-2"
            >
              {isExplaining ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Sparkles className="w-4 h-4" />
              )}
              Deep AI analysis
            </Button>
          )}
        </div>
        <p className="text-sm sm:text-base leading-relaxed text-foreground/90">
          {verdictText}
        </p>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-wrap gap-2">
        {onScanAnother && (
          <Button onClick={onScanAnother} className="gap-2">
            <RotateCw className="w-4 h-4" />
            Scan another URL
          </Button>
        )}
        <Button variant="outline" onClick={handleShare} className="gap-2">
          {copied ? <Check className="w-4 h-4" /> : <Share2 className="w-4 h-4" />}
          Share this report
        </Button>
        <Button
          variant="outline"
          onClick={() => setReportOpen((o) => !o)}
          className="gap-2"
        >
          <Flag className="w-4 h-4" />
          Report incorrect result
        </Button>
        <PDFReport
          url={result.url}
          label={result.label}
          confidence={result.confidence}
          score={result.score}
          explanation={result.explanation ?? undefined}
        />
      </div>

      {reportOpen && (
        <motion.form
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          onSubmit={submitFeedback}
          className="glass rounded-2xl p-5 space-y-3 border border-border"
        >
          <h4 className="text-sm font-semibold">Was this verdict wrong?</h4>
          <Select value={feedbackVerdict} onValueChange={setFeedbackVerdict}>
            <SelectTrigger className="glass">
              <SelectValue placeholder="Choose the correct verdict…" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="should-be-safe">This is actually safe</SelectItem>
              <SelectItem value="should-be-phishing">This is actually phishing</SelectItem>
              <SelectItem value="should-be-malware">This hosts malware</SelectItem>
              <SelectItem value="other">Other / unclear</SelectItem>
            </SelectContent>
          </Select>
          <Textarea
            value={feedbackNote}
            onChange={(e) => setFeedbackNote(e.target.value)}
            placeholder="Optional: explain why you think the verdict is wrong."
            className="glass min-h-[80px]"
            maxLength={1500}
          />
          <div className="flex justify-end gap-2">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => setReportOpen(false)}
            >
              Cancel
            </Button>
            <Button type="submit" size="sm" disabled={!feedbackVerdict || submitting}>
              {submitting ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                "Submit feedback"
              )}
            </Button>
          </div>
        </motion.form>
      )}

      <StayProtectedCTA />
    </motion.div>
  );
};