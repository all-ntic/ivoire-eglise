-- Create messages table for member-to-member and member-to-pastor communication
CREATE TABLE public.eglise_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sender_id UUID NOT NULL,
  receiver_id UUID NOT NULL,
  message TEXT NOT NULL,
  is_read BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.eglise_messages ENABLE ROW LEVEL SECURITY;

-- Users can view messages they sent or received
CREATE POLICY "Users can view their messages"
ON public.eglise_messages
FOR SELECT
USING (sender_id = auth.uid() OR receiver_id = auth.uid());

-- Users can send messages
CREATE POLICY "Users can send messages"
ON public.eglise_messages
FOR INSERT
WITH CHECK (sender_id = auth.uid());

-- Users can mark their received messages as read
CREATE POLICY "Users can mark messages as read"
ON public.eglise_messages
FOR UPDATE
USING (receiver_id = auth.uid());

-- Create group chat messages table
CREATE TABLE public.eglise_group_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  church_id UUID NOT NULL,
  sender_id UUID NOT NULL,
  message TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.eglise_group_messages ENABLE ROW LEVEL SECURITY;

-- Members can view group messages of their church
CREATE POLICY "Members can view group messages"
ON public.eglise_group_messages
FOR SELECT
USING (church_id = get_user_church(auth.uid()));

-- Members can send group messages
CREATE POLICY "Members can send group messages"
ON public.eglise_group_messages
FOR INSERT
WITH CHECK (church_id = get_user_church(auth.uid()) AND sender_id = auth.uid());