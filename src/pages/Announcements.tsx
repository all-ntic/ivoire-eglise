import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ArrowLeft, Plus, Send } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { format } from "date-fns";
import { fr } from "date-fns/locale";

export default function Announcements() {
  const [announcements, setAnnouncements] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [newAnnouncement, setNewAnnouncement] = useState({
    title: "",
    content: "",
    announcement_type: "information",
  });
  const [dialogOpen, setDialogOpen] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    checkAdminStatus();
    loadAnnouncements();
  }, []);

  const checkAdminStatus = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data } = await supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", user.id)
      .eq("role", "admin")
      .single();

    setIsAdmin(!!data);
  };

  const loadAnnouncements = async () => {
    try {
      const { data, error } = await supabase
        .from("announcements")
        .select(`
          *,
          profiles:author_id (
            full_name
          )
        `)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setAnnouncements(data || []);
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

  const handleAddAnnouncement = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Non authentifié");

      const { data: profile } = await supabase
        .from("profiles")
        .select("church_id")
        .eq("id", user.id)
        .single();

      if (!profile?.church_id) {
        toast({
          title: "Erreur",
          description: "Vous devez être associé à une église",
          variant: "destructive",
        });
        return;
      }

      const { error } = await supabase.from("announcements").insert({
        ...newAnnouncement,
        church_id: profile.church_id,
        author_id: user.id,
      });

      if (error) throw error;

      toast({ title: "Annonce publiée avec succès !" });
      setNewAnnouncement({ title: "", content: "", announcement_type: "information" });
      setDialogOpen(false);
      loadAnnouncements();
    } catch (error: any) {
      toast({
        title: "Erreur",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const getAnnouncementIcon = (type: string) => {
    switch (type) {
      case "priere": return "🙏";
      case "predication": return "📖";
      case "programme": return "📅";
      default: return "ℹ️";
    }
  };

  const getAnnouncementColor = (type: string) => {
    switch (type) {
      case "priere": return "border-l-4 border-l-blue-500";
      case "predication": return "border-l-4 border-l-purple-500";
      case "programme": return "border-l-4 border-l-green-500";
      default: return "border-l-4 border-l-gray-500";
    }
  };

  const filterByType = (type: string) => {
    if (type === "all") return announcements;
    return announcements.filter(a => a.announcement_type === type);
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-card">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" onClick={() => navigate("/dashboard")}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Retour
            </Button>
            <h1 className="text-2xl font-bold">Communications de l'Église</h1>
          </div>
          {isAdmin && (
            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Nouvelle annonce
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Publier une annonce</DialogTitle>
                  <DialogDescription>
                    Partagez des prières, informations, prédications ou programmes
                  </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleAddAnnouncement} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="type">Type d'annonce *</Label>
                    <Select
                      value={newAnnouncement.announcement_type}
                      onValueChange={(value) =>
                        setNewAnnouncement({ ...newAnnouncement, announcement_type: value })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="information">Information</SelectItem>
                        <SelectItem value="priere">Prière</SelectItem>
                        <SelectItem value="predication">Prédication</SelectItem>
                        <SelectItem value="programme">Programme de messe</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="title">Titre *</Label>
                    <Input
                      id="title"
                      value={newAnnouncement.title}
                      onChange={(e) =>
                        setNewAnnouncement({ ...newAnnouncement, title: e.target.value })
                      }
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="content">Contenu *</Label>
                    <Textarea
                      id="content"
                      value={newAnnouncement.content}
                      onChange={(e) =>
                        setNewAnnouncement({ ...newAnnouncement, content: e.target.value })
                      }
                      rows={6}
                      required
                    />
                  </div>
                  <Button type="submit" className="w-full">
                    <Send className="h-4 w-4 mr-2" />
                    Publier
                  </Button>
                </form>
              </DialogContent>
            </Dialog>
          )}
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <Tabs defaultValue="all" className="w-full">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="all">Tout</TabsTrigger>
            <TabsTrigger value="information">Infos</TabsTrigger>
            <TabsTrigger value="priere">Prières</TabsTrigger>
            <TabsTrigger value="predication">Prédications</TabsTrigger>
            <TabsTrigger value="programme">Programmes</TabsTrigger>
          </TabsList>

          {["all", "information", "priere", "predication", "programme"].map((type) => (
            <TabsContent key={type} value={type} className="space-y-4 mt-6">
              {loading ? (
                <div className="text-center py-8">Chargement...</div>
              ) : filterByType(type).length === 0 ? (
                <Card>
                  <CardContent className="text-center py-8">
                    <p className="text-muted-foreground">Aucune annonce pour le moment</p>
                  </CardContent>
                </Card>
              ) : (
                filterByType(type).map((announcement) => (
                  <Card key={announcement.id} className={getAnnouncementColor(announcement.announcement_type)}>
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-2">
                          <span className="text-2xl">{getAnnouncementIcon(announcement.announcement_type)}</span>
                          <div>
                            <CardTitle className="text-lg">{announcement.title}</CardTitle>
                            <CardDescription className="text-xs mt-1">
                              Par {announcement.profiles?.full_name || "Pasteur"} •{" "}
                              {format(new Date(announcement.created_at), "d MMMM yyyy 'à' HH:mm", {
                                locale: fr,
                              })}
                            </CardDescription>
                          </div>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm whitespace-pre-wrap">{announcement.content}</p>
                    </CardContent>
                  </Card>
                ))
              )}
            </TabsContent>
          ))}
        </Tabs>
      </main>
    </div>
  );
}
