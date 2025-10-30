-- Créer la table des églises
CREATE TABLE public.eglise_churches (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  address TEXT,
  city TEXT,
  country TEXT DEFAULT 'Côte d''Ivoire',
  phone TEXT,
  email TEXT,
  website TEXT,
  pastor_name TEXT,
  description TEXT,
  logo_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Activer RLS
ALTER TABLE public.eglise_churches ENABLE ROW LEVEL SECURITY;

-- Politiques RLS
CREATE POLICY "Tout le monde peut voir les églises"
ON public.eglise_churches FOR SELECT
USING (true);

CREATE POLICY "Admins peuvent créer des églises"
ON public.eglise_churches FOR INSERT
WITH CHECK (has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins peuvent modifier des églises"
ON public.eglise_churches FOR UPDATE
USING (has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins peuvent supprimer des églises"
ON public.eglise_churches FOR DELETE
USING (has_role(auth.uid(), 'admin'));

-- Trigger pour updated_at
CREATE TRIGGER update_eglise_churches_updated_at
BEFORE UPDATE ON public.eglise_churches
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Ajouter la foreign key sur eglise_profiles maintenant que la table existe
ALTER TABLE public.eglise_profiles
ADD CONSTRAINT eglise_profiles_church_id_fkey
FOREIGN KEY (church_id) REFERENCES public.eglise_churches(id) ON DELETE SET NULL;