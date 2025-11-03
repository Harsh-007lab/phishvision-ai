import { useState } from "react";
import { Shield, AlertTriangle, Loader2, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

interface ScanResult {
  url: string;
  label: string;
  confidence: number;
  timestamp: Date;
}

export const Scanner = () => {
  const [url, setUrl] = useState("");
  const [isScanning, setIsScanning] = useState(false);
  const [result, setResult] = useState<ScanResult | null>(null);
  const [history, setHistory] = useState<ScanResult[]>([]);

  const handleScan = async () => {
    if (!url.trim()) {
      toast({
        title: "Error",
        description: "Please enter a URL to scan",
        variant: "destructive",
      });
      return;
    }

    setIsScanning(true);
    setResult(null);

    try {
      const { data, error } = await supabase.functions.invoke('phishing-detector', {
        body: { url: url.trim() }
      });

      if (error) throw error;

      const scanResult: ScanResult = {
        url: url.trim(),
        label: data.label,
        confidence: data.confidence,
        timestamp: new Date(),
      };

      setResult(scanResult);
      setHistory(prev => [scanResult, ...prev].slice(0, 5));

      toast({
        title: "Scan Complete",
        description: `URL analyzed: ${data.label === 'phishing' ? 'Phishing detected!' : 'URL appears safe'}`,
      });
    } catch (error) {
      console.error('Scan error:', error);
      toast({
        title: "Scan Failed",
        description: "Failed to analyze URL. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsScanning(false);
    }
  };

  const isPhishing = result?.label === 'phishing';

  return (
    <div className="w-full max-w-4xl mx-auto space-y-8 p-6">
      {/* Header */}
      <div className="text-center space-y-4">
        <div className="flex items-center justify-center gap-3">
          <Shield className="w-12 h-12 text-primary animate-pulse-slow" />
          <h1 className="text-5xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
            PhishVision AI
          </h1>
        </div>
        <p className="text-lg text-muted-foreground">
          Smart URL Scanner — Detect phishing attempts in real-time
        </p>
      </div>

      {/* Scanner Input */}
      <div className="glass rounded-2xl p-8 space-y-6">
        <div className="flex gap-4">
          <Input
            placeholder="Enter URL to scan (e.g., https://example.com)"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleScan()}
            className="flex-1 h-14 text-lg glass border-primary/30 focus:border-primary"
            disabled={isScanning}
          />
          <Button
            onClick={handleScan}
            disabled={isScanning}
            size="lg"
            className="h-14 px-8 bg-primary hover:bg-primary/90 text-primary-foreground font-semibold"
          >
            {isScanning ? (
              <>
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                Scanning
              </>
            ) : (
              <>
                <Search className="mr-2 h-5 w-5" />
                Scan Now
              </>
            )}
          </Button>
        </div>

        {/* Result Display */}
        {result && (
          <div
            className={`rounded-xl p-6 border-2 transition-all duration-500 ${
              isPhishing
                ? 'bg-gradient-to-br from-destructive/20 to-destructive/5 border-destructive glow-danger'
                : 'bg-gradient-to-br from-success/20 to-success/5 border-success glow-safe'
            }`}
          >
            <div className="flex items-start gap-4">
              {isPhishing ? (
                <AlertTriangle className="w-12 h-12 text-destructive flex-shrink-0 animate-pulse" />
              ) : (
                <Shield className="w-12 h-12 text-success flex-shrink-0" />
              )}
              <div className="flex-1 space-y-2">
                <h3 className={`text-2xl font-bold ${isPhishing ? 'text-destructive' : 'text-success'}`}>
                  {isPhishing ? '⚠️ Phishing Detected' : '✅ Safe Website'}
                </h3>
                <p className="text-sm text-muted-foreground break-all">{result.url}</p>
                <div className="flex items-center gap-2 mt-3">
                  <span className="text-sm font-medium">Confidence:</span>
                  <div className="flex-1 bg-secondary rounded-full h-3 overflow-hidden">
                    <div
                      className={`h-full transition-all duration-1000 ${
                        isPhishing ? 'bg-destructive' : 'bg-success'
                      }`}
                      style={{ width: `${result.confidence}%` }}
                    />
                  </div>
                  <span className={`font-bold ${isPhishing ? 'text-destructive' : 'text-success'}`}>
                    {result.confidence}%
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* History */}
      {history.length > 0 && (
        <div className="glass rounded-2xl p-6 space-y-4">
          <h2 className="text-xl font-semibold flex items-center gap-2">
            <Search className="w-5 h-5 text-primary" />
            Recent Scans
          </h2>
          <div className="space-y-2">
            {history.map((item, idx) => (
              <div
                key={idx}
                className="flex items-center justify-between p-4 rounded-lg bg-secondary/50 border border-border hover:bg-secondary/70 transition-colors"
              >
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-mono truncate">{item.url}</p>
                  <p className="text-xs text-muted-foreground">
                    {item.timestamp.toLocaleTimeString()}
                  </p>
                </div>
                <div className="flex items-center gap-3 ml-4">
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-semibold ${
                      item.label === 'phishing'
                        ? 'bg-destructive/20 text-destructive'
                        : 'bg-success/20 text-success'
                    }`}
                  >
                    {item.label === 'phishing' ? 'Phishing' : 'Safe'}
                  </span>
                  <span className="text-sm font-bold">{item.confidence}%</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Footer */}
      <div className="text-center text-sm text-muted-foreground">
        PhishVision AI — Built with LightGBM heuristics & Lovable Cloud 💙
      </div>
    </div>
  );
};
