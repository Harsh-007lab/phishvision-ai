import { useRef, useState } from "react";
import { Share2, Download, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { toast } from "@/hooks/use-toast";

interface Props {
  scansThisMonth: number;
  threatsBlocked: number;
}

export const ShareStats = ({ scansThisMonth, threatsBlocked }: Props) => {
  const cardRef = useRef<HTMLDivElement>(null);
  const [downloading, setDownloading] = useState(false);

  const downloadCard = async () => {
    if (!cardRef.current) return;
    setDownloading(true);
    try {
      const node = cardRef.current;
      const W = 1200;
      const H = 630;

      // Inline SVG with foreignObject for crisp rendering of HTML/CSS
      const xhtml = new XMLSerializer().serializeToString(node);
      const svg = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}">
  <foreignObject width="100%" height="100%">
    <div xmlns="http://www.w3.org/1999/xhtml">${xhtml}</div>
  </foreignObject>
</svg>`;
      const blob = new Blob([svg], { type: "image/svg+xml;charset=utf-8" });
      const url = URL.createObjectURL(blob);
      const img = new Image();
      img.crossOrigin = "anonymous";
      await new Promise<void>((resolve, reject) => {
        img.onload = () => resolve();
        img.onerror = (e) => reject(e);
        img.src = url;
      });
      const canvas = document.createElement("canvas");
      canvas.width = W;
      canvas.height = H;
      const ctx = canvas.getContext("2d")!;
      ctx.drawImage(img, 0, 0, W, H);
      URL.revokeObjectURL(url);

      canvas.toBlob((pngBlob) => {
        if (!pngBlob) throw new Error("Failed to render");
        const a = document.createElement("a");
        a.href = URL.createObjectURL(pngBlob);
        a.download = "phishvision-stats.png";
        a.click();
        URL.revokeObjectURL(a.href);
      }, "image/png");

      toast({ title: "Shareable card downloaded" });
    } catch (e) {
      toast({
        title: "Download failed",
        description: "Try taking a screenshot of the preview instead.",
        variant: "destructive",
      });
    } finally {
      setDownloading(false);
    }
  };

  const shareText = `I scanned ${scansThisMonth} URLs this month with PhishVision and caught ${threatsBlocked} phishing attempt${threatsBlocked === 1 ? "" : "s"}. https://phishvision.ai`;

  const shareTwitter = () => {
    window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}`, "_blank");
  };
  const shareLinkedIn = () => {
    window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent("https://phishvision.ai")}`, "_blank");
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2">
          <Share2 className="w-4 h-4" /> Share stats
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Share your security stats</DialogTitle>
        </DialogHeader>

        <div className="overflow-hidden rounded-xl border border-border">
          <div
            ref={cardRef}
            style={{
              width: 1200,
              height: 630,
              transform: "scale(0.5)",
              transformOrigin: "top left",
              padding: 64,
              background: "linear-gradient(135deg,#0a0d12 0%,#111520 60%,#0a2218 100%)",
              color: "#fff",
              fontFamily: "'IBM Plex Sans', system-ui, sans-serif",
              display: "flex",
              flexDirection: "column",
              justifyContent: "space-between",
              boxSizing: "border-box",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
              <div
                style={{
                  width: 56,
                  height: 56,
                  borderRadius: 14,
                  background: "linear-gradient(135deg,#00d4aa,#10b981)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 30,
                }}
              >
                🛡
              </div>
              <div style={{ fontSize: 30, fontWeight: 700, letterSpacing: -0.5 }}>
                PhishVision<span style={{ color: "#00d4aa" }}>AI</span>
              </div>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
              <div style={{ fontSize: 48, fontWeight: 700, lineHeight: 1.1, maxWidth: 900 }}>
                I scanned{" "}
                <span style={{ color: "#00d4aa" }}>{scansThisMonth} URLs</span>{" "}
                this month and caught{" "}
                <span style={{ color: "#ef4444" }}>
                  {threatsBlocked} phishing attempt{threatsBlocked === 1 ? "" : "s"}
                </span>
                .
              </div>
              <div style={{ fontSize: 22, color: "#94a3b8" }}>
                Real-time phishing detection — try it free.
              </div>
            </div>

            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <div style={{ fontSize: 22, color: "#94a3b8" }}>phishvision.ai</div>
              <div
                style={{
                  padding: "10px 22px",
                  borderRadius: 999,
                  background: "rgba(0,212,170,0.15)",
                  border: "1px solid rgba(0,212,170,0.4)",
                  color: "#00d4aa",
                  fontWeight: 700,
                  fontFamily: "'IBM Plex Mono', monospace",
                  fontSize: 18,
                }}
              >
                PROTECTED
              </div>
            </div>
          </div>
        </div>

        <div className="flex gap-2 flex-wrap">
          <Button onClick={downloadCard} disabled={downloading} className="gap-2">
            {downloading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
            Download PNG
          </Button>
          <Button variant="outline" onClick={shareTwitter}>Share on X</Button>
          <Button variant="outline" onClick={shareLinkedIn}>Share on LinkedIn</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
