-- Create announcements table for church communications
CREATE TABLE public.announcements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  church_id UUID NOT NULL,
  author_id UUID NOT NULL,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  announcement_type TEXT NOT NULL DEFAULT 'information',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.announcements ENABLE ROW LEVEL SECURITY;

-- Pastors/admins can create and manage announcements
CREATE POLICY "Admins can manage announcements of their church"
ON public.announcements
FOR ALL
USING (church_id = get_user_church(auth.uid()) AND has_role(auth.uid(), 'admin'));

-- Members can view announcements of their church
CREATE POLICY "Users can view announcements of their church"
ON public.announcements
FOR SELECT
USING (church_id = get_user_church(auth.uid()));

-- Trigger for updated_at
CREATE TRIGGER update_announcements_updated_at
BEFORE UPDATE ON public.announcements
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();