import { useState } from "react";
import { Shield, AlertTriangle, Loader2, Search, Copy, RotateCw, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { motion, AnimatePresence } from "framer-motion";
import { VoiceInput } from "./VoiceInput";
import { PDFReport } from "./PDFReport";
import { useTranslation } from "react-i18next";

interface ScanResult {
  url: string;
  label: string;
  confidence: number;
  score: number;
  explanation?: string;
  timestamp: Date;
}

export const Scanner = () => {
  const [url, setUrl] = useState("");
  const [isScanning, setIsScanning] = useState(false);
  const [isExplaining, setIsExplaining] = useState(false);
  const [result, setResult] = useState<ScanResult | null>(null);
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

      const scanResult: ScanResult = {
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

  const handleCopy = () => {
    if (!result) return;
    
    const text = `PhishVision AI Scan Result\n\nURL: ${result.url}\nStatus: ${result.label === 'phishing' ? '⚠️ Phishing Detected' : '✅ Safe'}\nConfidence: ${result.confidence}%${result.explanation ? `\n\nAnalysis: ${result.explanation}` : ''}`;
    
    navigator.clipboard.writeText(text);
    toast({
      title: "Copied!",
      description: "Scan result copied to clipboard",
    });
  };

  const isPhishing = result?.label === 'phishing';

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

        {/* Result Display */}
        <AnimatePresence mode="wait">
          {result && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.5 }}
              className={`rounded-xl p-4 sm:p-6 border-2 transition-all duration-500 w-full min-w-0 overflow-hidden ${
                isPhishing
                  ? 'bg-gradient-to-br from-destructive/20 to-destructive/5 border-destructive glow-danger'
                  : 'bg-gradient-to-br from-success/20 to-success/5 border-success glow-safe'
              }`}
            >
              <div className="flex flex-col sm:flex-row items-start gap-3 sm:gap-4">
                <motion.div
                  animate={isPhishing ? { scale: [1, 1.1, 1] } : { scale: 1 }}
                  transition={{ repeat: isPhishing ? Infinity : 0, duration: 2 }}
                  className="flex-shrink-0"
                >
                  {isPhishing ? (
                    <AlertTriangle className="w-10 h-10 sm:w-12 sm:h-12 text-destructive" />
                  ) : (
                    <Shield className="w-10 h-10 sm:w-12 sm:h-12 text-success" />
                  )}
                </motion.div>
                
                <div className="flex-1 min-w-0 space-y-3">
                  <h3 className={`text-xl sm:text-2xl font-bold ${isPhishing ? 'text-destructive' : 'text-success'}`}>
                    {isPhishing ? t('phishingDetected') : t('safeWebsite')}
                  </h3>
                  <p
                    className="block max-w-full overflow-hidden text-ellipsis whitespace-nowrap rounded-md bg-secondary/40 px-3 py-2 text-sm text-muted-foreground font-mono"
                    title={result.url}
                  >
                    {result.url}
                  </p>
                  
                  {/* Confidence Bar */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="font-medium">{t('threatConfidence')}</span>
                      <span className={`font-bold ${isPhishing ? 'text-destructive' : 'text-success'}`}>
                        {result.confidence}%
                      </span>
                    </div>
                    <div className="relative h-3 bg-secondary rounded-full overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${result.confidence}%` }}
                        transition={{ duration: 1, ease: "easeOut" }}
                        className={`h-full ${isPhishing ? 'bg-destructive' : 'bg-success'}`}
                      />
                    </div>
                  </div>

                  {/* AI Explanation */}
                  {result.explanation && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      className="mt-4 p-4 bg-secondary/50 rounded-lg border border-border"
                    >
                      <div className="flex items-start gap-2">
                        <Sparkles className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                        <div>
                          <p className="text-sm font-semibold text-primary mb-1">{t('aiAnalysis')}</p>
                          <p className="text-sm text-foreground leading-relaxed">{result.explanation}</p>
                        </div>
                      </div>
                    </motion.div>
                  )}

                  {/* Action Buttons */}
                  <div className="flex flex-wrap gap-2 mt-4">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleScan(false)}
                      className="gap-2"
                    >
                      <RotateCw className="w-4 h-4" />
                      {t('rescan')}
                    </Button>
                    
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleCopy}
                      className="gap-2"
                    >
                      <Copy className="w-4 h-4" />
                      {t('copyResult')}
                    </Button>

                    {!result.explanation && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={handleExplain}
                        disabled={isExplaining}
                        className="gap-2 border-primary/50 text-primary hover:bg-primary/10"
                      >
                        {isExplaining ? (
                          <>
                            <Loader2 className="w-4 h-4 animate-spin" />
                            {t('analyzing')}
                          </>
                        ) : (
                          <>
                            <Sparkles className="w-4 h-4" />
                            {t('explainWhy')}
                          </>
                        )}
                      </Button>
                    )}

                    <PDFReport
                      url={result.url}
                      label={result.label}
                      confidence={result.confidence}
                      score={result.score}
                      explanation={result.explanation}
                    />
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
};
