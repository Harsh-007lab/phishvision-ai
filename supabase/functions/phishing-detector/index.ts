import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface PhishingFeatures {
  urlLength: number;
  domainLength: number;
  numDots: number;
  numSubdomains: number;
  hasHttps: boolean;
  hasAtSymbol: boolean;
  hasDash: boolean;
  hasIpAddress: boolean;
  containsSuspiciousWord: boolean;
  hasShortener: boolean;
  hasSuspiciousTld: boolean;
  numDigits: number;
}

function extractFeatures(url: string): PhishingFeatures {
  const suspiciousWords = ['login', 'secure', 'update', 'verify', 'account', 'banking', 'signin', 'password', 'confirm', 'suspended'];
  const shorteners = ['bit.ly', 'tinyurl', 'goo.gl', 'ow.ly', 't.co', 'is.gd'];
  const suspiciousTlds = ['.tk', '.ml', '.ga', '.cf', '.gq', '.xyz', '.top', '.club'];

  const hasHttps = url.startsWith('https://');
  const urlWithoutProtocol = url.replace(/^https?:\/\//, '');
  const domainMatch = urlWithoutProtocol.split('/')[0];
  const domain = domainMatch || '';

  return {
    urlLength: url.length,
    domainLength: domain.length,
    numDots: (url.match(/\./g) || []).length,
    numSubdomains: domain.split('.').length - 2,
    hasHttps,
    hasAtSymbol: url.includes('@'),
    hasDash: domain.includes('-'),
    hasIpAddress: /\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}/.test(domain),
    containsSuspiciousWord: suspiciousWords.some(word => url.toLowerCase().includes(word)),
    hasShortener: shorteners.some(shortener => url.includes(shortener)),
    hasSuspiciousTld: suspiciousTlds.some(tld => domain.toLowerCase().endsWith(tld)),
    numDigits: (url.match(/\d/g) || []).length,
  };
}

function calculatePhishingScore(features: PhishingFeatures): number {
  let score = 0;

  // URL length scoring
  if (features.urlLength > 75) score += 0.15;
  else if (features.urlLength > 54) score += 0.08;

  // Domain length scoring
  if (features.domainLength > 30) score += 0.12;

  // Subdomain scoring
  if (features.numSubdomains > 3) score += 0.18;
  else if (features.numSubdomains > 2) score += 0.10;

  // HTTPS scoring (lack of HTTPS is suspicious)
  if (!features.hasHttps) score += 0.12;

  // Special character scoring
  if (features.hasAtSymbol) score += 0.20;
  if (features.hasDash) score += 0.06;
  if (features.hasIpAddress) score += 0.25;

  // Suspicious words
  if (features.containsSuspiciousWord) score += 0.18;

  // URL shorteners
  if (features.hasShortener) score += 0.15;

  // Suspicious TLD
  if (features.hasSuspiciousTld) score += 0.20;

  // Too many dots
  if (features.numDots > 5) score += 0.12;

  // Many digits (often in phishing URLs)
  if (features.numDigits > 10) score += 0.10;

  // Normalize score to 0-1 range
  return Math.min(score, 1.0);
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { url } = await req.json();

    if (!url || typeof url !== 'string') {
      return new Response(
        JSON.stringify({ error: 'Invalid URL provided' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Validate URL format
    try {
      new URL(url);
    } catch {
      return new Response(
        JSON.stringify({ error: 'Malformed URL' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const features = extractFeatures(url);
    const score = calculatePhishingScore(features);
    const label = score > 0.5 ? 'phishing' : 'safe';

    console.log(`🔍 Analyzed URL: ${url} | Score: ${score.toFixed(2)} | Label: ${label}`);

    return new Response(
      JSON.stringify({ 
        score: parseFloat(score.toFixed(2)),
        label,
        confidence: parseFloat((score * 100).toFixed(1)),
      }),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  } catch (error) {
    console.error('❌ Error in phishing-detector:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
