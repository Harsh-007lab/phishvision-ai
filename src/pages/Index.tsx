import { Scanner } from "@/components/Scanner";
import { ScanHistory } from "@/components/ScanHistory";
import { Analytics } from "@/components/Analytics";
import { ReportModal } from "@/components/ReportModal";
import { ThemeToggle } from "@/components/ThemeToggle";
import { useState } from "react";
import { motion } from "framer-motion";

const Index = () => {
  const [scanUrl, setScanUrl] = useState("");

  const handleRescan = (url: string) => {
    setScanUrl(url);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Animated background orbs */}
      <div className="fixed inset-0 pointer-events-none">
        <motion.div
          animate={{
            x: [0, 100, 0],
            y: [0, 50, 0],
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            ease: "linear"
          }}
          className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/20 rounded-full blur-3xl"
        />
        <motion.div
          animate={{
            x: [0, -100, 0],
            y: [0, -50, 0],
          }}
          transition={{
            duration: 25,
            repeat: Infinity,
            ease: "linear"
          }}
          className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-accent/20 rounded-full blur-3xl"
        />
      </div>

      {/* Header */}
      <div className="relative z-10 flex justify-end p-6">
        <div className="flex items-center gap-4">
          <ReportModal />
          <ThemeToggle />
        </div>
      </div>

      {/* Main Content */}
      <div className="relative z-10 flex flex-col items-center justify-center py-12 px-4 space-y-12">
        <Scanner key={scanUrl} />
        <Analytics />
        <ScanHistory onRescan={handleRescan} />
      </div>

      {/* Footer */}
      <div className="relative z-10 text-center py-8 text-sm text-muted-foreground">
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
        >
          PhishVision AI v3.0 — Powered by LightGBM Heuristics & Lovable Cloud 💙
        </motion.p>
        <p className="mt-2 text-xs">
          Next-Generation Cybersecurity & Phishing Detection Platform
        </p>
      </div>
    </div>
  );
};

export default Index;
