import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, DollarSign, TrendingUp } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface Donation {
  id: string;
  donor_name: string;
  donor_email: string | null;
  donor_phone: string;
  amount: number;
  currency: string;
  donation_type: string;
  payment_status: string | null;
  notes: string | null;
  created_at: string;
}

export default function Donations() {
  const navigate = useNavigate();
  const [donations, setDonations] = useState<Donation[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ total: 0, completed: 0, pending: 0 });

  useEffect(() => {
    fetchDonations();
  }, []);

  const fetchDonations = async () => {
    try {
      const { data, error } = await supabase
        .from("donations")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;

      setDonations(data || []);
      
      // Calculate stats
      const total = data?.reduce((sum, d) => sum + Number(d.amount), 0) || 0;
      const completed = data?.filter(d => d.payment_status === 'completed').length || 0;
      const pending = data?.filter(d => d.payment_status === 'pending').length || 0;
      
      setStats({ total, completed, pending });
    } catch (error: any) {
      toast.error("Erreur lors du chargement des dons");
      console.error("Error fetching donations:", error);
    } finally {
      setLoading(false);
    }
  };

  const getDonationTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      dime: "Dîme",
      offrande: "Offrande",
      soutien: "Soutien",
      projet: "Projet",
      autre: "Autre",
    };
    return labels[type] || type;
  };

  const getStatusBadge = (status: string | null) => {
    if (status === "completed") {
      return <Badge className="bg-green-500">Complété</Badge>;
    }
    return <Badge variant="secondary">En attente</Badge>;
  };

  const formatCurrency = (amount: number, currency: string) => {
    return new Intl.NumberFormat("fr-FR", {
      style: "currency",
      currency: currency,
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("fr-FR", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-card">
        <div className="container mx-auto px-4 py-4 flex items-center">
          <Button variant="ghost" onClick={() => navigate("/dashboard")}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Retour
          </Button>
        </div>
      </header>
      <main className="container mx-auto px-4 py-8">
        <div className="mb-6">
          <h1 className="text-3xl font-bold mb-2">Gestion des Dons</h1>
          <p className="text-muted-foreground">
            Visualisez et gérez les dons des fidèles
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid gap-4 md:grid-cols-3 mb-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Total des Dons
              </CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {formatCurrency(stats.total, "XOF")}
              </div>
              <p className="text-xs text-muted-foreground">
                Tous les dons confondus
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Dons Complétés
              </CardTitle>
              <TrendingUp className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.completed}</div>
              <p className="text-xs text-muted-foreground">
                Paiements confirmés
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                En Attente
              </CardTitle>
              <DollarSign className="h-4 w-4 text-yellow-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.pending}</div>
              <p className="text-xs text-muted-foreground">
                En cours de traitement
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Donations Table */}
        <Card>
          <CardHeader>
            <CardTitle>Liste des Dons</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <p className="text-center py-4">Chargement...</p>
            ) : donations.length === 0 ? (
              <p className="text-center py-4 text-muted-foreground">
                Aucun don enregistré
              </p>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Donateur</TableHead>
                      <TableHead>Contact</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Montant</TableHead>
                      <TableHead>Statut</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Notes</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {donations.map((donation) => (
                      <TableRow key={donation.id}>
                        <TableCell className="font-medium">
                          {donation.donor_name}
                        </TableCell>
                        <TableCell>
                          <div className="text-sm">
                            {donation.donor_email && (
                              <div>{donation.donor_email}</div>
                            )}
                            <div className="text-muted-foreground">
                              {donation.donor_phone}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          {getDonationTypeLabel(donation.donation_type)}
                        </TableCell>
                        <TableCell className="font-semibold">
                          {formatCurrency(
                            Number(donation.amount),
                            donation.currency
                          )}
                        </TableCell>
                        <TableCell>
                          {getStatusBadge(donation.payment_status)}
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {formatDate(donation.created_at)}
                        </TableCell>
                        <TableCell>
                          {donation.notes && (
                            <span className="text-sm text-muted-foreground">
                              {donation.notes}
                            </span>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
