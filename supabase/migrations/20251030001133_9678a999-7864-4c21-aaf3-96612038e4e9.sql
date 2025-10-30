-- Créer les tables pour le site de l'église avec le préfixe ie_

-- Table pour les annonces
CREATE TABLE public.ie_announcements (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  author_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  published BOOLEAN DEFAULT false,
  publish_date TIMESTAMP WITH TIME ZONE,
  expire_date TIMESTAMP WITH TIME ZONE,
  priority TEXT DEFAULT 'normal' CHECK (priority IN ('low', 'normal', 'high', 'urgent')),
  category TEXT DEFAULT 'general',
  image_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Table pour les événements
CREATE TABLE public.ie_events (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  event_date TIMESTAMP WITH TIME ZONE NOT NULL,
  end_date TIMESTAMP WITH TIME ZONE,
  location TEXT,
  address TEXT,
  organizer_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  max_participants INTEGER,
  registration_required BOOLEAN DEFAULT false,
  registration_deadline TIMESTAMP WITH TIME ZONE,
  status TEXT DEFAULT 'upcoming' CHECK (status IN ('upcoming', 'ongoing', 'completed', 'cancelled')),
  category TEXT DEFAULT 'general',
  image_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Table pour les inscriptions aux événements
CREATE TABLE public.ie_event_registrations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  event_id UUID NOT NULL REFERENCES public.ie_events(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  guest_name TEXT,
  guest_email TEXT,
  guest_phone TEXT,
  number_of_guests INTEGER DEFAULT 1,
  status TEXT DEFAULT 'confirmed' CHECK (status IN ('pending', 'confirmed', 'cancelled')),
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  CONSTRAINT user_or_guest CHECK (user_id IS NOT NULL OR guest_name IS NOT NULL)
);

-- Table pour la base de connaissances du chatbot
CREATE TABLE public.ie_chatbot_knowledge (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  tags TEXT[] DEFAULT '{}',
  category TEXT DEFAULT 'general',
  priority INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Table pour les demandes de prière
CREATE TABLE public.ie_prayer_requests (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  requester_name TEXT,
  request TEXT NOT NULL,
  is_anonymous BOOLEAN DEFAULT false,
  is_urgent BOOLEAN DEFAULT false,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'answered', 'archived')),
  prayer_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Table pour suivre qui a prié pour quelle demande
CREATE TABLE public.ie_prayer_responses (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  prayer_request_id UUID NOT NULL REFERENCES public.ie_prayer_requests(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(prayer_request_id, user_id)
);

-- Activer RLS sur toutes les tables
ALTER TABLE public.ie_announcements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ie_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ie_event_registrations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ie_chatbot_knowledge ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ie_prayer_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ie_prayer_responses ENABLE ROW LEVEL SECURITY;

-- Politiques RLS pour ie_announcements
CREATE POLICY "Tout le monde peut voir les annonces publiées"
ON public.ie_announcements FOR SELECT
USING (published = true OR has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins peuvent créer des annonces"
ON public.ie_announcements FOR INSERT
WITH CHECK (has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins peuvent modifier des annonces"
ON public.ie_announcements FOR UPDATE
USING (has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins peuvent supprimer des annonces"
ON public.ie_announcements FOR DELETE
USING (has_role(auth.uid(), 'admin'));

-- Politiques RLS pour ie_events
CREATE POLICY "Tout le monde peut voir les événements"
ON public.ie_events FOR SELECT
USING (true);

CREATE POLICY "Admins peuvent créer des événements"
ON public.ie_events FOR INSERT
WITH CHECK (has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins peuvent modifier des événements"
ON public.ie_events FOR UPDATE
USING (has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins peuvent supprimer des événements"
ON public.ie_events FOR DELETE
USING (has_role(auth.uid(), 'admin'));

-- Politiques RLS pour ie_event_registrations
CREATE POLICY "Admins peuvent voir toutes les inscriptions"
ON public.ie_event_registrations FOR SELECT
USING (has_role(auth.uid(), 'admin') OR user_id = auth.uid());

CREATE POLICY "Utilisateurs authentifiés ou invités peuvent s'inscrire"
ON public.ie_event_registrations FOR INSERT
WITH CHECK (auth.uid() IS NOT NULL OR guest_name IS NOT NULL);

CREATE POLICY "Utilisateurs peuvent modifier leurs inscriptions"
ON public.ie_event_registrations FOR UPDATE
USING (user_id = auth.uid() OR has_role(auth.uid(), 'admin'));

CREATE POLICY "Utilisateurs peuvent supprimer leurs inscriptions"
ON public.ie_event_registrations FOR DELETE
USING (user_id = auth.uid() OR has_role(auth.uid(), 'admin'));

-- Politiques RLS pour ie_chatbot_knowledge
CREATE POLICY "Tout le monde peut lire la base de connaissances"
ON public.ie_chatbot_knowledge FOR SELECT
USING (true);

CREATE POLICY "Admins peuvent gérer la base de connaissances"
ON public.ie_chatbot_knowledge FOR ALL
USING (has_role(auth.uid(), 'admin'));

-- Politiques RLS pour ie_prayer_requests
CREATE POLICY "Tout le monde peut voir les demandes non anonymes"
ON public.ie_prayer_requests FOR SELECT
USING (is_anonymous = false OR user_id = auth.uid() OR has_role(auth.uid(), 'admin'));

CREATE POLICY "Utilisateurs authentifiés peuvent créer des demandes"
ON public.ie_prayer_requests FOR INSERT
WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Utilisateurs peuvent modifier leurs demandes"
ON public.ie_prayer_requests FOR UPDATE
USING (user_id = auth.uid() OR has_role(auth.uid(), 'admin'));

CREATE POLICY "Utilisateurs peuvent supprimer leurs demandes"
ON public.ie_prayer_requests FOR DELETE
USING (user_id = auth.uid() OR has_role(auth.uid(), 'admin'));

-- Politiques RLS pour ie_prayer_responses
CREATE POLICY "Utilisateurs peuvent voir qui a prié"
ON public.ie_prayer_responses FOR SELECT
USING (true);

CREATE POLICY "Utilisateurs authentifiés peuvent marquer qu'ils ont prié"
ON public.ie_prayer_responses FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Triggers pour updated_at
CREATE TRIGGER update_ie_announcements_updated_at
BEFORE UPDATE ON public.ie_announcements
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_ie_events_updated_at
BEFORE UPDATE ON public.ie_events
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_ie_chatbot_knowledge_updated_at
BEFORE UPDATE ON public.ie_chatbot_knowledge
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_ie_prayer_requests_updated_at
BEFORE UPDATE ON public.ie_prayer_requests
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Trigger pour incrémenter le compteur de prières
CREATE OR REPLACE FUNCTION public.increment_prayer_count()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE public.ie_prayer_requests
  SET prayer_count = prayer_count + 1
  WHERE id = NEW.prayer_request_id;
  RETURN NEW;
END;
$$;

CREATE TRIGGER increment_prayer_count_trigger
AFTER INSERT ON public.ie_prayer_responses
FOR EACH ROW
EXECUTE FUNCTION public.increment_prayer_count();

-- Créer des index pour améliorer les performances
CREATE INDEX idx_ie_announcements_published ON public.ie_announcements(published, publish_date);
CREATE INDEX idx_ie_events_date ON public.ie_events(event_date, status);
CREATE INDEX idx_ie_event_registrations_event ON public.ie_event_registrations(event_id);
CREATE INDEX idx_ie_chatbot_knowledge_tags ON public.ie_chatbot_knowledge USING GIN(tags);
CREATE INDEX idx_ie_prayer_requests_status ON public.ie_prayer_requests(status, created_at);