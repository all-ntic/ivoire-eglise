-- Create app_role enum if it doesn't exist
DO $$ BEGIN
  CREATE TYPE public.app_role AS ENUM ('admin', 'moderator', 'user');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- Create churches table (multi-tenant organizations)
CREATE TABLE IF NOT EXISTS public.churches (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  address TEXT,
  phone TEXT,
  email TEXT,
  logo_url TEXT,
  description TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create profiles table
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  church_id UUID REFERENCES public.churches(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL,
  phone TEXT,
  avatar_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create members table
CREATE TABLE IF NOT EXISTS public.members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  church_id UUID REFERENCES public.churches(id) ON DELETE CASCADE NOT NULL,
  full_name TEXT NOT NULL,
  email TEXT,
  phone TEXT NOT NULL,
  address TEXT,
  birth_date DATE,
  baptism_date DATE,
  membership_status TEXT DEFAULT 'active' CHECK (membership_status IN ('active', 'inactive', 'visitor')),
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create church_donations table
CREATE TABLE IF NOT EXISTS public.church_donations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  church_id UUID REFERENCES public.churches(id) ON DELETE CASCADE NOT NULL,
  donor_name TEXT NOT NULL,
  donor_email TEXT,
  donor_phone TEXT,
  amount NUMERIC NOT NULL CHECK (amount > 0),
  currency TEXT DEFAULT 'XOF',
  donation_type TEXT DEFAULT 'tithe' CHECK (donation_type IN ('tithe', 'offering', 'special', 'project')),
  payment_method TEXT,
  payment_reference TEXT,
  payment_status TEXT DEFAULT 'pending' CHECK (payment_status IN ('pending', 'completed', 'failed')),
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create events table
CREATE TABLE IF NOT EXISTS public.events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  church_id UUID REFERENCES public.churches(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  event_type TEXT DEFAULT 'service' CHECK (event_type IN ('service', 'meeting', 'conference', 'training', 'social')),
  start_date TIMESTAMPTZ NOT NULL,
  end_date TIMESTAMPTZ,
  location TEXT,
  max_participants INTEGER,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create event_participants table
CREATE TABLE IF NOT EXISTS public.event_participants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID REFERENCES public.events(id) ON DELETE CASCADE NOT NULL,
  participant_name TEXT NOT NULL,
  participant_email TEXT,
  participant_phone TEXT NOT NULL,
  registration_date TIMESTAMPTZ NOT NULL DEFAULT now(),
  attendance_status TEXT DEFAULT 'registered' CHECK (attendance_status IN ('registered', 'attended', 'absent')),
  UNIQUE(event_id, participant_phone)
);

-- Create chat_conversations table
CREATE TABLE IF NOT EXISTS public.chat_conversations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  session_id TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create chat_messages table
CREATE TABLE IF NOT EXISTS public.chat_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id UUID REFERENCES public.chat_conversations(id) ON DELETE CASCADE NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('user', 'assistant', 'system')),
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create knowledge_base table for RAG (150 biblical entries)
CREATE TABLE IF NOT EXISTS public.knowledge_base (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  entry_type TEXT NOT NULL CHECK (entry_type IN ('question', 'verse', 'prayer')),
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  tags TEXT[] DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE public.churches ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.church_donations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.event_participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chat_conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chat_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.knowledge_base ENABLE ROW LEVEL SECURITY;

-- Create function to get user's church
CREATE OR REPLACE FUNCTION public.get_user_church(_user_id UUID)
RETURNS UUID
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT church_id FROM public.profiles WHERE id = _user_id
$$;

-- RLS Policies for churches
DROP POLICY IF EXISTS "Users can view their own church" ON public.churches;
CREATE POLICY "Users can view their own church"
  ON public.churches FOR SELECT
  USING (id = public.get_user_church(auth.uid()));

DROP POLICY IF EXISTS "Admins can manage all churches" ON public.churches;
CREATE POLICY "Admins can manage all churches"
  ON public.churches FOR ALL
  USING (public.has_role(auth.uid(), 'admin'));

-- RLS Policies for profiles
DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;
CREATE POLICY "Users can view their own profile"
  ON public.profiles FOR SELECT
  USING (id = auth.uid());

DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
CREATE POLICY "Users can update their own profile"
  ON public.profiles FOR UPDATE
  USING (id = auth.uid());

DROP POLICY IF EXISTS "Admins can view all profiles" ON public.profiles;
CREATE POLICY "Admins can view all profiles"
  ON public.profiles FOR SELECT
  USING (public.has_role(auth.uid(), 'admin'));

-- RLS Policies for members
DROP POLICY IF EXISTS "Users can view members of their church" ON public.members;
CREATE POLICY "Users can view members of their church"
  ON public.members FOR SELECT
  USING (church_id = public.get_user_church(auth.uid()));

DROP POLICY IF EXISTS "Admins and moderators can manage members of their church" ON public.members;
CREATE POLICY "Admins and moderators can manage members of their church"
  ON public.members FOR ALL
  USING (
    church_id = public.get_user_church(auth.uid()) AND
    (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'moderator'))
  );

-- RLS Policies for church_donations
DROP POLICY IF EXISTS "Users can view donations of their church" ON public.church_donations;
CREATE POLICY "Users can view donations of their church"
  ON public.church_donations FOR SELECT
  USING (church_id = public.get_user_church(auth.uid()));

DROP POLICY IF EXISTS "Admins can manage donations of their church" ON public.church_donations;
CREATE POLICY "Admins can manage donations of their church"
  ON public.church_donations FOR ALL
  USING (
    church_id = public.get_user_church(auth.uid()) AND
    public.has_role(auth.uid(), 'admin')
  );

DROP POLICY IF EXISTS "Anyone can create donations" ON public.church_donations;
CREATE POLICY "Anyone can create donations"
  ON public.church_donations FOR INSERT
  WITH CHECK (true);

-- RLS Policies for events
DROP POLICY IF EXISTS "Users can view events of their church" ON public.events;
CREATE POLICY "Users can view events of their church"
  ON public.events FOR SELECT
  USING (church_id = public.get_user_church(auth.uid()));

DROP POLICY IF EXISTS "Admins and moderators can manage events" ON public.events;
CREATE POLICY "Admins and moderators can manage events"
  ON public.events FOR ALL
  USING (
    church_id = public.get_user_church(auth.uid()) AND
    (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'moderator'))
  );

