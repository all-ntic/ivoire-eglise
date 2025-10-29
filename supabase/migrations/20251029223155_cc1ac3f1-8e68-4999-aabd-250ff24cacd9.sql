-- Drop the existing policy
DROP POLICY IF EXISTS "Users can create their first church" ON public.eglise_churches;

-- Create a better policy that handles the case where profile doesn't exist yet
CREATE POLICY "Users can create their first church" 
ON public.eglise_churches 
FOR INSERT 
TO authenticated
WITH CHECK (
  -- Allow if user has no profile yet OR profile has no church_id
  NOT EXISTS (
    SELECT 1 FROM public.eglise_profiles 
    WHERE id = auth.uid() AND church_id IS NOT NULL
  )
);