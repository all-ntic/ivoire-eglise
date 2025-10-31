
-- Drop the existing restrictive policy
DROP POLICY IF EXISTS "Allow public select" ON public.churches;

-- Create a new PERMISSIVE policy to allow everyone to read churches
CREATE POLICY "Allow public select" 
ON public.churches 
FOR SELECT 
USING (true);
