-- Add policy to allow authenticated users to create a church if they don't have one yet
CREATE POLICY "Users can create their first church" 
ON public.eglise_churches 
FOR INSERT 
TO authenticated
WITH CHECK (
  NOT EXISTS (
    SELECT 1 FROM public.eglise_profiles 
    WHERE id = auth.uid() AND church_id IS NOT NULL
  )
);