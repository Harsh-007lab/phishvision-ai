import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Shield, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

const ResetPassword = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isRecovery, setIsRecovery] = useState(false);

  useEffect(() => {
    // Supabase recovery links include type=recovery in URL hash
    if (typeof window !== "undefined" && window.location.hash.includes("type=recovery")) {
      setIsRecovery(true);
    }
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === "PASSWORD_RECOVERY") setIsRecovery(true);
    });
    return () => subscription.unsubscribe();
  }, []);

  const sendLink = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });
    setLoading(false);
    if (error) return toast({ title: "Reset failed", description: error.message, variant: "destructive" });
    toast({ title: "Check your email", description: "We sent you a reset link." });
  };

  const setNewPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const { error } = await supabase.auth.updateUser({ password });
    setLoading(false);
    if (error) return toast({ title: "Update failed", description: error.message, variant: "destructive" });
    toast({ title: "Password updated", description: "You're all set." });
    navigate("/dashboard");
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden">
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-1/3 left-1/3 w-96 h-96 bg-primary/20 rounded-full blur-3xl" />
      </div>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass rounded-2xl p-6 sm:p-8 w-full max-w-md space-y-6 relative z-10 glow-primary"
      >
        <Link to="/" className="flex items-center justify-center gap-2 group">
          <Shield className="w-10 h-10 text-primary group-hover:scale-110 transition-transform" />
          <h1 className="text-2xl font-bold bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent">
            PhishVision AI
          </h1>
        </Link>

        {isRecovery ? (
          <form onSubmit={setNewPassword} className="space-y-4">
            <h2 className="text-lg font-semibold text-center">Set a new password</h2>
            <div>
              <Label htmlFor="rp-password">New password</Label>
              <Input id="rp-password" type="password" required minLength={6} value={password} onChange={(e) => setPassword(e.target.value)} className="glass" />
            </div>
            <Button type="submit" disabled={loading} className="w-full">
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Update password"}
            </Button>
          </form>
        ) : (
          <form onSubmit={sendLink} className="space-y-4">
            <h2 className="text-lg font-semibold text-center">Reset your password</h2>
            <p className="text-sm text-center text-muted-foreground">Enter your email and we'll send you a magic link.</p>
            <div>
              <Label htmlFor="rp-email">Email</Label>
              <Input id="rp-email" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} className="glass" />
            </div>
            <Button type="submit" disabled={loading} className="w-full">
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Send reset link"}
            </Button>
          </form>
        )}

        <p className="text-xs text-center text-muted-foreground">
          <Link to="/login" className="hover:text-primary">← Back to sign in</Link>
        </p>
      </motion.div>
    </div>
  );
};

export default ResetPassword;