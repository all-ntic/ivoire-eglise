-- Create announcements table
create table public.announcements (
  id uuid primary key default gen_random_uuid(),
  church_id uuid references public.churches(id) on delete cascade not null,
  author_id uuid references auth.users(id) on delete cascade not null,
  title text not null,
  content text not null,
  announcement_type text not null check (announcement_type in ('information', 'priere', 'predication', 'programme')),
  created_at timestamp with time zone default now() not null,
  updated_at timestamp with time zone default now() not null
);

-- Create members table
create table public.members (
  id uuid primary key default gen_random_uuid(),
  church_id uuid references public.churches(id) on delete cascade not null,
  full_name text not null,
  email text,
  phone text not null,
  address text,
  membership_status text default 'active' check (membership_status in ('active', 'inactive')),
  created_at timestamp with time zone default now() not null,
  updated_at timestamp with time zone default now() not null
);

-- Create group_messages table
create table public.group_messages (
  id uuid primary key default gen_random_uuid(),
  church_id uuid references public.churches(id) on delete cascade not null,
  sender_id uuid references auth.users(id) on delete cascade not null,
  message text not null,
  created_at timestamp with time zone default now() not null
);

-- Create messages table (private messages)
create table public.messages (
  id uuid primary key default gen_random_uuid(),
  sender_id uuid references auth.users(id) on delete cascade not null,
  receiver_id uuid references auth.users(id) on delete cascade not null,
  message text not null,
  is_read boolean default false,
  created_at timestamp with time zone default now() not null
);

-- Create donations table
create table public.donations (
  id uuid primary key default gen_random_uuid(),
  church_id uuid references public.churches(id) on delete cascade not null,
  donor_name text not null,
  donor_email text,
  donor_phone text not null,
  amount decimal(10,2) not null check (amount > 0),
  currency text default 'XOF' not null,
  donation_type text not null check (donation_type in ('tithe', 'offering', 'project', 'missionary', 'other')),
  payment_status text default 'pending' check (payment_status in ('pending', 'completed', 'failed')),
  notes text,
  created_at timestamp with time zone default now() not null,
  updated_at timestamp with time zone default now() not null
);

-- Create events table
create table public.events (
  id uuid primary key default gen_random_uuid(),
  church_id uuid references public.churches(id) on delete cascade not null,
  title text not null,
  description text,
  event_type text not null check (event_type in ('service', 'conference', 'formation', 'celebration', 'other')),
  start_date timestamp with time zone not null,
  end_date timestamp with time zone,
  location text,
  created_at timestamp with time zone default now() not null,
  updated_at timestamp with time zone default now() not null
);

-- Enable RLS on all tables
alter table public.announcements enable row level security;
alter table public.members enable row level security;
alter table public.group_messages enable row level security;
alter table public.messages enable row level security;
alter table public.donations enable row level security;
alter table public.events enable row level security;

-- Create function to get user's church_id
create or replace function public.get_user_church_id(_user_id uuid)
returns uuid
language sql
stable
security definer
set search_path = public
as $$
  select church_id from public.profiles where user_id = _user_id limit 1
$$;

-- RLS Policies for announcements
create policy "Users can view announcements from their church"
  on public.announcements for select
  to authenticated
  using (church_id = public.get_user_church_id(auth.uid()));

create policy "Pastors and admins can create announcements"
  on public.announcements for insert
  to authenticated
  with check (
    church_id = public.get_user_church_id(auth.uid()) 
    and (
      public.has_role(auth.uid(), 'pastor') 
      or public.has_role(auth.uid(), 'admin')
    )
  );

create policy "Authors can update their announcements"
  on public.announcements for update
  to authenticated
  using (author_id = auth.uid());

create policy "Pastors and admins can delete announcements"
  on public.announcements for delete
  to authenticated
  using (
    church_id = public.get_user_church_id(auth.uid()) 
    and (
      public.has_role(auth.uid(), 'pastor') 
      or public.has_role(auth.uid(), 'admin')
    )
  );

