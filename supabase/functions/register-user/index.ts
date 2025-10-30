import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { email, password, fullName, userType, churchName, churchId } = await req.json();

    // Validation
    if (!email || !password || !fullName || !userType) {
      return new Response(
        JSON.stringify({ error: "Paramètres manquants" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (userType === "pastor" && !churchName) {
      return new Response(
        JSON.stringify({ error: "Le nom de l'église est obligatoire pour les pasteurs" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (userType === "member" && !churchId) {
      return new Response(
        JSON.stringify({ error: "L'église est obligatoire pour les membres" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Utiliser le service role key pour contourner RLS
    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false,
        },
      }
    );

    // Créer l'utilisateur
    const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: true, // Auto-confirmer l'email pour simplifier
    });

    if (authError) {
      if (authError.message.includes("already been registered")) {
        throw new Error("Un compte avec cet email existe déjà. Veuillez vous connecter ou utiliser un autre email.");
      }
      throw authError;
    }
    if (!authData.user) throw new Error("Erreur lors de la création du compte");

    const userId = authData.user.id;
    let finalChurchId = churchId;

    // Si c'est un pasteur, créer l'église
    if (userType === "pastor") {
      const { data: churchData, error: churchError } = await supabaseAdmin
        .from("churches")
        .insert({ name: churchName.trim() })
        .select()
        .single();

      if (churchError) throw churchError;
      finalChurchId = churchData.id;
    }

    // Créer le profil
    const { error: profileError } = await supabaseAdmin
      .from("profiles")
      .insert({
        user_id: userId,
        full_name: fullName.trim(),
        church_id: finalChurchId,
      });

    if (profileError) throw profileError;

    // Assigner le rôle
    const { error: roleError } = await supabaseAdmin
      .from("user_roles")
      .insert({
        user_id: userId,
        role: userType,
      });

    if (roleError) throw roleError;

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: "Inscription réussie !",
        userId: userId
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Erreur d'inscription:", error);
    const errorMessage = error instanceof Error ? error.message : "Erreur inconnue";
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
