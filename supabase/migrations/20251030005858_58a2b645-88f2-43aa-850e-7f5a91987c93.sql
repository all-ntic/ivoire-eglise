-- Drop the existing restrictive policy
drop policy if exists "Pastors can insert churches" on public.churches;

-- Create a more permissive policy for church creation
-- Users can create churches during signup (they can only create one anyway)
create policy "Authenticated users can insert churches"
  on public.churches for insert
  to authenticated
  with check (true);

-- Add a policy to prevent users from creating multiple churches
-- (optional - depends on your business logic)
create policy "Users can update churches they belong to"
  on public.churches for update
  to authenticated
  using (
    id = public.get_user_church_id(auth.uid()) 
    and (
      public.has_role(auth.uid(), 'pastor') 
      or public.has_role(auth.uid(), 'admin')
    )
  );

create policy "Pastors and admins can delete their church"
  on public.churches for delete
  to authenticated
  using (
    id = public.get_user_church_id(auth.uid()) 
    and (
      public.has_role(auth.uid(), 'pastor') 
      or public.has_role(auth.uid(), 'admin')
    )
  );