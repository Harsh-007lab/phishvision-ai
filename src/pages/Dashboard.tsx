import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Shield, LogOut, Bookmark, History, Trash2, ArrowLeft, Loader2, Key, Plus, Copy, Code2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "@/hooks/use-toast";

interface ScanRow { id: string; url: string; label: string; confidence: number; created_at: string; }
interface BookmarkRow { id: string; url: string; label: string | null; confidence: number | null; note: string | null; created_at: string; }
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
  const [bookmarks, setBookmarks] = useState<BookmarkRow[]>([]);
  const [profile, setProfile] = useState<{ display_name: string | null } | null>(null);
  const [loading, setLoading] = useState(true);
  const [apiKeys, setApiKeys] = useState<ApiKeyRow[]>([]);
  const [newKeyName, setNewKeyName] = useState("");
  const [creatingKey, setCreatingKey] = useState(false);
  const [revealedKey, setRevealedKey] = useState<string | null>(null);

  useEffect(() => {
    if (!authLoading && !user) navigate("/auth", { replace: true });
  }, [user, authLoading, navigate]);

  useEffect(() => {
    if (!user) return;
    (async () => {
      const [{ data: s }, { data: b }, { data: p }, { data: k }] = await Promise.all([
        supabase.from("scan_history").select("id,url,label,confidence,created_at").eq("user_id", user.id).order("created_at", { ascending: false }).limit(50),
        supabase.from("bookmarks").select("id,url,label,confidence,note,created_at").eq("user_id", user.id).order("created_at", { ascending: false }),
        supabase.from("profiles").select("display_name").eq("id", user.id).maybeSingle(),
        supabase.from("api_keys").select("id,name,key_prefix,last_used_at,revoked_at,created_at").eq("user_id", user.id).order("created_at", { ascending: false }),
      ]);
      setScans(s || []);
      setBookmarks(b || []);
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

  const removeBookmark = async (id: string) => {
    const { error } = await supabase.from("bookmarks").delete().eq("id", id);
    if (error) return toast({ title: "Failed to remove", description: error.message, variant: "destructive" });
    setBookmarks((b) => b.filter((x) => x.id !== id));
  };

  const bookmarkScan = async (scan: ScanRow) => {
    if (!user) return;
    const { error } = await supabase.from("bookmarks").upsert(
      { user_id: user.id, url: scan.url, label: scan.label, confidence: scan.confidence },
      { onConflict: "user_id,url" },
    );
    if (error) return toast({ title: "Failed to bookmark", description: error.message, variant: "destructive" });
    toast({ title: "Bookmarked", description: scan.url });
    const { data } = await supabase.from("bookmarks").select("id,url,label,confidence,note,created_at").eq("user_id", user.id).order("created_at", { ascending: false });
    setBookmarks(data || []);
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  const safeCount = scans.filter((s) => s.label === "safe").length;
  const phishingCount = scans.filter((s) => s.label === "phishing").length;
  const apiEndpoint = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/scan-api`;

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

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="glass rounded-xl p-4 border border-primary/30">
            <p className="text-sm text-muted-foreground">Your scans</p>
            <p className="text-3xl font-bold">{scans.length}</p>
          </div>
          <div className="glass rounded-xl p-4 border border-success/30">
            <p className="text-sm text-muted-foreground">Safe URLs</p>
            <p className="text-3xl font-bold text-success">{safeCount}</p>
          </div>
          <div className="glass rounded-xl p-4 border border-destructive/30">
            <p className="text-sm text-muted-foreground">Threats found</p>
            <p className="text-3xl font-bold text-destructive">{phishingCount}</p>
          </div>
        </div>

        <section className="glass rounded-2xl p-4 sm:p-6 space-y-4">
          <h2 className="text-xl font-semibold flex items-center gap-2"><Bookmark className="w-5 h-5 text-primary" /> Bookmarks</h2>
          {bookmarks.length === 0 ? (
            <p className="text-sm text-muted-foreground">No bookmarks yet. Save important scans from your history.</p>
          ) : (
            <div className="space-y-2">
              {bookmarks.map((b) => (
                <div key={b.id} className="flex items-center gap-3 p-3 rounded-lg bg-secondary/40 border border-border">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-mono truncate" title={b.url}>{b.url}</p>
                    {b.note && <p className="text-xs text-muted-foreground">{b.note}</p>}
                  </div>
                  {b.label && (
                    <span className={`px-2 py-1 rounded-full text-xs font-semibold ${b.label === "phishing" ? "bg-destructive/20 text-destructive" : "bg-success/20 text-success"}`}>
                      {b.label}
                    </span>
                  )}
                  <Button variant="ghost" size="icon" onClick={() => removeBookmark(b.id)}>
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </section>

        <section className="glass rounded-2xl p-4 sm:p-6 space-y-4">
          <h2 className="text-xl font-semibold flex items-center gap-2"><History className="w-5 h-5 text-primary" /> Your scan history</h2>
          {scans.length === 0 ? (
            <p className="text-sm text-muted-foreground">No personal scans yet. Run a scan while signed in to populate this list.</p>
          ) : (
            <div className="space-y-2 max-h-[500px] overflow-y-auto">
              {scans.map((s) => (
                <div key={s.id} className="flex items-center gap-3 p-3 rounded-lg bg-secondary/40 border border-border">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-mono truncate" title={s.url}>{s.url}</p>
                    <p className="text-xs text-muted-foreground">{new Date(s.created_at).toLocaleString()}</p>
                  </div>
                  <span className={`px-2 py-1 rounded-full text-xs font-semibold ${s.label === "phishing" ? "bg-destructive/20 text-destructive" : "bg-success/20 text-success"}`}>
                    {s.label}
                  </span>
                  <span className="text-sm font-bold">{s.confidence}%</span>
                  <Button variant="ghost" size="icon" onClick={() => bookmarkScan(s)} title="Bookmark">
                    <Bookmark className="w-4 h-4" />
                  </Button>
                </div>
              ))}
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