import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Shield, LogOut, History, Trash2, ArrowLeft, Loader2, Key, Plus, Copy, Code2, ExternalLink, RotateCw, Search as SearchIcon, ShieldAlert, ShieldCheck, CalendarDays } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "@/hooks/use-toast";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ResponsiveContainer,
  Legend,
} from "recharts";

interface ScanRow {
  id: string;
  url: string;
  threat_score: number;
  verdict: "safe" | "suspicious" | "dangerous" | "unverified";
  scanned_at: string;
}
interface ApiKeyRow { id: string; name: string; key_prefix: string; last_used_at: string | null; revoked_at: string | null; created_at: string; }

async function sha256Hex(text: string): Promise<string> {
  const buf = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(text));
  return Array.from(new Uint8Array(buf)).map((b) => b.toString(16).padStart(2, "0")).join("");
}

function generateApiKey(): string {
  const arr = new Uint8Array(24);
  crypto.getRandomValues(arr);
  const b64 = btoa(String.fromCharCode(...arr)).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
  return "pv_" + b64;
}

const Dashboard = () => {
  const { user, loading: authLoading, signOut } = useAuth();
  const navigate = useNavigate();
  const [scans, setScans] = useState<ScanRow[]>([]);
  const [profile, setProfile] = useState<{ display_name: string | null } | null>(null);
  const [loading, setLoading] = useState(true);
  const [apiKeys, setApiKeys] = useState<ApiKeyRow[]>([]);
  const [newKeyName, setNewKeyName] = useState("");
  const [creatingKey, setCreatingKey] = useState(false);
  const [revealedKey, setRevealedKey] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [verdictFilter, setVerdictFilter] = useState<string>("all");
  const [fromDate, setFromDate] = useState<string>("");
  const [toDate, setToDate] = useState<string>("");

  useEffect(() => {
    if (!authLoading && !user) navigate("/login", { replace: true });
  }, [user, authLoading, navigate]);

  useEffect(() => {
    if (!user) return;
    (async () => {
      const [{ data: s }, { data: p }, { data: k }] = await Promise.all([
        (supabase.from("scans" as any) as any)
          .select("id,url,threat_score,verdict,scanned_at")
          .eq("user_id", user.id)
          .order("scanned_at", { ascending: false })
          .limit(500),
        supabase.from("profiles").select("display_name").eq("id", user.id).maybeSingle(),
        supabase.from("api_keys").select("id,name,key_prefix,last_used_at,revoked_at,created_at").eq("user_id", user.id).order("created_at", { ascending: false }),
      ]);
      setScans((s as unknown as ScanRow[]) || []);
      setProfile(p);
      setApiKeys(k || []);
      setLoading(false);
    })();
  }, [user]);

  const createApiKey = async () => {
    if (!user || !newKeyName.trim()) return;
    setCreatingKey(true);
    try {
      const fullKey = generateApiKey();
      const hash = await sha256Hex(fullKey);
      const prefix = fullKey.slice(0, 10);
      const { data, error } = await supabase
        .from("api_keys")
        .insert({ user_id: user.id, name: newKeyName.trim(), key_prefix: prefix, key_hash: hash })
        .select("id,name,key_prefix,last_used_at,revoked_at,created_at")
        .single();
      if (error) throw error;
      setApiKeys((prev) => [data as ApiKeyRow, ...prev]);
      setRevealedKey(fullKey);
      setNewKeyName("");
    } catch (e: any) {
      toast({ title: "Failed to create key", description: e?.message, variant: "destructive" });
    } finally {
      setCreatingKey(false);
    }
  };

  const revokeKey = async (id: string) => {
    const { error } = await supabase.from("api_keys").delete().eq("id", id);
    if (error) return toast({ title: "Failed to revoke", description: error.message, variant: "destructive" });
    setApiKeys((prev) => prev.filter((k) => k.id !== id));
  };

  const copyText = (t: string) => {
    navigator.clipboard.writeText(t);
    toast({ title: "Copied to clipboard" });
  };

  const deleteScan = async (id: string) => {
    const { error } = await (supabase.from("scans" as any) as any).delete().eq("id", id);
    if (error) return toast({ title: "Failed to delete", description: error.message, variant: "destructive" });
    setScans((prev) => prev.filter((x) => x.id !== id));
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  const apiEndpoint = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/scan-api`;

  // Stats
  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());

  const scansThisMonth = scans.filter((s) => new Date(s.scanned_at) >= startOfMonth).length;
  const scansToday = scans.filter((s) => new Date(s.scanned_at) >= startOfDay).length;
  const threatsDetected = scans.filter((s) => s.verdict === "dangerous" || s.verdict === "suspicious").length;
  const safeCount = scans.filter((s) => s.verdict === "safe").length;

  // Filtered table
  const filteredScans = scans
    .filter((s) => (search ? s.url.toLowerCase().includes(search.toLowerCase()) : true))
    .filter((s) => (verdictFilter === "all" ? true : s.verdict === verdictFilter))
    .filter((s) => (fromDate ? new Date(s.scanned_at) >= new Date(fromDate) : true))
    .filter((s) => (toDate ? new Date(s.scanned_at) <= new Date(toDate + "T23:59:59") : true))
    .slice(0, 50);

  // Trend chart: last 30 days
  const trend: { date: string; scans: number; threats: number }[] = [];
  for (let i = 29; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth(), now.getDate() - i);
    const key = d.toISOString().slice(0, 10);
    const dayScans = scans.filter((s) => s.scanned_at.slice(0, 10) === key);
    trend.push({
      date: key.slice(5),
      scans: dayScans.length,
      threats: dayScans.filter((s) => s.verdict === "dangerous" || s.verdict === "suspicious").length,
    });
  }

  const verdictBadge = (v: string) => {
    const map: Record<string, string> = {
      dangerous: "bg-destructive/20 text-destructive border-destructive/40",
      suspicious: "bg-amber-500/20 text-amber-600 border-amber-500/40",
      safe: "bg-success/20 text-success border-success/40",
      unverified: "bg-muted text-muted-foreground border-border",
    };
    return map[v] || map.unverified;
  };

  const scoreBadge = (score: number) => {
    if (score <= 30) return "bg-destructive/20 text-destructive";
    if (score <= 60) return "bg-amber-500/20 text-amber-600";
    if (score <= 85) return "bg-yellow-500/20 text-yellow-600";
    return "bg-success/20 text-success";
  };

  return (
    <div className="min-h-screen relative overflow-x-hidden">
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/20 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-accent/20 rounded-full blur-3xl" />
      </div>

      <header className="relative z-10 flex items-center justify-between p-4 sm:p-6 max-w-6xl mx-auto w-full">
        <Link to="/" className="flex items-center gap-2">
          <Shield className="w-7 h-7 text-primary" />
          <span className="font-bold text-lg">PhishVision AI</span>
        </Link>
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm" asChild><Link to="/"><ArrowLeft className="w-4 h-4 mr-1" />Scanner</Link></Button>
          <Button variant="outline" size="sm" onClick={() => signOut().then(() => navigate("/"))}>
            <LogOut className="w-4 h-4 mr-1" /> Sign out
          </Button>
        </div>
      </header>

      <main className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 py-6 space-y-8">
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-1">
          <h1 className="text-2xl sm:text-3xl font-bold">Welcome back, {profile?.display_name || user?.email}</h1>
          <p className="text-muted-foreground">Your personal threat intelligence dashboard.</p>
        </motion.div>

        {/* Section A — Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="glass rounded-xl p-4 border border-primary/30">
            <p className="text-xs sm:text-sm text-muted-foreground">Scans this month</p>
            <p className="text-3xl font-bold">{scansThisMonth}</p>
          </div>
          <div className="glass rounded-xl p-4 border border-destructive/30">
            <p className="text-xs sm:text-sm text-muted-foreground flex items-center gap-1"><ShieldAlert className="w-3 h-3" />Threats detected</p>
            <p className="text-3xl font-bold text-destructive">{threatsDetected}</p>
          </div>
          <div className="glass rounded-xl p-4 border border-success/30">
            <p className="text-xs sm:text-sm text-muted-foreground flex items-center gap-1"><ShieldCheck className="w-3 h-3" />Safe confirmed</p>
            <p className="text-3xl font-bold text-success">{safeCount}</p>
          </div>
          <div className="glass rounded-xl p-4 border border-accent/30">
            <p className="text-xs sm:text-sm text-muted-foreground flex items-center gap-1"><CalendarDays className="w-3 h-3" />Scanned today</p>
            <p className="text-3xl font-bold">{scansToday}</p>
          </div>
        </div>

        {/* Section C — Trend chart */}
        <section className="glass rounded-2xl p-4 sm:p-6 space-y-4">
          <h2 className="text-xl font-semibold">Threat trend — last 30 days</h2>
          <div className="w-full h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={trend}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="date" stroke="hsl(var(--muted-foreground))" tick={{ fontSize: 11 }} />
                <YAxis stroke="hsl(var(--muted-foreground))" tick={{ fontSize: 11 }} allowDecimals={false} />
                <Tooltip
                  contentStyle={{
                    background: "hsl(var(--popover))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: 8,
                  }}
                />
                <Legend />
                <Line type="monotone" dataKey="scans" stroke="hsl(var(--primary))" strokeWidth={2} dot={false} name="Scans" />
                <Line type="monotone" dataKey="threats" stroke="hsl(var(--destructive))" strokeWidth={2} dot={false} name="Threats" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </section>

        {/* Section B — Recent scan history */}
        <section className="glass rounded-2xl p-4 sm:p-6 space-y-4">
          <h2 className="text-xl font-semibold flex items-center gap-2"><History className="w-5 h-5 text-primary" /> Your scan history</h2>

          <div className="grid grid-cols-1 sm:grid-cols-4 gap-2">
            <div className="relative sm:col-span-2">
              <SearchIcon className="absolute left-2 top-2.5 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search by URL"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-8"
              />
            </div>
            <Select value={verdictFilter} onValueChange={setVerdictFilter}>
              <SelectTrigger>
                <SelectValue placeholder="All verdicts" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All verdicts</SelectItem>
                <SelectItem value="safe">Safe</SelectItem>
                <SelectItem value="suspicious">Suspicious</SelectItem>
                <SelectItem value="dangerous">Dangerous</SelectItem>
                <SelectItem value="unverified">Unverified</SelectItem>
              </SelectContent>
            </Select>
            <div className="flex gap-1">
              <Input type="date" value={fromDate} onChange={(e) => setFromDate(e.target.value)} className="text-xs" aria-label="From date" />
              <Input type="date" value={toDate} onChange={(e) => setToDate(e.target.value)} className="text-xs" aria-label="To date" />
            </div>
          </div>

          {filteredScans.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              {scans.length === 0 ? "No personal scans yet. Run a scan while signed in to populate this list." : "No scans match your filters."}
            </p>
          ) : (
            <div className="overflow-x-auto max-h-[500px] overflow-y-auto">
              <table className="w-full text-sm">
                <thead className="text-xs uppercase text-muted-foreground border-b border-border">
                  <tr>
                    <th className="text-left font-medium py-2 pr-2">URL</th>
                    <th className="text-left font-medium py-2 px-2">Score</th>
                    <th className="text-left font-medium py-2 px-2">Verdict</th>
                    <th className="text-left font-medium py-2 px-2 hidden sm:table-cell">Scanned</th>
                    <th className="text-right font-medium py-2 pl-2">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredScans.map((s) => (
                    <tr key={s.id} className="border-b border-border/40 hover:bg-secondary/30">
                      <td className="py-2 pr-2 max-w-xs">
                        <Link to={`/report/${s.id}`} className="font-mono text-xs truncate block hover:text-primary" title={s.url}>
                          {s.url}
                        </Link>
                      </td>
                      <td className="py-2 px-2">
                        <span className={`px-2 py-0.5 rounded text-xs font-bold ${scoreBadge(s.threat_score)}`}>
                          {s.threat_score}
                        </span>
                      </td>
                      <td className="py-2 px-2">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] uppercase font-semibold border ${verdictBadge(s.verdict)}`}>
                          {s.verdict}
                        </span>
                      </td>
                      <td className="py-2 px-2 text-xs text-muted-foreground hidden sm:table-cell">
                        {new Date(s.scanned_at).toLocaleString()}
                      </td>
                      <td className="py-2 pl-2 text-right whitespace-nowrap">
                        <Button variant="ghost" size="icon" asChild title="View Report">
                          <Link to={`/report/${s.id}`}><ExternalLink className="w-4 h-4" /></Link>
                        </Button>
                        <Button variant="ghost" size="icon" asChild title="Re-scan">
                          <Link to={`/?u=${encodeURIComponent(s.url)}`}><RotateCw className="w-4 h-4" /></Link>
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => deleteScan(s.id)} title="Delete">
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>

        <section className="glass rounded-2xl p-4 sm:p-6 space-y-4">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <h2 className="text-xl font-semibold flex items-center gap-2">
              <Key className="w-5 h-5 text-primary" /> Developer API
            </h2>
          </div>
          <p className="text-sm text-muted-foreground">
            Programmatically scan URLs with our REST API. Generate a key below, then POST to the endpoint with header <code className="text-xs bg-secondary/60 px-1 py-0.5 rounded">x-api-key</code>.
          </p>

          <div className="rounded-lg bg-secondary/40 border border-border p-3 space-y-2 text-xs font-mono">
            <div className="flex items-center gap-2">
              <Code2 className="w-3 h-3 text-primary flex-shrink-0" />
              <span className="truncate flex-1" title={apiEndpoint}>POST {apiEndpoint}</span>
              <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => copyText(apiEndpoint)}>
                <Copy className="w-3 h-3" />
              </Button>
            </div>
            <pre className="overflow-x-auto text-[11px] leading-relaxed">{`curl -X POST ${apiEndpoint} \\
  -H "Content-Type: application/json" \\
  -H "x-api-key: pv_..." \\
  -d '{"url":"https://example.com"}'`}</pre>
          </div>

          <div className="flex gap-2">
            <Input
              placeholder="Key name (e.g. Production)"
              value={newKeyName}
              onChange={(e) => setNewKeyName(e.target.value)}
              disabled={creatingKey}
              maxLength={64}
            />
            <Button onClick={createApiKey} disabled={creatingKey || !newKeyName.trim()} className="gap-2 flex-shrink-0">
              {creatingKey ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
              Create
            </Button>
          </div>

          {revealedKey && (
            <div className="rounded-lg border border-primary/40 bg-primary/5 p-3 space-y-2">
              <p className="text-xs font-semibold text-primary">Save this key now — it won't be shown again.</p>
              <div className="flex items-center gap-2">
                <code className="flex-1 font-mono text-xs break-all">{revealedKey}</code>
                <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => copyText(revealedKey)}>
                  <Copy className="w-3.5 h-3.5" />
                </Button>
                <Button size="sm" variant="outline" onClick={() => setRevealedKey(null)}>Done</Button>
              </div>
            </div>
          )}

          {apiKeys.length === 0 ? (
            <p className="text-sm text-muted-foreground">No API keys yet.</p>
          ) : (
            <div className="space-y-2">
              {apiKeys.map((k) => (
                <div key={k.id} className="flex items-center gap-3 p-3 rounded-lg bg-secondary/40 border border-border">
                  <Key className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{k.name}</p>
                    <p className="text-xs text-muted-foreground font-mono">
                      {k.key_prefix}…  ·  {k.last_used_at ? `last used ${new Date(k.last_used_at).toLocaleDateString()}` : "never used"}
                    </p>
                  </div>
                  <Button variant="ghost" size="icon" onClick={() => revokeKey(k.id)} title="Revoke">
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </section>
      </main>
    </div>
  );
};

export default Dashboard;