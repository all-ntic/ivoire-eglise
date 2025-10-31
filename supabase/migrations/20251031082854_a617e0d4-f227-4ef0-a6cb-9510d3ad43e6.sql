
-- Supprimer l'ancienne contrainte
ALTER TABLE public.donations DROP CONSTRAINT IF EXISTS donations_donation_type_check;

-- Ajouter la nouvelle contrainte avec les valeurs en français
ALTER TABLE public.donations 
ADD CONSTRAINT donations_donation_type_check 
CHECK (donation_type IN ('dime', 'offrande', 'soutien', 'projet', 'autre'));
