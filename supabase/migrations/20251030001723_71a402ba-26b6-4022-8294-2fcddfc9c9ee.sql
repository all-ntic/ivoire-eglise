-- Créer la table des profils utilisateurs
CREATE TABLE public.eglise_profiles (
  id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  full_name TEXT NOT NULL DEFAULT 'Utilisateur',
  phone TEXT,
  avatar_url TEXT,
  bio TEXT,
  church_id UUID,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Activer RLS
ALTER TABLE public.eglise_profiles ENABLE ROW LEVEL SECURITY;

-- Politiques RLS
CREATE POLICY "Les profils sont visibles par tout le monde"
ON public.eglise_profiles FOR SELECT
USING (true);

CREATE POLICY "Les utilisateurs peuvent mettre à jour leur propre profil"
ON public.eglise_profiles FOR UPDATE
USING (auth.uid() = id);

CREATE POLICY "Les utilisateurs peuvent insérer leur propre profil"
ON public.eglise_profiles FOR INSERT
WITH CHECK (auth.uid() = id);

CREATE POLICY "Les admins peuvent tout gérer"
ON public.eglise_profiles FOR ALL
USING (has_role(auth.uid(), 'admin'));

-- Trigger pour updated_at
CREATE TRIGGER update_eglise_profiles_updated_at
BEFORE UPDATE ON public.eglise_profiles
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();