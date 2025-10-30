import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Church } from "lucide-react";
import { z } from "zod";

export default function Auth() {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [userType, setUserType] = useState<"pastor" | "member">("member");
  const [churchName, setChurchName] = useState("");
  const [selectedChurchId, setSelectedChurchId] = useState("");
  const [churches, setChurches] = useState<Array<{ id: string; name: string; pastor_name: string }>>([]);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  // Validation schemas
  const loginSchema = z.object({
    email: z.string().email("Email invalide").max(255, "Email trop long"),
    password: z.string().min(6, "Le mot de passe doit contenir au moins 6 caractères"),
  });

  const signUpSchema = z.object({
    email: z.string().email("Email invalide").max(255, "Email trop long"),
    password: z.string().min(6, "Le mot de passe doit contenir au moins 6 caractères"),
    fullName: z.string().trim().min(1, "Le nom complet est requis").max(100, "Nom trop long"),
    phone: z.string().regex(/^[\+]?[0-9]{8,15}$/, "Numéro de téléphone invalide (8-15 chiffres)"),
    churchName: z.string().trim().min(1, "Le nom de l'église est requis").max(200, "Nom d'église trop long").optional(),
    selectedChurchId: z.string().uuid("ID d'église invalide").optional(),
  });

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
    if (!isLogin && userType === "member") {
      loadChurches();
    }
  }, [isLogin, userType]);

  const loadChurches = async () => {
    try {
      // First get all churches with their profiles
      const { data: churchesData, error } = await supabase
        .from("eglise_churches")
        .select(`
          id,
          name,
          eglise_profiles(id, full_name)
        `);

      if (error) throw error;

      // Then get admin users
      const { data: adminRoles } = await supabase
        .from("eglise_user_roles")
        .select("user_id")
        .eq("role", "admin");

      const adminUserIds = new Set(adminRoles?.map(r => r.user_id) || []);

      const churchesWithPastors = churchesData?.map((church: any) => {
        const adminProfile = church.eglise_profiles?.find((p: any) => adminUserIds.has(p.id));
        return {
          id: church.id,
          name: church.name,
          pastor_name: adminProfile?.full_name || "Pasteur non défini",
        };
      }) || [];

      setChurches(churchesWithPastors);
    } catch (error) {
      console.error("Error loading churches:", error);
    }
  };

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (isLogin) {
        // Validate login data
        const validated = loginSchema.parse({ email, password });
        
        const { error } = await supabase.auth.signInWithPassword({
          email: validated.email,
          password: validated.password,
        });
        if (error) throw error;
        toast({ title: "Connexion réussie !" });
      } else {
        // Validate signup data
        const validated = signUpSchema.parse({
          email,
          password,
          fullName,
          phone,
          churchName: userType === "pastor" ? churchName : undefined,
          selectedChurchId: userType === "member" ? selectedChurchId : undefined,
        });

        // Additional validation
        if (userType === "pastor" && !validated.churchName) {
          throw new Error("Veuillez entrer le nom de votre église");
        }
        if (userType === "member" && !validated.selectedChurchId) {
          throw new Error("Veuillez sélectionner une église");
        }

        // Sign up user
        const { data: authData, error: authError } = await supabase.auth.signUp({
          email: validated.email,
          password: validated.password,
          options: {
            emailRedirectTo: `${window.location.origin}/dashboard`,
            data: {
              full_name: validated.fullName,
              phone: validated.phone,
              user_type: userType,
              church_name: userType === "pastor" ? validated.churchName : undefined,
              church_id: userType === "member" ? validated.selectedChurchId : undefined,
            },
          },
        });
        
        if (authError) throw authError;

        if (authData.user) {
          // Wait for the trigger to create the profile
          let profileExists = false;
          let attempts = 0;
          while (!profileExists && attempts < 10) {
            const { data: profile } = await supabase
              .from("eglise_profiles")
              .select("id")
              .eq("id", authData.user.id)
              .maybeSingle();
            
            if (profile) {
              profileExists = true;
            } else {
              await new Promise(resolve => setTimeout(resolve, 500));
              attempts++;
            }
          }

          if (!profileExists) {
            throw new Error("Erreur lors de la création du profil. Veuillez réessayer.");
          }

          // If pastor, create church and assign admin role using secure function
          if (userType === "pastor" && validated.churchName) {
            const slug = validated.churchName.toLowerCase().replace(/\s+/g, "-");
            const { data, error: churchError } = await supabase.rpc("create_church_with_pastor", {
              p_church_name: validated.churchName,
              p_church_slug: slug,
              p_user_id: authData.user.id,
            });

            if (churchError) throw churchError;
          } else if (validated.selectedChurchId) {
            // If member, just update profile with selected church
            const { error: profileError } = await supabase
              .from("eglise_profiles")
              .update({ church_id: validated.selectedChurchId })
              .eq("id", authData.user.id);

            if (profileError) throw profileError;

            // Assign user role
            const { error: roleError } = await supabase
              .from("eglise_user_roles")
              .insert({ user_id: authData.user.id, role: "user" });

            if (roleError) throw roleError;
          }
        }

        toast({
          title: "Inscription réussie !",
          description: "Vérifiez votre email pour confirmer votre compte.",
        });
      }
    } catch (error: any) {
      // Handle Zod validation errors
      if (error instanceof z.ZodError) {
        const errorMessage = error.errors.map(e => e.message).join(", ");
        toast({
          title: "Erreur de validation",
          description: errorMessage,
          variant: "destructive",
        });
      } else {
        toast({
          title: "Erreur",
          description: error.message,
          variant: "destructive",
        });
      }
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
                    required={!isLogin}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">Téléphone</Label>
                  <Input
                    id="phone"
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+225 XX XX XX XX XX"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Vous êtes</Label>
                  <div className="flex gap-4">
                    <label className="flex items-center space-x-2 cursor-pointer">
                      <input
                        type="radio"
                        name="userType"
                        value="member"
                        checked={userType === "member"}
                        onChange={(e) => setUserType(e.target.value as "pastor" | "member")}
                        className="w-4 h-4 text-primary"
                      />
                      <span>Fidèle</span>
                    </label>
                    <label className="flex items-center space-x-2 cursor-pointer">
                      <input
                        type="radio"
                        name="userType"
                        value="pastor"
                        checked={userType === "pastor"}
                        onChange={(e) => setUserType(e.target.value as "pastor" | "member")}
                        className="w-4 h-4 text-primary"
                      />
                      <span>Pasteur</span>
                    </label>
                  </div>
                </div>
                {userType === "pastor" ? (
                  <div className="space-y-2">
                    <Label htmlFor="churchName">Nom de votre église</Label>
                    <Input
                      id="churchName"
                      type="text"
                      value={churchName}
                      onChange={(e) => setChurchName(e.target.value)}
                      placeholder="Ex: Église Baptiste de la Grâce"
                      required={!isLogin && userType === "pastor"}
                    />
                  </div>
                ) : (
                  <div className="space-y-2">
                    <Label htmlFor="church">Choisissez votre église</Label>
                    <select
                      id="church"
                      value={selectedChurchId}
                      onChange={(e) => setSelectedChurchId(e.target.value)}
                      required={!isLogin && userType === "member"}
                      className="w-full px-3 py-2 border rounded-md bg-background"
                    >
                      <option value="">Sélectionnez une église</option>
                      {churches.map((church) => (
                        <option key={church.id} value={church.id}>
                          {church.name} - Pasteur {church.pastor_name}
                        </option>
                      ))}
                    </select>
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
