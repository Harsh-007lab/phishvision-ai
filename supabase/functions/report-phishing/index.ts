import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.38.4';
import { z } from 'https://deno.land/x/zod@v3.22.4/mod.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const requestBody = await req.json();

    // Define comprehensive validation schema
    const reportSchema = z.object({
      url: z.string().trim().url({ message: 'Invalid URL format' }).max(2048, { message: 'URL must be less than 2048 characters' }),
      email: z.string().trim().email({ message: 'Invalid email format' }).max(254, { message: 'Email must be less than 254 characters' }).optional().or(z.literal('')),
      description: z.string().trim().max(2000, { message: 'Description must be less than 2000 characters' }).optional().or(z.literal(''))
    });

    // Validate input
    const validationResult = reportSchema.safeParse(requestBody);
    
    if (!validationResult.success) {
      const errors = validationResult.error.errors.map(err => `${err.path.join('.')}: ${err.message}`).join(', ');
      return new Response(
        JSON.stringify({ error: 'Validation failed', details: errors }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const { url, email, description } = validationResult.data;

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_ANON_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const { error } = await supabase.from('phishing_reports').insert({
      url,
      reporter_email: email || null,
      description: description || null,
    });

    if (error) throw error;

    console.log(`📢 New phishing report: ${url}`);

    return new Response(
      JSON.stringify({ success: true, message: 'Report submitted successfully' }),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  } catch (error) {
    console.error('❌ Error in report-phishing:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
