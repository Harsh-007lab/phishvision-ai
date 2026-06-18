import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowLeft, Bell, Loader2, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

interface Prefs {
  weekly_digest: boolean;
  threat_alerts: boolean;
  scan_reminders: boolean;
}

const DEFAULTS: Prefs = {
  weekly_digest: true,
  threat_alerts: true,
  scan_reminders: false,
};

const NOTIFS: { key: keyof Prefs; title: string; desc: string }[] = [
  {
    key: "weekly_digest",
    title: "Weekly Threat Digest",
    desc: "Every Monday, get a summary of the top phishing campaigns, brands being impersonated, and your personal scan stats from the past week.",
  },
  {
    key: "threat_alerts",
    title: "Threat Alerts",
    desc: "Get notified if a URL you previously scanned as Safe has since been flagged as dangerous.",
  },
  {
    key: "scan_reminders",
    title: "Scan reminders",
    desc: "Get a weekly nudge if you haven't scanned any URLs in 7 days.",
  },
];

const Settings = () => {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [prefs, setPrefs] = useState<Prefs>(DEFAULTS);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState<keyof Prefs | null>(null);

  useEffect(() => {
    if (!authLoading && !user) navigate("/login", { replace: true });
  }, [user, authLoading, navigate]);

  useEffect(() => {
    if (!user) return;
    (async () => {
      const { data } = await supabase
        .from("user_preferences")
        .select("weekly_digest,threat_alerts,scan_reminders")
        .eq("user_id", user.id)
        .maybeSingle();
      if (data) setPrefs({ ...DEFAULTS, ...(data as Prefs) });
      setLoading(false);
    })();
  }, [user]);

  const update = async (key: keyof Prefs, value: boolean) => {
    if (!user) return;
    setSaving(key);
    const next = { ...prefs, [key]: value };
    setPrefs(next);
    const { error } = await supabase
      .from("user_preferences")
      .upsert({ user_id: user.id, ...next }, { onConflict: "user_id" });
    setSaving(null);
    if (error) {
      toast({ title: "Could not save", description: error.message, variant: "destructive" });
      setPrefs(prefs);
    } else {
      toast({ title: "Saved" });
    }
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen relative">
      <header className="relative z-10 flex items-center justify-between p-4 sm:p-6 max-w-3xl mx-auto w-full">
        <Link to="/" className="flex items-center gap-2">
          <Shield className="w-6 h-6 text-primary" />
          <span className="font-bold">PhishVision AI</span>
        </Link>
        <Button variant="ghost" size="sm" asChild>
          <Link to="/dashboard"><ArrowLeft className="w-4 h-4 mr-1" /> Dashboard</Link>
        </Button>
      </header>

      <main className="relative z-10 max-w-3xl mx-auto px-4 sm:px-6 py-6 space-y-8">
        <div>
          <h1 className="text-3xl font-bold">Settings</h1>
          <p className="text-muted-foreground">Manage how PhishVision communicates with you.</p>
        </div>

        <section className="glass rounded-2xl p-6 space-y-5">
          <div className="flex items-center gap-2">
            <Bell className="w-5 h-5 text-primary" />
            <h2 className="text-xl font-semibold">Email Notifications</h2>
          </div>

          <div className="space-y-3">
            {NOTIFS.map((n) => (
              <div
                key={n.key}
                className="flex items-start justify-between gap-4 rounded-xl border border-border bg-card/40 p-4"
              >
                <div className="flex-1 min-w-0">
                  <div className="font-medium mb-1">{n.title}</div>
                  <p className="text-sm text-muted-foreground leading-relaxed">{n.desc}</p>
                </div>
                <div className="pt-1">
                  <Switch
                    checked={prefs[n.key]}
                    disabled={saving === n.key}
                    onCheckedChange={(v) => update(n.key, v)}
                  />
                </div>
              </div>
            ))}
          </div>

          <p className="text-xs text-muted-foreground">
            We never share your email with third parties. You can unsubscribe from any email at any time.
          </p>
        </section>
      </main>
    </div>
  );
};

export default Settings;