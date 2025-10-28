import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ArrowLeft, Heart } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function MakeDonation() {
  const [donorName, setDonorName] = useState("");
  const [donorEmail, setDonorEmail] = useState("");
  const [donorPhone, setDonorPhone] = useState("");
  const [amount, setAmount] = useState("");
  const [donationType, setDonationType] = useState("tithe");
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      const { data: profile } = await supabase
        .from("eglise_profiles")
        .select("church_id")
        .eq("id", user?.id)
        .single();

      if (!profile?.church_id) {
        throw new Error("Vous devez être membre d'une église");
      }

      const { error } = await supabase.from("eglise_church_donations").insert({
        church_id: profile.church_id,
        donor_name: donorName,
        donor_email: donorEmail,
        donor_phone: donorPhone,
        amount: parseFloat(amount),
        donation_type: donationType,
        notes: notes || null,
        payment_status: "pending",
        currency: "XOF",
      });

      if (error) throw error;

      toast({
        title: "Don enregistré !",
        description: "Votre don a été enregistré avec succès. Merci pour votre générosité !",
      });

      // Reset form
      setDonorName("");
      setDonorEmail("");
      setDonorPhone("");
      setAmount("");
      setNotes("");
      setDonationType("tithe");

      navigate("/dashboard");
    } catch (error: any) {
      toast({
        title: "Erreur",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-primary/10">
      <header className="border-b bg-card/50 backdrop-blur">
        <div className="container mx-auto px-4 py-4 flex items-center">
          <Button variant="ghost" onClick={() => navigate("/dashboard")}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Retour
          </Button>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-2xl">
        <Card>
          <CardHeader className="text-center">
            <div className="mx-auto w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-4">
              <Heart className="w-8 h-8 text-primary" />
            </div>
            <CardTitle className="text-2xl">Faire un don</CardTitle>
            <CardDescription>
              Soutenez l'œuvre de Dieu par votre générosité
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="donorName">Nom complet *</Label>
                <Input
                  id="donorName"
                  value={donorName}
                  onChange={(e) => setDonorName(e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="donorEmail">Email</Label>
                <Input
                  id="donorEmail"
                  type="email"
                  value={donorEmail}
                  onChange={(e) => setDonorEmail(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="donorPhone">Téléphone *</Label>
                <Input
                  id="donorPhone"
                  type="tel"
                  value={donorPhone}
                  onChange={(e) => setDonorPhone(e.target.value)}
                  required
                  placeholder="+225 XX XX XX XX XX"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="donationType">Type de don *</Label>
                <Select value={donationType} onValueChange={setDonationType}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="tithe">Dîme</SelectItem>
                    <SelectItem value="offering">Offrande</SelectItem>
                    <SelectItem value="project">Projet spécial</SelectItem>
                    <SelectItem value="missionary">Mission</SelectItem>
                    <SelectItem value="other">Autre</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="amount">Montant (XOF) *</Label>
                <Input
                  id="amount"
                  type="number"
                  min="100"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  required
                  placeholder="5000"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="notes">Message (optionnel)</Label>
                <Textarea
                  id="notes"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Ajoutez un message ou une intention de prière..."
                  rows={3}
                />
              </div>

              <div className="bg-muted p-4 rounded-md">
                <p className="text-sm text-muted-foreground">
                  <strong>Note :</strong> Votre don sera enregistré et un reçu vous sera fourni.
                  Pour les paiements en ligne, vous serez redirigé vers notre plateforme de paiement sécurisée.
                </p>
              </div>

              <Button type="submit" className="w-full" size="lg" disabled={loading}>
                {loading ? "Traitement..." : "Confirmer le don"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
