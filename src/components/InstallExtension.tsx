import { useState } from "react";
import { Chrome, Download, Loader2, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from "@/components/ui/dialog";
import { toast } from "@/hooks/use-toast";

export const InstallExtension = () => {
  const [downloading, setDownloading] = useState(false);

  const handleDownload = async () => {
    try {
      setDownloading(true);
      const res = await fetch("/phishvision-extension.zip");
      if (!res.ok) throw new Error(`Download failed: ${res.status}`);
      const blob = await res.blob();
      const a = document.createElement("a");
      a.href = URL.createObjectURL(blob);
      a.download = "phishvision-extension.zip";
      a.click();
      URL.revokeObjectURL(a.href);
      toast({ title: "Download started", description: "Unzip and load it in your browser." });
    } catch (e) {
      toast({ title: "Download failed", description: String((e as Error).message), variant: "destructive" });
    } finally {
      setDownloading(false);
    }
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button
          size="lg"
          className="gap-2 bg-gradient-to-r from-primary to-accent text-primary-foreground font-semibold hover:scale-105 transition-transform"
        >
          <Chrome className="w-5 h-5" />
          Install Browser Extension
        </Button>
      </DialogTrigger>
      <DialogContent className="glass max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-primary" />
            Install PhishVision AI
          </DialogTitle>
          <DialogDescription>
            Real-time phishing protection in your browser. Compatible with Chrome, Edge, Brave, Arc, Opera, and Firefox (109+).
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 text-sm">
          <Button onClick={handleDownload} disabled={downloading} size="lg" className="w-full gap-2">
            {downloading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
            Download extension (.zip)
          </Button>

          <div className="space-y-2">
            <p className="font-semibold text-foreground">Chrome / Edge / Brave / Arc</p>
            <ol className="list-decimal list-inside space-y-1 text-muted-foreground">
              <li>Unzip the downloaded file.</li>
              <li>
                Open <code className="px-1 py-0.5 rounded bg-secondary">chrome://extensions</code>.
              </li>
              <li>Enable <strong>Developer mode</strong> (top-right toggle).</li>
              <li>Click <strong>Load unpacked</strong> and select the unzipped folder.</li>
            </ol>
          </div>

          <div className="space-y-2">
            <p className="font-semibold text-foreground">Firefox</p>
            <ol className="list-decimal list-inside space-y-1 text-muted-foreground">
              <li>
                Open <code className="px-1 py-0.5 rounded bg-secondary">about:debugging#/runtime/this-firefox</code>.
              </li>
              <li>Click <strong>Load Temporary Add-on</strong>.</li>
              <li>Select the <code className="px-1 py-0.5 rounded bg-secondary">manifest.json</code> from the unzipped folder.</li>
            </ol>
          </div>

          <p className="text-xs text-muted-foreground">
            The extension scans pages in real time, shows a colored toolbar badge (green / yellow / red), and displays a full-screen warning overlay on dangerous sites.
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
};