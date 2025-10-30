-- Drop ALL existing policies on churches table
DROP POLICY IF EXISTS "Authenticated users can insert churches" ON public.churches;
DROP POLICY IF EXISTS "Users can update churches they belong to" ON public.churches;
DROP POLICY IF EXISTS "Pastors and admins can delete their church" ON public.churches;
DROP POLICY IF EXISTS "Churches are viewable by everyone" ON public.churches;
DROP POLICY IF EXISTS "Pastors can insert churches" ON public.churches;

-- Create new policies
-- Allow authenticated users to insert churches (needed during signup)
CREATE POLICY "Allow authenticated insert"
  ON public.churches FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Everyone can view churches
CREATE POLICY "Allow public select"
  ON public.churches FOR SELECT
  TO authenticated
  USING (true);

-- Only pastors/admins of a church can update it
CREATE POLICY "Allow church leaders to update"
  ON public.churches FOR UPDATE
  TO authenticated
  USING (
    id = public.get_user_church_id(auth.uid()) 
    AND (
      public.has_role(auth.uid(), 'pastor') 
      OR public.has_role(auth.uid(), 'admin')
    )
  );

-- Only pastors/admins of a church can delete it
CREATE POLICY "Allow church leaders to delete"
  ON public.churches FOR DELETE
  TO authenticated
  USING (
    id = public.get_user_church_id(auth.uid()) 
    AND (
      public.has_role(auth.uid(), 'pastor') 
      OR public.has_role(auth.uid(), 'admin')
    )
  );