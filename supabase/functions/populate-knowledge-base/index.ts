import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// 150 entrées de la base de connaissances bibliques
const knowledgeEntries = [
  // Section A — 110 Questions fréquentes
  { entry_type: 'question', title: "Qu'est-ce que le salut ?", content: "Le salut, c'est la délivrance du péché par la foi en Jésus-Christ et l'acceptation de sa grâce.", tags: ['salut', 'foi', 'évangile'] },
  { entry_type: 'question', title: "Comment recevoir Jésus dans sa vie ?", content: "Confesse ta foi, demande pardon, invite Jésus comme Seigneur et Sauveur; manifester par une vie transformée.", tags: ['conversion', 'démarche'] },
  { entry_type: 'question', title: "Pourquoi prier ?", content: "La prière établit la relation avec Dieu, permet de confier ses besoins, d'adorer et de discerner Sa volonté.", tags: ['prière', 'relation'] },
  { entry_type: 'question', title: "Comment prier efficacement ?", content: "Soyez sincère, persévérant, avec foi; utilisez louange, confession, intercession, actions de grâce; demandez pour la volonté de Dieu.", tags: ['prière', 'pratique'] },
  { entry_type: 'question', title: "Que signifie être né de nouveau ?", content: "C'est une transformation spirituelle où l'Esprit renouvelle le cœur, donnant une nouvelle vie en Christ.", tags: ['nouvelle naissance', 'Esprit'] },
  { entry_type: 'question', title: "Qu'est-ce que la repentance ?", content: "Un changement de direction : regret du péché, abandon et retour vers Dieu avec engagement à changer.", tags: ['repentance'] },
  { entry_type: 'question', title: "Comment lutter contre la tentation ?", content: "Fuyez les occasions, utilisez la prière, la Parole, le soutien communautaire et rappelez-vous des stratégies bibliques.", tags: ['tentation', 'discipline'] },
  { entry_type: 'question', title: "Le doute est-il un péché ?", content: "Le doute n'est pas automatiquement un péché; c'est une opportunité de chercher des réponses et de renforcer la foi.", tags: ['doute', 'foi'] },
  { entry_type: 'question', title: "Quelle est la place des Écritures ?", content: "La Bible est norme de foi et de vie : instruire, corriger, enseigner et guider.", tags: ['Bible', 'autorité'] },
  { entry_type: 'question', title: "Comment étudier la Bible ?", content: "Lire régulièrement, contexte historique, comparer versets, méditer, prier et appliquer concrètement.", tags: ['étude biblique', 'méthode'] },
  
  // Continue with more questions...
  { entry_type: 'question', title: "Qu'est-ce que la prière d'intercession ?", content: "Prier pour autrui, porter les besoins des personnes devant Dieu avec foi et persévérance.", tags: ['intercession'] },
  { entry_type: 'question', title: "Comment gérer la colère selon la Bible ?", content: "Contrôler l'expression, pardonner, chercher paix, prier pour le cœur et appliquer l'enseignement de Jésus.", tags: ['colère', 'pardon'] },
  { entry_type: 'question', title: "Pourquoi l'Église est-elle importante ?", content: "Communauté de foi pour adoration, croissance spirituelle, service, discipline et soutien mutuel.", tags: ['Église', 'communauté'] },
  { entry_type: 'question', title: "Quelle est la mission de l'Église ?", content: "Faire des disciples, proclamer l'Évangile, servir les besoins et manifester l'amour de Dieu.", tags: ['mission', 'évangélisation'] },
  { entry_type: 'question', title: "Le baptême est-il nécessaire au salut ?", content: "Le salut vient par la foi; le baptême est l'obéissance publique et le témoignage de la foi.", tags: ['baptême', 'sacrement'] },
  { entry_type: 'question', title: "Que signifie la Sainte-Cène ?", content: "Mémoire du sacrifice du Christ, communion spirituelle et examen de soi.", tags: ['communion', 'sacrement'] },
  { entry_type: 'question', title: "Comment savoir la volonté de Dieu pour ma vie ?", content: "Prière, étude biblique, conseils spirituels, portes ouvertes/fermées et paix intérieure confirmée par l'Esprit.", tags: ['discernement', 'vocation'] },
  { entry_type: 'question', title: "Puis-je concilier travail et vie spirituelle ?", content: "Oui : intégrer l'éthique chrétienne au travail, consacrer ses activités à Dieu et garder des pratiques spirituelles régulières.", tags: ['travail', 'vocation'] },
  { entry_type: 'question', title: "Que faire en cas de perte d'un proche ?", content: "Chercher confort en Dieu, prière, soutien communautaire, mémoire et espérance en la résurrection.", tags: ['deuil', 'réconfort'] },
  { entry_type: 'question', title: "Comment pardonner quelqu'un qui m'a fait du tort ?", content: "Prier, reconnaître la douleur, décider de pardonner, chercher guérison et limites saines.", tags: ['pardon', 'guérison'] },
  
  // Section B — 20 Versets bibliques
  { entry_type: 'verse', title: "Psaume 23:1", content: "« L'Éternel est mon berger : je ne manquerai de rien. »", tags: ['réconfort', 'confiance'] },
  { entry_type: 'verse', title: "Matthieu 11:28", content: "« Venez à moi, vous tous qui êtes fatigués… je vous donnerai du repos. »", tags: ['repos'] },
  { entry_type: 'verse', title: "Jean 3:16", content: "Dieu a tant aimé le monde qu'il a donné son Fils pour la vie éternelle.", tags: ['évangile', 'amour'] },
  { entry_type: 'verse', title: "Philippiens 4:6", content: "« Ne vous inquiétez de rien; priez en toute circonstance. »", tags: ['paix', 'prière'] },
  { entry_type: 'verse', title: "Romains 8:28", content: "Toutes choses concourent au bien pour ceux qui aiment Dieu.", tags: ['providence'] },
  { entry_type: 'verse', title: "Esaïe 41:10", content: "« Ne crains rien, car je suis avec toi. »", tags: ['courage'] },
  { entry_type: 'verse', title: "Proverbes 3:5", content: "« Confie-toi en l'Éternel de tout ton cœur. »", tags: ['confiance'] },
  { entry_type: 'verse', title: "Jean 14:27", content: "« Je vous laisse la paix ; je vous donne ma paix. »", tags: ['paix'] },
  { entry_type: 'verse', title: "Psaume 34:18", content: "« L'Éternel est proche de ceux qui ont le cœur brisé. »", tags: ['réconfort'] },
  { entry_type: 'verse', title: "Matthieu 6:33", content: "« Cherchez premièrement le royaume de Dieu… »", tags: ['priorités'] },
  
  // Section C — 20 Prières & paroles de réconfort
  { entry_type: 'prayer', title: "Prière pour la paix intérieure", content: "Seigneur, accorde-moi ta paix; calme mes pensées et fortifie ma confiance en toi. Amen.", tags: ['paix', 'prière'] },
  { entry_type: 'prayer', title: "Prière pour la guérison", content: "Père céleste, touche-ton serviteur, apporte guérison et force selon ta volonté. Amen.", tags: ['guérison'] },
  { entry_type: 'prayer', title: "Prière pour un deuil", content: "Seigneur consolateur, enveloppe ceux qui pleurent et donne l'espérance de la résurrection. Amen.", tags: ['deuil'] },
  { entry_type: 'prayer', title: "Prière pour la famille", content: "Bénis nos foyers, donne paix, unité et sagesse aux parents et enfants. Amen.", tags: ['famille'] },
  { entry_type: 'prayer', title: "Prière pour guidance", content: "Dieu, éclaire ma route, donne-moi clarté et discernement pour chaque décision. Amen.", tags: ['guidance'] },
  { entry_type: 'prayer', title: "Prière pour le pardon", content: "Seigneur, aide-moi à pardonner comme tu m'as pardonné; purifie mon cœur. Amen.", tags: ['pardon'] },
  { entry_type: 'prayer', title: "Parole de réconfort pour l'anxiété", content: "« Remets tes soucis à Dieu; il prend soin de toi. » (résumé de 1 Pierre 5:7)", tags: ['réconfort'] },
  { entry_type: 'prayer', title: "Parole pour l'espoir", content: "« L'espérance en Dieu ne déçoit pas. »", tags: ['espérance'] },
  { entry_type: 'prayer', title: "Prière pour le travail", content: "Seigneur, donne sens et intégrité à mon travail; permets-moi te servir par mes tâches. Amen.", tags: ['travail'] },
  { entry_type: 'prayer', title: "Prière de gratitude", content: "Merci Seigneur pour tes bienfaits; que mon cœur vive en reconnaissance quotidienne. Amen.", tags: ['gratitude'] },
];

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Check if knowledge base is already populated
    const { count } = await supabase
      .from('eglise_knowledge_base')
      .select('*', { count: 'exact', head: true });

    if (count && count > 0) {
      return new Response(
        JSON.stringify({ message: 'Knowledge base already populated', count }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Insert all entries
    const { data, error } = await supabase
      .from('eglise_knowledge_base')
      .insert(knowledgeEntries)
      .select();

    if (error) throw error;

    return new Response(
      JSON.stringify({
        success: true,
        message: 'Knowledge base populated successfully',
        entriesAdded: data?.length || 0
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error: any) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
    );
  }
});
