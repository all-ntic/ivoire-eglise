import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ArrowLeft, Plus, Bell, Book, Info, Calendar as CalendarIcon } from "lucide-react";
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
import { format } from "date-fns";
import { fr } from "date-fns/locale";

export default function Announcements() {
  const [announcements, setAnnouncements] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [newAnnouncement, setNewAnnouncement] = useState({
    title: "",
    content: "",
    announcement_type: "information",
  });
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    loadAnnouncements();
  }, []);

  const loadAnnouncements = async () => {
    try {
      const { data, error } = await supabase
        .from("announcements")
        .select("*, profiles(full_name)")
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
      const { data: profile } = await supabase
        .from("profiles")
        .select("church_id, id")
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
        author_id: profile.id,
      });

      if (error) throw error;

      toast({ title: "Annonce publiée avec succès !" });
      setNewAnnouncement({ title: "", content: "", announcement_type: "information" });
      setOpen(false);
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
      case "prière":
        return <Bell className="h-5 w-5 text-primary" />;
      case "prédication":
        return <Book className="h-5 w-5 text-primary" />;
      case "programme":
        return <CalendarIcon className="h-5 w-5 text-primary" />;
      default:
        return <Info className="h-5 w-5 text-primary" />;
    }
  };

  const getAnnouncementBadgeColor = (type: string) => {
    switch (type) {
      case "prière":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200";
      case "prédication":
        return "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200";
      case "programme":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200";
    }
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
            <h1 className="text-2xl font-bold">Annonces de l'Église</h1>
          </div>
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Nouvelle annonce
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Publier une nouvelle annonce</DialogTitle>
                <DialogDescription>
                  Partagez des prières, informations, prédications ou programmes avec vos fidèles
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
                      <SelectItem value="prière">Prière</SelectItem>
                      <SelectItem value="prédication">Prédication</SelectItem>
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
                    placeholder="Ex: Messe dominicale, Chaîne de prière..."
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
                    placeholder="Décrivez votre annonce en détail..."
                    className="min-h-[150px]"
                    required
                  />
                </div>
                <Button type="submit" className="w-full">
                  Publier l'annonce
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {loading ? (
          <div className="text-center py-8">Chargement...</div>
        ) : announcements.length === 0 ? (
          <Card>
            <CardContent className="text-center py-12">
              <Bell className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <p className="text-muted-foreground mb-4">Aucune annonce publiée</p>
              <p className="text-sm text-muted-foreground">
                Commencez à partager des prières, informations et programmes avec vos fidèles
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-6">
            {announcements.map((announcement) => (
              <Card key={announcement.id} className="overflow-hidden">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      {getAnnouncementIcon(announcement.announcement_type)}
                      <div>
                        <CardTitle className="text-xl">{announcement.title}</CardTitle>
                        <CardDescription className="mt-1">
                          Par {announcement.profiles?.full_name || "Pasteur"} •{" "}
                          {format(new Date(announcement.created_at), "d MMMM yyyy 'à' HH:mm", {
                            locale: fr,
                          })}
                        </CardDescription>
                      </div>
                    </div>
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-medium ${getAnnouncementBadgeColor(
                        announcement.announcement_type
                      )}`}
                    >
                      {announcement.announcement_type}
                    </span>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-foreground whitespace-pre-wrap leading-relaxed">
                    {announcement.content}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
