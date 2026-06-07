import { useState } from "react";
import { Shield, Loader2, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { motion, AnimatePresence } from "framer-motion";
import { VoiceInput } from "./VoiceInput";
import { useTranslation } from "react-i18next";
import { ScanningProgress } from "./ScanningProgress";
import { ScanResult as ScanResultView, type ScanResultData } from "./ScanResult";

export const Scanner = () => {
  const [url, setUrl] = useState("");
  const [isScanning, setIsScanning] = useState(false);
  const [isExplaining, setIsExplaining] = useState(false);
  const [result, setResult] = useState<ScanResultData | null>(null);
  const { t } = useTranslation();

  const handleVoiceTranscript = (transcript: string) => {
    setUrl(transcript);
    // Auto-trigger scan after a short delay
    setTimeout(() => {
      handleScan(false);
    }, 500);
  };

  const handleScan = async (includeExplanation = false) => {
    if (!url.trim()) {
      toast({
        title: "Error",
        description: "Please enter a URL to scan",
        variant: "destructive",
      });
      return;
    }

    if (includeExplanation) {
      setIsExplaining(true);
    } else {
      setIsScanning(true);
      setResult(null);
    }

    try {
      const { data, error } = await supabase.functions.invoke('phishing-detector', {
        body: { url: url.trim(), includeExplanation }
      });

      if (error) throw error;

      // Try to recover the saved scan id so the result has a shareable link.
      let scanId: string | undefined;
      try {
        const { data: latest } = await supabase
          .from("scan_history_public" as any)
          .select("id")
          .eq("url", url.trim())
          .order("created_at", { ascending: false })
          .limit(1);
        const row = Array.isArray(latest) ? (latest[0] as { id?: string } | undefined) : undefined;
        scanId = row?.id;
      } catch {
        /* non-fatal */
      }

      const scanResult: ScanResultData = {
        id: scanId ?? result?.id,
        url: url.trim(),
        label: data.label,
        confidence: data.confidence,
        score: data.score,
        explanation: data.explanation,
        timestamp: new Date(),
      };

      setResult(scanResult);

      if (!includeExplanation) {
        toast({
          title: "Scan Complete",
          description: `URL analyzed: ${data.label === 'phishing' ? 'Phishing detected!' : 'URL appears safe'}`,
        });
      } else {
        toast({
          title: "AI Analysis Complete",
          description: "Generated detailed explanation",
        });
      }
    } catch (error) {
      console.error('Scan error:', error);
      toast({
        title: "Scan Failed",
        description: "Failed to analyze URL. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsScanning(false);
      setIsExplaining(false);
    }
  };

  const handleExplain = () => {
    handleScan(true);
  };

  const handleScanAnother = () => {
    setResult(null);
    setUrl("");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <div className="w-full max-w-5xl min-w-0 mx-auto space-y-6 sm:space-y-8 p-3 sm:p-6 overflow-hidden">
      {/* Header with glitch effect */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center space-y-5"
      >
        <motion.div
          className="flex items-center justify-center gap-3"
          whileHover={{ scale: 1.05 }}
          transition={{ type: "spring", stiffness: 300 }}
        >
          <Shield className="w-12 h-12 text-primary animate-pulse-slow" />
          <h1 className="text-3xl sm:text-5xl font-bold bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent animate-gradient leading-tight">
            Don't click that link — scan it first.
          </h1>
        </motion.div>
        <p className="text-base sm:text-lg text-muted-foreground max-w-3xl mx-auto leading-relaxed">
          PhishVision checks 14 threat signals in under 3 seconds: domain age, SSL validity, WHOIS data, malware blacklists, redirect chains, visual brand impersonation, and more. Free. No login required.
        </p>
        <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-3 pt-2">
          {[
            "14 threat signals checked",
            "< 3 second scan time",
            "Free — no account needed",
          ].map((stat) => (
            <span
              key={stat}
              className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-3 py-1 text-xs sm:text-sm font-medium text-foreground/90 backdrop-blur-sm"
            >
              <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
              {stat}
            </span>
          ))}
        </div>
      </motion.div>

      {/* Scanner Input */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="glass rounded-2xl p-4 sm:p-8 space-y-6 glow-primary w-full min-w-0 overflow-hidden"
      >
        <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
          <div className="flex gap-2 sm:gap-4 flex-1">
            <Input
              placeholder={t('scanPlaceholder')}
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && !isScanning && handleScan(false)}
              className="flex-1 h-12 sm:h-14 text-base sm:text-lg glass border-primary/30 focus:border-primary transition-all"
              disabled={isScanning || isExplaining}
            />
            <VoiceInput onTranscript={handleVoiceTranscript} />
          </div>
          
          <Button
            onClick={() => handleScan(false)}
            disabled={isScanning || isExplaining}
            size="lg"
            className="h-12 sm:h-14 px-6 sm:px-8 bg-primary hover:bg-primary/90 text-primary-foreground font-semibold transition-all hover:scale-105 w-full sm:w-auto"
          >
            {isScanning ? (
              <>
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                {t('scanning')}
              </>
            ) : (
              <>
                <Search className="mr-2 h-5 w-5" />
                {t('scanButton')}
              </>
            )}
          </Button>
        </div>

        {/* Scanning state + Result */}
        <AnimatePresence mode="wait">
          {isScanning && !result && <ScanningProgress key="progress" />}
          {result && !isScanning && (
            <ScanResultView
              key="result"
              result={result}
              onScanAnother={handleScanAnother}
              onExplain={handleExplain}
              isExplaining={isExplaining}
            />
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
};
