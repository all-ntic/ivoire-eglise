-- Supprimer les politiques existantes pour les recréer correctement
DROP POLICY IF EXISTS "Seuls les admins peuvent créer des rôles" ON public.eglise_user_roles;

-- Permettre aux utilisateurs de créer leur propre rôle "user" lors de l'inscription
CREATE POLICY "Les utilisateurs peuvent créer leur propre rôle user"
ON public.eglise_user_roles FOR INSERT
WITH CHECK (auth.uid() = user_id AND role = 'user');

-- Permettre aux admins de créer n'importe quel rôle
CREATE POLICY "Les admins peuvent créer tous les rôles"
ON public.eglise_user_roles FOR INSERT
WITH CHECK (has_role(auth.uid(), 'admin'));