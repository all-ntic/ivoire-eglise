-- Ajouter la colonne slug à la table eglise_churches
ALTER TABLE public.eglise_churches
ADD COLUMN slug TEXT UNIQUE;

-- Créer un index sur le slug pour améliorer les performances
CREATE INDEX idx_eglise_churches_slug ON public.eglise_churches(slug);