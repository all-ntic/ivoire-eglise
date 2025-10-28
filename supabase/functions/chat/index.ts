import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface Message {
  role: string;
  content: string;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { message, conversationId, sessionId } = await req.json();

    if (!message) {
      throw new Error("Message is required");
    }

    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    // Rate limiting
    const identifier = sessionId || req.headers.get("x-forwarded-for") || "anonymous";
    const { data: rateLimitData } = await supabaseClient
      .from("chatbot_rate_limits")
      .select("*")
      .eq("identifier", identifier)
      .gte("window_start", new Date(Date.now() - 60000).toISOString())
      .single();

    if (rateLimitData && rateLimitData.request_count >= 10) {
      return new Response(
        JSON.stringify({ error: "Limite de requêtes atteinte. Réessayez dans 1 minute." }),
        { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (rateLimitData) {
      await supabaseClient
        .from("chatbot_rate_limits")
        .update({ request_count: rateLimitData.request_count + 1 })
        .eq("id", rateLimitData.id);
    } else {
      await supabaseClient
        .from("chatbot_rate_limits")
        .insert({ identifier, request_count: 1, window_start: new Date().toISOString() });
    }

    // Get or create conversation
    let currentConversationId = conversationId;
    
    if (!currentConversationId) {
      const { data: newConv, error: convError } = await supabaseClient
        .from("chat_conversations")
        .insert({ session_id: sessionId || identifier })
        .select()
        .single();

      if (convError) throw convError;
      currentConversationId = newConv.id;
    }

    // Save user message
    await supabaseClient
      .from("chat_messages")
      .insert({
        conversation_id: currentConversationId,
        role: "user",
        content: message,
      });

    // Get conversation history
    const { data: messages } = await supabaseClient
      .from("chat_messages")
      .select("*")
      .eq("conversation_id", currentConversationId)
      .order("created_at", { ascending: true });

    // Search knowledge base
    const { data: knowledgeData } = await supabaseClient
      .from("knowledge_base")
      .select("*")
      .textSearch("content", message, { type: "websearch", config: "french" })
      .limit(5);

    let contextPrompt = "";
    if (knowledgeData && knowledgeData.length > 0) {
      contextPrompt = "\n\nContexte biblique pertinent:\n" + 
        knowledgeData.map(kb => `${kb.title}: ${kb.content}`).join("\n\n");
    }

    // Call OpenAI
    const openAIResponse = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${Deno.env.get("OPENAI_API_KEY")}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [
          {
            role: "system",
            content: `Tu es un assistant spirituel chrétien francophone pour IVOIRE ÉGLISE+. 
Tu réponds avec sagesse, compassion et références bibliques. 
Tu es concis (2-3 paragraphes maximum) et formel.
Utilise le contexte biblique fourni pour enrichir tes réponses.${contextPrompt}`
          },
          ...(messages || []).map((msg: Message) => ({
            role: msg.role,
            content: msg.content,
          })),
        ],
        temperature: 0.7,
        max_tokens: 500,
      }),
    });

    if (!openAIResponse.ok) {
      throw new Error(`OpenAI API error: ${openAIResponse.statusText}`);
    }

    const aiData = await openAIResponse.json();
    const aiMessage = aiData.choices[0].message.content;

    // Save AI response
    await supabaseClient
      .from("chat_messages")
      .insert({
        conversation_id: currentConversationId,
        role: "assistant",
        content: aiMessage,
      });

    return new Response(
      JSON.stringify({
        message: aiMessage,
        conversationId: currentConversationId,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error: any) {
    console.error("Error:", error);
    return new Response(
      JSON.stringify({ error: error.message || "Une erreur est survenue" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
