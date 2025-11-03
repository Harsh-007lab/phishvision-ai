import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import { motion } from "framer-motion";
import { TrendingUp, Shield, AlertTriangle } from "lucide-react";

export const Analytics = () => {
  const [stats, setStats] = useState({
    totalScans: 0,
    phishingDetected: 0,
    safeUrls: 0,
    last24Hours: [] as { hour: string; count: number }[],
  });

  useEffect(() => {
    loadStats();

    const channel = supabase
      .channel('analytics-updates')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'scan_history'
        },
        () => loadStats()
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const loadStats = async () => {
    try {
      const { data: allScans } = await supabase
        .from('scan_history')
        .select('label, created_at');

      if (!allScans) return;

      const phishing = allScans.filter(s => s.label === 'phishing').length;
      const safe = allScans.filter(s => s.label === 'safe').length;

      // Get last 24 hours data
      const now = new Date();
      const last24h = new Date(now.getTime() - 24 * 60 * 60 * 1000);
      const recentScans = allScans.filter(s => new Date(s.created_at) > last24h);
      
      const hourlyData = Array.from({ length: 24 }, (_, i) => ({
        hour: `${i}h`,
        count: 0,
      }));

      recentScans.forEach(scan => {
        const hour = new Date(scan.created_at).getHours();
        hourlyData[hour].count++;
      });

      setStats({
        totalScans: allScans.length,
        phishingDetected: phishing,
        safeUrls: safe,
        last24Hours: hourlyData.filter(h => h.count > 0).slice(-12),
      });
    } catch (error) {
      console.error('Error loading stats:', error);
    }
  };

  const pieData = [
    { name: 'Safe', value: stats.safeUrls, color: 'hsl(var(--success))' },
    { name: 'Phishing', value: stats.phishingDetected, color: 'hsl(var(--destructive))' },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass rounded-2xl p-6 space-y-6"
    >
      <h2 className="text-xl font-semibold flex items-center gap-2">
        <TrendingUp className="w-5 h-5 text-primary" />
        Analytics Dashboard
      </h2>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-gradient-to-br from-primary/20 to-primary/5 border border-primary/30 rounded-xl p-4">
          <div className="flex items-center gap-3">
            <Shield className="w-8 h-8 text-primary" />
            <div>
              <p className="text-2xl font-bold">{stats.totalScans}</p>
              <p className="text-sm text-muted-foreground">Total Scans</p>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-success/20 to-success/5 border border-success/30 rounded-xl p-4">
          <div className="flex items-center gap-3">
            <Shield className="w-8 h-8 text-success" />
            <div>
              <p className="text-2xl font-bold">{stats.safeUrls}</p>
              <p className="text-sm text-muted-foreground">Safe URLs</p>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-destructive/20 to-destructive/5 border border-destructive/30 rounded-xl p-4">
          <div className="flex items-center gap-3">
            <AlertTriangle className="w-8 h-8 text-destructive" />
            <div>
              <p className="text-2xl font-bold">{stats.phishingDetected}</p>
              <p className="text-sm text-muted-foreground">Threats Blocked</p>
            </div>
          </div>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Bar Chart */}
        {stats.last24Hours.length > 0 && (
          <div>
            <h3 className="text-sm font-medium mb-3">Scans (Last 24 Hours)</h3>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={stats.last24Hours}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="hour" stroke="hsl(var(--muted-foreground))" />
                <YAxis stroke="hsl(var(--muted-foreground))" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'hsl(var(--popover))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '8px',
                  }}
                />
                <Bar dataKey="count" fill="hsl(var(--primary))" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* Pie Chart */}
        {stats.totalScans > 0 && (
          <div>
            <h3 className="text-sm font-medium mb-3">Threat Distribution</h3>
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'hsl(var(--popover))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '8px',
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>
    </motion.div>
  );
};
