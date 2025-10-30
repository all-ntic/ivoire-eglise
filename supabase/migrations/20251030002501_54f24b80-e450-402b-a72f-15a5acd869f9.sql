-- Créer une fonction sécurisée pour créer une église avec un pasteur admin
CREATE OR REPLACE FUNCTION public.create_church_with_pastor(
  p_church_name TEXT,
  p_church_slug TEXT,
  p_user_id UUID
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_church_id UUID;
BEGIN
  -- Vérifier que l'utilisateur est authentifié et c'est bien lui
  IF auth.uid() != p_user_id THEN
    RAISE EXCEPTION 'Unauthorized';
  END IF;
  
  -- Créer l'église
  INSERT INTO public.eglise_churches (name, slug)
  VALUES (p_church_name, p_church_slug)
  RETURNING id INTO v_church_id;
  
  -- Mettre à jour le profil avec l'ID de l'église
  UPDATE public.eglise_profiles
  SET church_id = v_church_id
  WHERE id = p_user_id;
  
  -- Assigner le rôle admin
  INSERT INTO public.eglise_user_roles (user_id, role)
  VALUES (p_user_id, 'admin');
  
  RETURN v_church_id;
END;
$$;