import { Button } from "@/components/ui/button";
import { FileDown, Loader2 } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { useState } from "react";
import jsPDF from "jspdf";
import { supabase } from "@/integrations/supabase/client";
import { useTranslation } from "react-i18next";
import { motion } from "framer-motion";

interface PDFReportProps {
  url: string;
  label: string;
  confidence: number;
  score: number;
  explanation?: string;
}

export const PDFReport = ({ url, label, confidence, score, explanation }: PDFReportProps) => {
  const [isGenerating, setIsGenerating] = useState(false);
  const { t } = useTranslation();

  const generateAISummary = async (): Promise<string> => {
    try {
      const { data, error } = await supabase.functions.invoke('phishing-detector', {
        body: { url, includeExplanation: true }
      });

      if (error || !data?.explanation) {
        return explanation || generateFallbackSummary();
      }

      return data.explanation;
    } catch (error) {
      console.error('AI summary error:', error);
      return generateFallbackSummary();
    }
  };

  const generateFallbackSummary = (): string => {
    if (label === 'phishing') {
      return `This URL has been flagged as a potential phishing threat with ${confidence}% confidence. Common indicators include suspicious domain patterns, lack of proper security certificates, or mimicking legitimate websites. Users should avoid entering sensitive information on this site.`;
    }
    return `This URL appears to be legitimate with ${confidence}% confidence. It shows standard security indicators and follows best practices for web safety. However, always remain cautious when sharing personal information online.`;
  };

  const generatePDF = async () => {
    setIsGenerating(true);

    try {
      // Get AI summary
      const aiSummary = await generateAISummary();

      const pdf = new jsPDF();
      const pageWidth = pdf.internal.pageSize.getWidth();
      const margin = 20;

      // Header with logo and title
      pdf.setFillColor(26, 29, 41); // Dark background
      pdf.rect(0, 0, pageWidth, 50, 'F');
      
      pdf.setTextColor(255, 255, 255);
      pdf.setFontSize(24);
      pdf.setFont('helvetica', 'bold');
      pdf.text('PhishVision AI', pageWidth / 2, 25, { align: 'center' });
      
      pdf.setFontSize(12);
      pdf.setFont('helvetica', 'normal');
      pdf.text('Security Report', pageWidth / 2, 35, { align: 'center' });

      // Date and time
      pdf.setTextColor(100, 100, 100);
      pdf.setFontSize(10);
      const reportDate = new Date().toLocaleString();
      pdf.text(`Generated: ${reportDate}`, pageWidth / 2, 42, { align: 'center' });

      // Scan Details Section
      pdf.setTextColor(0, 0, 0);
      pdf.setFontSize(16);
      pdf.setFont('helvetica', 'bold');
      pdf.text('Scan Details', margin, 65);

      pdf.setFontSize(11);
      pdf.setFont('helvetica', 'normal');
      pdf.text('URL Analyzed:', margin, 80);
      pdf.setFont('helvetica', 'bold');
      pdf.text(url, margin, 88);

      // Result Box
      const resultY = 100;
      const isPhishing = label === 'phishing';
      
      if (isPhishing) {
        pdf.setFillColor(239, 68, 68, 0.2); // Red with transparency
        pdf.setDrawColor(239, 68, 68);
      } else {
        pdf.setFillColor(34, 197, 94, 0.2); // Green with transparency
        pdf.setDrawColor(34, 197, 94);
      }
      
      pdf.setLineWidth(2);
      pdf.roundedRect(margin, resultY, pageWidth - 2 * margin, 40, 5, 5, 'FD');

      pdf.setTextColor(isPhishing ? 239 : 34, isPhishing ? 68 : 197, isPhishing ? 68 : 94);
      pdf.setFontSize(18);
      pdf.setFont('helvetica', 'bold');
      pdf.text(
        isPhishing ? '⚠️ PHISHING DETECTED' : '✅ SAFE WEBSITE',
        pageWidth / 2,
        resultY + 15,
        { align: 'center' }
      );

      pdf.setFontSize(14);
      pdf.text(`Confidence: ${confidence}%`, pageWidth / 2, resultY + 28, { align: 'center' });

      // Threat Score Gauge
      pdf.setTextColor(0, 0, 0);
      pdf.setFontSize(12);
      pdf.setFont('helvetica', 'bold');
      pdf.text('Threat Score:', margin, 155);

      // Draw gauge
      const gaugeX = margin;
      const gaugeY = 162;
      const gaugeWidth = pageWidth - 2 * margin;
      const gaugeHeight = 10;

      pdf.setFillColor(220, 220, 220);
      pdf.roundedRect(gaugeX, gaugeY, gaugeWidth, gaugeHeight, 5, 5, 'F');

      const fillWidth = (score * gaugeWidth);
      pdf.setFillColor(isPhishing ? 239 : 34, isPhishing ? 68 : 197, isPhishing ? 68 : 94);
      pdf.roundedRect(gaugeX, gaugeY, fillWidth, gaugeHeight, 5, 5, 'F');

      // AI Threat Summary Section
      pdf.setFontSize(14);
      pdf.setFont('helvetica', 'bold');
      pdf.text('AI Threat Summary', margin, 190);

      pdf.setFontSize(10);
      pdf.setFont('helvetica', 'normal');
      const splitSummary = pdf.splitTextToSize(aiSummary, pageWidth - 2 * margin);
      pdf.text(splitSummary, margin, 200);

      // Footer with watermark
      const footerY = pdf.internal.pageSize.getHeight() - 20;
      pdf.setTextColor(150, 150, 150);
      pdf.setFontSize(9);
      pdf.text('PhishVision AI Secure Report', pageWidth / 2, footerY, { align: 'center' });
      pdf.text('Powered by LightGBM Heuristics & Lovable Cloud', pageWidth / 2, footerY + 5, { align: 'center' });

      // Save PDF
      const fileName = `PhishVision_Report_${new Date().toISOString().split('T')[0]}.pdf`;
      pdf.save(fileName);

      toast({
        title: "Report Ready ✅",
        description: `Downloaded as ${fileName}`,
      });
    } catch (error) {
      console.error('PDF generation error:', error);
      toast({
        title: "Report Generation Failed",
        description: "Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
    >
      <Button
        variant="outline"
        size="sm"
        onClick={generatePDF}
        disabled={isGenerating}
        className="gap-2 relative overflow-hidden group"
      >
        <motion.div
          className="absolute inset-0 bg-gradient-to-r from-primary/0 via-primary/20 to-primary/0"
          animate={{
            x: ['-100%', '100%'],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: "linear",
          }}
        />
        {isGenerating ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin" />
            Generating...
          </>
        ) : (
          <>
            <FileDown className="w-4 h-4" />
            {t('downloadReport')}
          </>
        )}
      </Button>
    </motion.div>
  );
};
