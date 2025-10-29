-- Fix has_role function to use correct table
CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role app_role)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.eglise_user_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$$;