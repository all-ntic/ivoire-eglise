import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Church } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

type UserType = "member" | "pastor";

interface Church {
  id: string;
  name: string;
}

export default function Auth() {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [userType, setUserType] = useState<UserType>("member");
  const [churchName, setChurchName] = useState("");
  const [selectedChurch, setSelectedChurch] = useState("");
  const [churches, setChurches] = useState<Church[]>([]);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();


  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        navigate("/dashboard");
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (session) {
        navigate("/dashboard");
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  useEffect(() => {
    const loadChurches = async () => {
      const { data } = await supabase
        .from("churches")
        .select("id, name")
        .order("name");
      
      if (data) {
        setChurches(data);
      }
    };

    if (!isLogin && userType === "member") {
      loadChurches();
    }
  }, [isLogin, userType]);


  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (isLogin) {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (error) throw error;
        toast({ title: "Connexion réussie !" });
      } else {
        // Validation pour inscription
        if (userType === "pastor" && !churchName.trim()) {
          toast({
            title: "Erreur",
            description: "Le nom de l'église est obligatoire pour les pasteurs.",
            variant: "destructive",
          });
          setLoading(false);
          return;
        }

        if (userType === "member" && !selectedChurch) {
          toast({
            title: "Erreur",
            description: "Veuillez sélectionner une église.",
            variant: "destructive",
          });
          setLoading(false);
          return;
        }

        // Inscription de l'utilisateur
        const { data: authData, error: authError } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: `${window.location.origin}/dashboard`,
          },
        });
        
        if (authError) throw authError;
        if (!authData.user) throw new Error("Erreur lors de la création du compte");

        let churchId = selectedChurch;

        // Si c'est un pasteur, créer l'église
        if (userType === "pastor") {
          const { data: churchData, error: churchError } = await supabase
            .from("churches")
            .insert({ name: churchName.trim() })
            .select()
            .single();

          if (churchError) throw churchError;
          churchId = churchData.id;
        }

        // Créer le profil
        const { error: profileError } = await supabase
          .from("profiles")
          .insert({
            user_id: authData.user.id,
            full_name: fullName.trim(),
            church_id: churchId,
          });

        if (profileError) throw profileError;

        // Assigner le rôle
        const { error: roleError } = await supabase
          .from("user_roles")
          .insert({
            user_id: authData.user.id,
            role: userType,
          });

        if (roleError) throw roleError;

        toast({
          title: "Inscription réussie !",
          description: "Vérifiez votre email pour confirmer votre compte.",
        });
      }
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
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/10 via-background to-primary/5">
      <Card className="w-full max-w-md mx-4">
        <CardHeader className="space-y-1 flex flex-col items-center">
          <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center mb-4">
            <Church className="w-10 h-10 text-primary-foreground" />
          </div>
          <CardTitle className="text-2xl font-bold text-center">IVOIRE ÉGLISE+</CardTitle>
          <CardDescription className="text-center">
            {isLogin ? "Connectez-vous à votre compte" : "Créez votre compte"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleAuth} className="space-y-4">
            {!isLogin && (
              <>
                <div className="space-y-2">
                  <Label htmlFor="fullName">Nom complet</Label>
                  <Input
                    id="fullName"
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="userType">Je suis</Label>
                  <Select value={userType} onValueChange={(value: UserType) => setUserType(value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="member">Fidèle</SelectItem>
                      <SelectItem value="pastor">Pasteur</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {userType === "pastor" ? (
                  <div className="space-y-2">
                    <Label htmlFor="churchName">Nom de l'église *</Label>
                    <Input
                      id="churchName"
                      type="text"
                      value={churchName}
                      onChange={(e) => setChurchName(e.target.value)}
                      placeholder="Entrez le nom de votre église"
                      required
                    />
                  </div>
                ) : (
                  <div className="space-y-2">
                    <Label htmlFor="church">Église *</Label>
                    <Select value={selectedChurch} onValueChange={setSelectedChurch} required>
                      <SelectTrigger>
                        <SelectValue placeholder="Sélectionnez une église" />
                      </SelectTrigger>
                      <SelectContent>
                        {churches.map((church) => (
                          <SelectItem key={church.id} value={church.id}>
                            {church.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}
              </>
            )}

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Mot de passe</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
              />
            </div>
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Chargement..." : isLogin ? "Se connecter" : "S'inscrire"}
            </Button>
          </form>
          <div className="mt-4 text-center text-sm">
            <button
              type="button"
              onClick={() => setIsLogin(!isLogin)}
              className="text-primary hover:underline"
            >
              {isLogin ? "Créer un compte" : "Déjà un compte ? Se connecter"}
            </button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
