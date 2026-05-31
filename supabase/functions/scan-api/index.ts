import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.38.4";
import { z } from "https://deno.land/x/zod@v3.22.4/mod.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-api-key",
  "Access-Control-Max-Age": "86400",
};

async function sha256(input: string): Promise<string> {
  const buf = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(input));
  return Array.from(new Uint8Array(buf)).map((b) => b.toString(16).padStart(2, "0")).join("");
}

interface Features {
  urlLength: number; domainLength: number; numDots: number; numSubdomains: number;
  hasHttps: boolean; hasAtSymbol: boolean; hasDash: boolean; hasIpAddress: boolean;
  containsSuspiciousWord: boolean; hasShortener: boolean; hasSuspiciousTld: boolean; numDigits: number;
}

function extractFeatures(url: string): Features {
  const suspiciousWords = ["login","secure","update","verify","account","banking","signin","password","confirm","suspended"];
  const shorteners = ["bit.ly","tinyurl","goo.gl","ow.ly","t.co","is.gd"];
  const suspiciousTlds = [".tk",".ml",".ga",".cf",".gq",".xyz",".top",".club"];
  const hasHttps = url.startsWith("https://");
  const domain = url.replace(/^https?:\/\//, "").split("/")[0] || "";
  return {
    urlLength: url.length, domainLength: domain.length,
    numDots: (url.match(/\./g) || []).length,
    numSubdomains: domain.split(".").length - 2,
    hasHttps, hasAtSymbol: url.includes("@"), hasDash: domain.includes("-"),
    hasIpAddress: /\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}/.test(domain),
    containsSuspiciousWord: suspiciousWords.some((w) => url.toLowerCase().includes(w)),
    hasShortener: shorteners.some((s) => url.includes(s)),
    hasSuspiciousTld: suspiciousTlds.some((t) => domain.toLowerCase().endsWith(t)),
    numDigits: (url.match(/\d/g) || []).length,
  };
}

function calcScore(f: Features): number {
  let s = 0;
  if (f.urlLength > 75) s += 0.15; else if (f.urlLength > 54) s += 0.08;
  if (f.domainLength > 30) s += 0.12;
  if (f.numSubdomains > 3) s += 0.18; else if (f.numSubdomains > 2) s += 0.10;
  if (!f.hasHttps) s += 0.12;
  if (f.hasAtSymbol) s += 0.20;
  if (f.hasDash) s += 0.06;
  if (f.hasIpAddress) s += 0.25;
  if (f.containsSuspiciousWord) s += 0.18;
  if (f.hasShortener) s += 0.15;
  if (f.hasSuspiciousTld) s += 0.20;
  if (f.numDots > 5) s += 0.12;
  if (f.numDigits > 10) s += 0.10;
  return Math.min(s, 1);
}

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const apiKey = req.headers.get("x-api-key") || "";
    if (!apiKey || !apiKey.startsWith("pv_")) {
      return new Response(JSON.stringify({ error: "Missing or invalid API key. Provide it in the x-api-key header." }), {
        status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );

    const hash = await sha256(apiKey);
    const { data: keyRow } = await supabase
      .from("api_keys")
      .select("id, user_id, revoked_at")
      .eq("key_hash", hash)
      .maybeSingle();

    if (!keyRow || keyRow.revoked_at) {
      return new Response(JSON.stringify({ error: "Invalid or revoked API key." }), {
        status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const body = await req.json().catch(() => ({}));
    const schema = z.object({
      url: z.string().trim().min(1).max(2048),
    });
    const parsed = schema.safeParse(body);
    if (!parsed.success) {
      return new Response(JSON.stringify({ error: "Validation failed", details: parsed.error.flatten().fieldErrors }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    let { url } = parsed.data;
    if (!url.startsWith("http://") && !url.startsWith("https://")) url = "https://" + url;

    let urlObj: URL;
    try { urlObj = new URL(url); } catch {
      return new Response(JSON.stringify({ error: "Malformed URL" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const hostname = urlObj.hostname.toLowerCase();
    const privateRanges = [/^127\./,/^10\./,/^172\.(1[6-9]|2[0-9]|3[0-1])\./,/^192\.168\./,/^169\.254\./,/^0\./,/^::1$/,/^fe80:/i,/^fc00:/i,/^fd00:/i,/^localhost$/i];
    if (privateRanges.some((r) => r.test(hostname))) {
      return new Response(JSON.stringify({ error: "Private or reserved addresses are not allowed" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const features = extractFeatures(url);
    const score = calcScore(features);
    const label = score > 0.5 ? "phishing" : "safe";
    const confidence = parseFloat((score * 100).toFixed(1));

    // Persist scan + update last_used_at (best effort)
    await Promise.allSettled([
      supabase.from("scan_history").insert({
        url, label, score: parseFloat(score.toFixed(2)), confidence, user_id: keyRow.user_id,
      }),
      supabase.from("api_keys").update({ last_used_at: new Date().toISOString() }).eq("id", keyRow.id),
    ]);

    return new Response(JSON.stringify({
      url, label, confidence, score: parseFloat(score.toFixed(2)),
      explanation: label === "phishing"
        ? "Heuristic indicators suggest this URL is likely a phishing attempt."
        : "No significant phishing indicators detected.",
    }), { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  } catch (e) {
    console.error("scan-api error:", e);
    return new Response(JSON.stringify({ error: "Internal error" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});