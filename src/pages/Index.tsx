import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Church, Users, Calendar, Heart, MessageCircle, BookOpen } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function Index() {
  const navigate = useNavigate();

  const features = [
    {
      icon: Church,
      title: "Gestion Multi-Église",
      description: "Gérez plusieurs églises avec une architecture multi-tenant sécurisée",
    },
    {
      icon: Users,
      title: "Gestion des Membres",
      description: "Suivez les membres, baptêmes, et statuts d'adhésion",
    },
    {
      icon: Calendar,
      title: "Événements",
      description: "Organisez cultes, conférences et activités communautaires",
    },
    {
      icon: Heart,
      title: "Dons en Ligne",
      description: "Collectez dîmes et offrandes via Paystack (XOF)",
    },
    {
      icon: MessageCircle,
      title: "Chatbot Spirituel",
      description: "Assistant IA biblique disponible 24/7",
    },
    {
      icon: BookOpen,
      title: "Base de Connaissances",
      description: "150+ questions bibliques, versets et prières",
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-accent/5">
      {/* Hero Section */}
      <div className="container mx-auto px-4 py-16">
        <div className="text-center mb-16">
          <div className="flex justify-center mb-6">
            <div className="w-20 h-20 bg-primary rounded-full flex items-center justify-center">
              <Church className="w-12 h-12 text-primary-foreground" />
            </div>
          </div>
          <h1 className="text-5xl font-bold mb-4 bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
            IVOIRE ÉGLISE+
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-8">
            Plateforme complète de gestion d'église avec assistant spirituel IA pour les églises de Côte d'Ivoire
          </p>
          <div className="flex gap-4 justify-center">
            <Button size="lg" onClick={() => navigate("/auth")}>
              Commencer
            </Button>
            <Button size="lg" variant="outline" onClick={() => navigate("/chatbot")}>
              Essayer le Chatbot
            </Button>
          </div>
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
          {features.map((feature, index) => (
            <Card key={index} className="border-primary/10 hover:border-primary/30 transition-colors">
              <CardHeader>
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                  <feature.icon className="w-6 h-6 text-primary" />
                </div>
                <CardTitle className="text-lg">{feature.title}</CardTitle>
                <CardDescription>{feature.description}</CardDescription>
              </CardHeader>
            </Card>
          ))}
        </div>

        {/* CTA Section */}
        <div className="mt-16 text-center">
          <Card className="max-w-2xl mx-auto bg-gradient-to-r from-primary/10 to-accent/10 border-primary/20">
            <CardHeader>
              <CardTitle className="text-2xl">Prêt à commencer ?</CardTitle>
              <CardDescription className="text-base">
                Inscrivez-vous en tant que pasteur pour créer votre église ou en tant que fidèle pour rejoindre une communauté existante
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button size="lg" onClick={() => navigate("/auth")} className="w-full sm:w-auto">
                Créer un compte
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
