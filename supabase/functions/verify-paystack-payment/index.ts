import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-paystack-signature',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const paystackSecretKey = Deno.env.get('PAYSTACK_SECRET_KEY');
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

    if (!paystackSecretKey) {
      console.error('PAYSTACK_SECRET_KEY non configurée');
      return new Response(
        JSON.stringify({ error: "Configuration manquante" }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Vérifier la signature Paystack (webhook)
    const signature = req.headers.get('x-paystack-signature');
    const body = await req.text();
    
    if (signature) {
      const crypto = await import("https://deno.land/std@0.168.0/crypto/mod.ts");
      const encoder = new TextEncoder();
      const data = encoder.encode(body);
      const key = encoder.encode(paystackSecretKey);
      
      const hmac = await crypto.crypto.subtle.importKey(
        "raw",
        key,
        { name: "HMAC", hash: "SHA-512" },
        false,
        ["sign"]
      );
      
      const signatureBuffer = await crypto.crypto.subtle.sign("HMAC", hmac, data);
      const computedSignature = Array.from(new Uint8Array(signatureBuffer))
        .map(b => b.toString(16).padStart(2, '0'))
        .join('');

      if (computedSignature !== signature) {
        console.error('Signature Paystack invalide');
        return new Response(
          JSON.stringify({ error: "Signature invalide" }),
          { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
    }

    const event = JSON.parse(body);
    console.log('Webhook Paystack reçu:', event);

    // Initialiser le client Supabase avec les privilèges service
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    if (event.event === 'charge.success') {
      const { reference, amount, metadata } = event.data;
      const donationId = metadata?.donation_id || reference;

      // Mettre à jour le statut du don
      const { error: updateError } = await supabase
        .from('donations')
        .update({ payment_status: 'completed' })
        .eq('id', donationId);

      if (updateError) {
        console.error('Erreur lors de la mise à jour du don:', updateError);
        throw updateError;
      }

      console.log(`Don ${donationId} marqué comme payé`);
    }

    return new Response(
      JSON.stringify({ received: true }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error: any) {
    console.error('Erreur dans verify-paystack-payment:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
