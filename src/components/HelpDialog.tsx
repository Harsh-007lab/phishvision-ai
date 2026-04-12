import { useState } from "react";
import { HelpCircle, Mic, Globe, FileDown, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useTranslation } from "react-i18next";
import { motion } from "framer-motion";

export const HelpDialog = () => {
  const [open, setOpen] = useState(false);
  const { t } = useTranslation();

  const features = [
    {
      icon: Shield,
      title: "URL Scanning",
      description: "Enter any URL to analyze for phishing threats using advanced AI and heuristics."
    },
    {
      icon: Mic,
      title: "Voice Input",
      description: "Click the microphone icon and speak a URL or website name to scan hands-free."
    },
    {
      icon: Globe,
      title: "Multilingual Support",
      description: "Switch between English, Hindi, Spanish, French, and Arabic for a localized experience."
    },
    {
      icon: FileDown,
      title: "PDF Reports",
      description: "Download detailed security reports with AI-powered threat analysis for any scanned URL."
    }
  ];

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <motion.div
          className="fixed bottom-24 right-4 sm:right-8 z-50"
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
        >
          <Button
            size="icon"
            className="rounded-full h-12 w-12 shadow-lg bg-accent hover:bg-accent/90"
            aria-label={t('helpInfo')}
          >
            <HelpCircle className="h-6 w-6" />
          </Button>
        </motion.div>
      </DialogTrigger>
      <DialogContent className="glass max-w-2xl">
        <DialogHeader>
          <DialogTitle className="text-2xl flex items-center gap-2">
            <HelpCircle className="w-6 h-6 text-primary" />
            {t('helpInfo')}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 mt-4">
          {features.map((feature, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              className="flex gap-4 p-4 rounded-lg bg-secondary/50 border border-border"
            >
              <div className="flex-shrink-0">
                <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center">
                  <feature.icon className="w-6 h-6 text-primary" />
                </div>
              </div>
              <div>
                <h3 className="font-semibold text-lg mb-1">{feature.title}</h3>
                <p className="text-sm text-muted-foreground">{feature.description}</p>
              </div>
            </motion.div>
          ))}
        </div>

        <div className="mt-6 p-4 rounded-lg bg-primary/10 border border-primary/30">
          <p className="text-sm text-center">
            <strong>Pro Tip:</strong> For best results, always include "https://" or "http://" 
            in URLs, or let our voice input detect it automatically!
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
};
