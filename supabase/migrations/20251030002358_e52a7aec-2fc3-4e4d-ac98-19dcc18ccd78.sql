-- Créer la table des rôles utilisateurs si elle n'existe pas déjà
CREATE TABLE IF NOT EXISTS public.eglise_user_roles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role public.app_role NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, role)
);

-- Activer RLS
ALTER TABLE public.eglise_user_roles ENABLE ROW LEVEL SECURITY;

-- Politiques RLS
CREATE POLICY "Les utilisateurs peuvent voir leurs propres rôles"
ON public.eglise_user_roles FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Les admins peuvent voir tous les rôles"
ON public.eglise_user_roles FOR SELECT
USING (has_role(auth.uid(), 'admin'));

CREATE POLICY "Seuls les admins peuvent créer des rôles"
ON public.eglise_user_roles FOR INSERT
WITH CHECK (has_role(auth.uid(), 'admin'));

CREATE POLICY "Seuls les admins peuvent modifier des rôles"
ON public.eglise_user_roles FOR UPDATE
USING (has_role(auth.uid(), 'admin'));

CREATE POLICY "Seuls les admins peuvent supprimer des rôles"
ON public.eglise_user_roles FOR DELETE
USING (has_role(auth.uid(), 'admin'));