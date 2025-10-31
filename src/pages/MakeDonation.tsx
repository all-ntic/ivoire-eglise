import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeft, DollarSign } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

const SUGGESTED_AMOUNTS = [5000, 10000, 25000, 50000, 100000];

export default function MakeDonation() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [churchId, setChurchId] = useState<string | null>(null);
  const [selectedAmount, setSelectedAmount] = useState<number | null>(null);
  const [customAmount, setCustomAmount] = useState("");
  const [donorName, setDonorName] = useState("");
  const [donorEmail, setDonorEmail] = useState("");
  const [donorPhone, setDonorPhone] = useState("");
  const [donationType, setDonationType] = useState("offrande");
  const [notes, setNotes] = useState("");

  useEffect(() => {
    const loadUserChurch = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        navigate("/auth");
        return;
      }

      const { data: profile } = await supabase
        .from("profiles")
        .select("church_id, full_name")
        .eq("user_id", user.id)
        .single();

      if (profile) {
        setChurchId(profile.church_id);
        setDonorName(profile.full_name || "");
        setDonorEmail(user.email || "");
      }
    };

    loadUserChurch();
  }, [navigate]);

  const getFinalAmount = () => {
    if (selectedAmount) return selectedAmount;
    const amount = parseFloat(customAmount);
    return isNaN(amount) ? 0 : amount;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const amount = getFinalAmount();
    
    if (amount < 100) {
      toast({
        title: "Erreur",
        description: "Le montant minimum est de 100 XOF",
        variant: "destructive",
      });
      return;
    }

    if (!churchId) {
      toast({
        title: "Erreur",
        description: "Impossible de déterminer votre église",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);

    try {
      // Créer l'enregistrement de don dans Supabase
      const { data: donation, error: donationError } = await supabase
        .from("donations")
        .insert({
          church_id: churchId,
          amount,
          donor_name: donorName,
          donor_email: donorEmail || null,
          donor_phone: donorPhone,
          donation_type: donationType,
          notes: notes || null,
          payment_status: "pending",
        })
        .select()
        .single();

      if (donationError) throw donationError;

      // Initialiser le paiement Paystack
      const { data: paystackData, error: paystackError } = await supabase.functions.invoke(
        "initialize-paystack-payment",
        {
          body: {
            email: donorEmail,
            amount: amount * 100, // Paystack utilise les centimes
            reference: donation.id,
            metadata: {
              donation_id: donation.id,
              donor_name: donorName,
              donation_type: donationType,
            },
          },
        }
      );

      if (paystackError) throw paystackError;

      // Rediriger vers la page de paiement Paystack
      if (paystackData?.authorization_url) {
        window.location.href = paystackData.authorization_url;
      } else {
        throw new Error("URL de paiement non reçue");
      }
    } catch (error: any) {
      console.error("Erreur lors du don:", error);
      toast({
        title: "Erreur",
        description: error.message || "Une erreur est survenue",
        variant: "destructive",
      });
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
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <DollarSign className="h-6 w-6" />
              Faire un don
            </CardTitle>
            <CardDescription>
              Soutenez votre église par un don financier
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-4">
                <Label>Montant suggéré (XOF)</Label>
                <div className="grid grid-cols-3 gap-3">
                  {SUGGESTED_AMOUNTS.map((amount) => (
                    <Button
                      key={amount}
                      type="button"
                      variant={selectedAmount === amount ? "default" : "outline"}
                      onClick={() => {
                        setSelectedAmount(amount);
                        setCustomAmount("");
                      }}
                    >
                      {amount.toLocaleString()} XOF
                    </Button>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="customAmount">Ou montant personnalisé (XOF)</Label>
                <Input
                  id="customAmount"
                  type="number"
                  placeholder="Entrez un montant"
                  value={customAmount}
                  onChange={(e) => {
                    setCustomAmount(e.target.value);
                    setSelectedAmount(null);
                  }}
                  min="100"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="donationType">Type de don *</Label>
                <Select value={donationType} onValueChange={setDonationType}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="dime">Dîme</SelectItem>
                    <SelectItem value="offrande">Offrande</SelectItem>
                    <SelectItem value="soutien">Soutien spécial</SelectItem>
                    <SelectItem value="projet">Projet</SelectItem>
                    <SelectItem value="autre">Autre</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="donorName">Nom complet *</Label>
                <Input
                  id="donorName"
                  type="text"
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
                  placeholder="email@exemple.com"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="donorPhone">Téléphone *</Label>
                <Input
                  id="donorPhone"
                  type="tel"
                  value={donorPhone}
                  onChange={(e) => setDonorPhone(e.target.value)}
                  placeholder="+225 XX XX XX XX XX"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="notes">Note (optionnelle)</Label>
                <Textarea
                  id="notes"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Ajoutez une note à votre don..."
                  rows={3}
                />
              </div>

              <div className="pt-4 border-t">
                <div className="flex justify-between items-center mb-4">
                  <span className="text-lg font-semibold">Montant total :</span>
                  <span className="text-2xl font-bold text-primary">
                    {getFinalAmount().toLocaleString()} XOF
                  </span>
                </div>
                <Button type="submit" className="w-full" size="lg" disabled={loading || getFinalAmount() < 100}>
                  {loading ? "Traitement..." : "Procéder au paiement"}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
