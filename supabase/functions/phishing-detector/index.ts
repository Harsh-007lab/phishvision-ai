import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.38.4';
import { z } from 'https://deno.land/x/zod@v3.22.4/mod.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Simple in-memory rate limiter
const rateLimiter = new Map<string, { count: number; resetTime: number }>();
const RATE_LIMIT = 20; // requests per minute
const RATE_WINDOW = 60000; // 1 minute in milliseconds

function checkRateLimit(ip: string): { allowed: boolean; remaining: number } {
  const now = Date.now();
  const record = rateLimiter.get(ip);

  if (!record || now > record.resetTime) {
    rateLimiter.set(ip, { count: 1, resetTime: now + RATE_WINDOW });
    return { allowed: true, remaining: RATE_LIMIT - 1 };
  }

  if (record.count >= RATE_LIMIT) {
    return { allowed: false, remaining: 0 };
  }

  record.count++;
  return { allowed: true, remaining: RATE_LIMIT - record.count };
}

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

async function generateAIExplanation(url: string, features: PhishingFeatures, score: number): Promise<string> {
  try {
    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      return generateRuleBasedExplanation(features, score);
    }

    const prompt = `Analyze this URL for phishing indicators: ${url}
    
Score: ${score.toFixed(2)} (0=safe, 1=phishing)
Features detected:
- URL length: ${features.urlLength}
- Has HTTPS: ${features.hasHttps}
- Suspicious words: ${features.containsSuspiciousWord}
- IP address in domain: ${features.hasIpAddress}
- Suspicious TLD: ${features.hasSuspiciousTld}
- URL shortener: ${features.hasShortener}

Provide a brief, user-friendly 2-sentence explanation of why this URL is ${score > 0.5 ? 'suspicious' : 'safe'}.`;

    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          { role: 'system', content: 'You are a cybersecurity expert. Provide clear, concise explanations.' },
          { role: 'user', content: prompt }
        ],
      }),
    });

    if (!response.ok) {
      console.error('AI API error:', response.status);
      return generateRuleBasedExplanation(features, score);
    }

    const data = await response.json();
    return data.choices[0]?.message?.content || generateRuleBasedExplanation(features, score);
  } catch (error) {
    console.error('AI explanation error:', error);
    return generateRuleBasedExplanation(features, score);
  }
}

function generateRuleBasedExplanation(features: PhishingFeatures, score: number): string {
  if (score > 0.5) {
    const reasons = [];
    if (features.hasIpAddress) reasons.push('uses IP address instead of domain');
    if (!features.hasHttps) reasons.push('lacks HTTPS encryption');
    if (features.containsSuspiciousWord) reasons.push('contains suspicious keywords like "login" or "verify"');
    if (features.hasSuspiciousTld) reasons.push('uses suspicious domain extension');
    if (features.hasShortener) reasons.push('is a URL shortener');
    
    return `This URL appears suspicious because it ${reasons.slice(0, 2).join(' and ')}. Be cautious when clicking such links.`;
  } else {
    return 'This URL appears legitimate with standard security indicators and no obvious phishing patterns detected.';
  }
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Rate limiting check
    const clientIP = req.headers.get('x-forwarded-for')?.split(',')[0] || 
                     req.headers.get('x-real-ip') || 
                     'unknown';
    
    const rateCheck = checkRateLimit(clientIP);
    if (!rateCheck.allowed) {
      return new Response(
        JSON.stringify({ error: 'Rate limit exceeded. Please try again later.' }),
        { 
          status: 429, 
          headers: { 
            ...corsHeaders, 
            'Content-Type': 'application/json',
            'X-RateLimit-Remaining': '0',
            'Retry-After': '60'
          } 
        }
      );
    }

    const requestBody = await req.json();

    // Define comprehensive validation schema
    const scanSchema = z.object({
      url: z.string().trim().max(2048, { message: 'URL must be less than 2048 characters' }),
      includeExplanation: z.boolean().optional().default(false)
    });

    // Validate input
    const validationResult = scanSchema.safeParse(requestBody);
    
    if (!validationResult.success) {
      const errors = validationResult.error.errors.map(err => `${err.path.join('.')}: ${err.message}`).join(', ');
      return new Response(
        JSON.stringify({ error: 'Validation failed', details: errors }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    let { url, includeExplanation } = validationResult.data;

    // Auto-prepend https:// if protocol is missing
    if (!url.startsWith('http://') && !url.startsWith('https://')) {
      url = 'https://' + url;
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
    
    let explanation = null;
    if (includeExplanation) {
      explanation = await generateAIExplanation(url, features, score);
    }

    console.log(`🔍 Analyzed URL: ${url} | Score: ${score.toFixed(2)} | Label: ${label}`);

    // Save to database
    try {
      const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
      const supabaseKey = Deno.env.get('SUPABASE_ANON_KEY')!;
      const supabase = createClient(supabaseUrl, supabaseKey);
      
      await supabase.from('scan_history').insert({
        url,
        label,
        score: parseFloat(score.toFixed(2)),
        confidence: parseFloat((score * 100).toFixed(1)),
        explanation,
      });
    } catch (dbError) {
      console.error('Database save error:', dbError);
      // Continue even if DB save fails
    }

    return new Response(
      JSON.stringify({ 
        score: parseFloat(score.toFixed(2)),
        label,
        confidence: parseFloat((score * 100).toFixed(1)),
        explanation,
      }),
      { 
        status: 200, 
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json',
          'X-RateLimit-Remaining': rateCheck.remaining.toString()
        } 
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
