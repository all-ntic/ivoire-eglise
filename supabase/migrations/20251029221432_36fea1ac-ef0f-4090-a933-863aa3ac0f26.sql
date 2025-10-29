-- Fix get_user_church function to use correct table (using CREATE OR REPLACE)
CREATE OR REPLACE FUNCTION public.get_user_church(_user_id uuid)
RETURNS uuid
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT church_id FROM public.eglise_profiles WHERE id = _user_id
$$;

-- Delete the test user and all related data
DELETE FROM public.eglise_user_roles WHERE user_id = '743585a5-8b56-4386-bfd0-8aab4b608ecd';
DELETE FROM public.eglise_profiles WHERE id = '743585a5-8b56-4386-bfd0-8aab4b608ecd';
DELETE FROM auth.users WHERE id = '743585a5-8b56-4386-bfd0-8aab4b608ecd';