-- RLS Policies for members
create policy "Users can view members from their church"
  on public.members for select
  to authenticated
  using (church_id = public.get_user_church_id(auth.uid()));

create policy "Pastors and admins can insert members"
  on public.members for insert
  to authenticated
  with check (
    church_id = public.get_user_church_id(auth.uid()) 
    and (
      public.has_role(auth.uid(), 'pastor') 
      or public.has_role(auth.uid(), 'admin')
    )
  );

create policy "Pastors and admins can update members"
  on public.members for update
  to authenticated
  using (
    church_id = public.get_user_church_id(auth.uid()) 
    and (
      public.has_role(auth.uid(), 'pastor') 
      or public.has_role(auth.uid(), 'admin')
    )
  );

create policy "Pastors and admins can delete members"
  on public.members for delete
  to authenticated
  using (
    church_id = public.get_user_church_id(auth.uid()) 
    and (
      public.has_role(auth.uid(), 'pastor') 
      or public.has_role(auth.uid(), 'admin')
    )
  );

-- RLS Policies for group_messages
create policy "Users can view group messages from their church"
  on public.group_messages for select
  to authenticated
  using (church_id = public.get_user_church_id(auth.uid()));

create policy "Users can send group messages to their church"
  on public.group_messages for insert
  to authenticated
  with check (church_id = public.get_user_church_id(auth.uid()));

-- RLS Policies for messages
create policy "Users can view their own messages"
  on public.messages for select
  to authenticated
  using (sender_id = auth.uid() or receiver_id = auth.uid());

create policy "Users can send messages"
  on public.messages for insert
  to authenticated
  with check (sender_id = auth.uid());

create policy "Users can update their received messages"
  on public.messages for update
  to authenticated
  using (receiver_id = auth.uid());

-- RLS Policies for donations
create policy "Users can view donations from their church"
  on public.donations for select
  to authenticated
  using (church_id = public.get_user_church_id(auth.uid()));

create policy "Users can create donations for their church"
  on public.donations for insert
  to authenticated
  with check (church_id = public.get_user_church_id(auth.uid()));

create policy "Pastors and admins can update donations"
  on public.donations for update
  to authenticated
  using (
    church_id = public.get_user_church_id(auth.uid()) 
    and (
      public.has_role(auth.uid(), 'pastor') 
      or public.has_role(auth.uid(), 'admin')
    )
  );

-- RLS Policies for events
create policy "Users can view events from their church"
  on public.events for select
  to authenticated
  using (church_id = public.get_user_church_id(auth.uid()));

create policy "Pastors and admins can create events"
  on public.events for insert
  to authenticated
  with check (
    church_id = public.get_user_church_id(auth.uid()) 
    and (
      public.has_role(auth.uid(), 'pastor') 
      or public.has_role(auth.uid(), 'admin')
    )
  );

create policy "Pastors and admins can update events"
  on public.events for update
  to authenticated
  using (
    church_id = public.get_user_church_id(auth.uid()) 
    and (
      public.has_role(auth.uid(), 'pastor') 
      or public.has_role(auth.uid(), 'admin')
    )
  );

create policy "Pastors and admins can delete events"
  on public.events for delete
  to authenticated
  using (
    church_id = public.get_user_church_id(auth.uid()) 
    and (
      public.has_role(auth.uid(), 'pastor') 
      or public.has_role(auth.uid(), 'admin')
    )
  );

-- Add triggers for updated_at
create trigger set_updated_at_announcements
  before update on public.announcements
  for each row
  execute function public.handle_updated_at();

create trigger set_updated_at_members
  before update on public.members
  for each row
  execute function public.handle_updated_at();

create trigger set_updated_at_donations
  before update on public.donations
  for each row
  execute function public.handle_updated_at();

create trigger set_updated_at_events
  before update on public.events
  for each row
  execute function public.handle_updated_at();