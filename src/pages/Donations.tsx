import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function Donations() {
  const [donations, setDonations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    loadDonations();
  }, []);

  const loadDonations = async () => {
    try {
      const { data, error } = await supabase
        .from("church_donations")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setDonations(data || []);
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

  const totalAmount = donations
    .filter((d) => d.payment_status === "completed")
    .reduce((sum, d) => sum + parseFloat(d.amount), 0);

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-card">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" onClick={() => navigate("/dashboard")}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Retour
            </Button>
            <h1 className="text-2xl font-bold">Gestion des Dons</h1>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Total des dons reçus</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-primary">
              {totalAmount.toLocaleString("fr-FR")} XOF
            </p>
          </CardContent>
        </Card>

        {loading ? (
          <div className="text-center py-8">Chargement...</div>
        ) : donations.length === 0 ? (
          <Card>
            <CardContent className="text-center py-8">
              <p className="text-muted-foreground">Aucun don enregistré</p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {donations.map((donation) => (
              <Card key={donation.id}>
                <CardContent className="pt-6">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-medium">{donation.donor_name}</p>
                      <p className="text-sm text-muted-foreground">{donation.donor_phone}</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        Type: {donation.donation_type}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-xl font-bold text-primary">
                        {parseFloat(donation.amount).toLocaleString("fr-FR")} {donation.currency}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Statut: {donation.payment_status}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
