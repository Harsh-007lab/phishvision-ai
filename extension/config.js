// Shared config for the PhishVision AI extension
export const SUPABASE_URL = "https://zrapesuwygrrfwzxzfmf.supabase.co";
export const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpyYXBlc3V3eWdycmZ3enh6Zm1mIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjIxMjI1OTYsImV4cCI6MjA3NzY5ODU5Nn0.mOCOLk4lzJ1xvpnTUI_ztdbPLrT1g3_haaNpf8KtH1k";
export const ENDPOINT = `${SUPABASE_URL}/functions/v1/phishing-detector`;

// Cache TTL for scan results (ms)
export const CACHE_TTL = 10 * 60 * 1000; // 10 min
export const HISTORY_LIMIT = 50;

// Skip scanning these schemes
export const SKIP_SCHEMES = ["chrome:", "chrome-extension:", "moz-extension:", "about:", "edge:", "brave:", "view-source:", "file:"];

export function shouldSkip(url) {
  if (!url) return true;
  return SKIP_SCHEMES.some((s) => url.startsWith(s));
}

export function classify(label, confidence) {
  // Returns { level, color, badgeText }
  if (label === "phishing" && confidence >= 70) {
    return { level: "dangerous", color: "#ef4444", badgeText: "!" };
  }
  if (label === "phishing" || confidence >= 50) {
    return { level: "suspicious", color: "#f59e0b", badgeText: "?" };
  }
  return { level: "safe", color: "#10b981", badgeText: "\u2713" };
}