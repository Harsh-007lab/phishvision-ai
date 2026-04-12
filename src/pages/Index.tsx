import { Scanner } from "@/components/Scanner";
import { ScanHistory } from "@/components/ScanHistory";
import { Analytics } from "@/components/Analytics";
import { ReportModal } from "@/components/ReportModal";
import { ThemeToggle } from "@/components/ThemeToggle";
import { LanguageSelector } from "@/components/LanguageSelector";
import { ScrollToTop } from "@/components/ScrollToTop";
import { HelpDialog } from "@/components/HelpDialog";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useTranslation } from "react-i18next";
import '../lib/i18n';

const Index = () => {
  const [scanUrl, setScanUrl] = useState("");
  const { t } = useTranslation();

  useEffect(() => {
    // Update HTML lang attribute
    document.documentElement.lang = 'en';
  }, []);

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
      <div className="relative z-10 flex justify-end p-4 sm:p-6">
        <div className="flex items-center gap-2 sm:gap-4">
          <LanguageSelector />
          <ReportModal />
          <ThemeToggle />
        </div>
      </div>

      {/* Main Content */}
      <div className="relative z-10 flex flex-col items-center justify-center py-6 sm:py-12 px-3 sm:px-4 space-y-8 sm:space-y-12">
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
          {t('poweredBy')}
        </motion.p>
        <p className="mt-2 text-xs">
          {t('tagline')}
        </p>
        <p className="mt-1 text-xs opacity-70">
          Last Updated: {new Date().toLocaleDateString()}
        </p>
      </div>

      {/* Floating Action Buttons */}
      <ScrollToTop />
      <HelpDialog />
    </div>
  );
};

export default Index;