-- RLS Policies for event_participants
DROP POLICY IF EXISTS "Users can view participants of their church events" ON public.event_participants;
CREATE POLICY "Users can view participants of their church events"
  ON public.event_participants FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.events
      WHERE events.id = event_participants.event_id
      AND events.church_id = public.get_user_church(auth.uid())
    )
  );

DROP POLICY IF EXISTS "Anyone can register for events" ON public.event_participants;
CREATE POLICY "Anyone can register for events"
  ON public.event_participants FOR INSERT
  WITH CHECK (true);

-- RLS Policies for chat_conversations
DROP POLICY IF EXISTS "Users can view their own conversations" ON public.chat_conversations;
CREATE POLICY "Users can view their own conversations"
  ON public.chat_conversations FOR SELECT
  USING (user_id = auth.uid() OR user_id IS NULL);

DROP POLICY IF EXISTS "Anyone can create conversations" ON public.chat_conversations;
CREATE POLICY "Anyone can create conversations"
  ON public.chat_conversations FOR INSERT
  WITH CHECK (true);

-- RLS Policies for chat_messages
DROP POLICY IF EXISTS "Users can view messages in their conversations" ON public.chat_messages;
CREATE POLICY "Users can view messages in their conversations"
  ON public.chat_messages FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.chat_conversations
      WHERE chat_conversations.id = chat_messages.conversation_id
      AND (chat_conversations.user_id = auth.uid() OR chat_conversations.user_id IS NULL)
    )
  );

DROP POLICY IF EXISTS "Anyone can create chat messages" ON public.chat_messages;
CREATE POLICY "Anyone can create chat messages"
  ON public.chat_messages FOR INSERT
  WITH CHECK (true);

-- RLS Policies for knowledge_base
DROP POLICY IF EXISTS "Everyone can read knowledge base" ON public.knowledge_base;
CREATE POLICY "Everyone can read knowledge base"
  ON public.knowledge_base FOR SELECT
  USING (true);

DROP POLICY IF EXISTS "Only admins can manage knowledge base" ON public.knowledge_base;
CREATE POLICY "Only admins can manage knowledge base"
  ON public.knowledge_base FOR ALL
  USING (public.has_role(auth.uid(), 'admin'));

-- Create triggers for updated_at
DROP TRIGGER IF EXISTS update_churches_updated_at ON public.churches;
CREATE TRIGGER update_churches_updated_at
  BEFORE UPDATE ON public.churches
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS update_profiles_updated_at ON public.profiles;
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS update_members_updated_at ON public.members;
CREATE TRIGGER update_members_updated_at
  BEFORE UPDATE ON public.members
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS update_church_donations_updated_at ON public.church_donations;
CREATE TRIGGER update_church_donations_updated_at
  BEFORE UPDATE ON public.church_donations
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS update_events_updated_at ON public.events;
CREATE TRIGGER update_events_updated_at
  BEFORE UPDATE ON public.events
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Create or replace trigger to auto-create profile on user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, phone)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', 'Utilisateur'),
    NEW.raw_user_meta_data->>'phone'
  );
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();