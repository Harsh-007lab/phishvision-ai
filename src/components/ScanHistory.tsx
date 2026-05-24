import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Search, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { useTranslation } from "react-i18next";

interface ScanRecord {
  id: string;
  url: string;
  label: string;
  confidence: number;
  created_at: string;
}

export const ScanHistory = ({ onRescan }: { onRescan: (url: string) => void }) => {
  const [history, setHistory] = useState<ScanRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const { t } = useTranslation();

  const loadHistory = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('scan_history')
        .select('id, url, label, confidence, created_at')
        .order('created_at', { ascending: false })
        .limit(20);

      if (error) throw error;
      setHistory(data || []);
    } catch (error) {
      console.error('Error loading history:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadHistory();

    // Real-time subscription
    const channel = supabase
      .channel('scan-history-changes')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'scan_history'
        },
        () => loadHistory()
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  if (loading) {
    return (
      <div className="glass rounded-2xl p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-4 bg-secondary rounded w-1/4"></div>
          <div className="space-y-2">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-16 bg-secondary rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (history.length === 0) {
    return (
      <div className="glass rounded-2xl p-6 text-center text-muted-foreground">
        <Search className="w-12 h-12 mx-auto mb-3 opacity-50" />
        <p>{t('noScansYet')}</p>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass rounded-2xl p-6 space-y-4"
    >
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold flex items-center gap-2">
          <Search className="w-5 h-5 text-primary" />
          {t('recentScans')}
        </h2>
        <Button variant="ghost" size="sm" onClick={loadHistory}>
          <RefreshCw className="w-4 h-4" />
        </Button>
      </div>

      <div className="space-y-2 max-h-96 overflow-y-auto">
        {history.map((item, idx) => (
          <motion.div
            key={item.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: idx * 0.05 }}
            className="flex flex-col sm:flex-row sm:items-center justify-between p-3 sm:p-4 rounded-lg bg-secondary/50 border border-border hover:bg-secondary/70 transition-colors gap-2 sm:gap-4 w-full overflow-hidden"
          >
            <div className="flex-1 min-w-0 max-w-full overflow-hidden">
              <p
                className="text-xs sm:text-sm font-mono truncate max-w-full"
                title={item.url}
              >
                {item.url}
              </p>
              <p className="text-xs text-muted-foreground">
                {new Date(item.created_at).toLocaleString()}
              </p>
            </div>
            <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0">
              <span
                className={`px-2 sm:px-3 py-1 rounded-full text-xs font-semibold ${
                  item.label === 'phishing'
                    ? 'bg-destructive/20 text-destructive'
                    : 'bg-success/20 text-success'
                }`}
              >
                {item.label === 'phishing' ? 'Phishing' : 'Safe'}
              </span>
              <span className="text-sm font-bold">{item.confidence}%</span>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onRescan(item.url)}
              >
                <RefreshCw className="w-4 h-4" />
              </Button>
            </div>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
};
