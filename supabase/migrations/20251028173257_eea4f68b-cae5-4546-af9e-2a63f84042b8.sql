-- Renommer toutes les tables avec le préfixe eglise_
ALTER TABLE IF EXISTS public.members RENAME TO eglise_members;
ALTER TABLE IF EXISTS public.donations RENAME TO eglise_donations;
ALTER TABLE IF EXISTS public.events RENAME TO eglise_events;
ALTER TABLE IF EXISTS public.announcements RENAME TO eglise_announcements;
ALTER TABLE IF EXISTS public.churches RENAME TO eglise_churches;
ALTER TABLE IF EXISTS public.profiles RENAME TO eglise_profiles;
ALTER TABLE IF EXISTS public.user_roles RENAME TO eglise_user_roles;
ALTER TABLE IF EXISTS public.chat_conversations RENAME TO eglise_chat_conversations;
ALTER TABLE IF EXISTS public.chat_messages RENAME TO eglise_chat_messages;
ALTER TABLE IF EXISTS public.church_donations RENAME TO eglise_church_donations;
ALTER TABLE IF EXISTS public.event_participants RENAME TO eglise_event_participants;
ALTER TABLE IF EXISTS public.chatbot_rate_limits RENAME TO eglise_chatbot_rate_limits;
ALTER TABLE IF EXISTS public.knowledge_base RENAME TO eglise_knowledge_base;
ALTER TABLE IF EXISTS public.contact_messages RENAME TO eglise_contact_messages;
ALTER TABLE IF EXISTS public."OLCAP-CI_message" RENAME TO "eglise_OLCAP-CI_message";
ALTER TABLE IF EXISTS public.tradlog_contacts RENAME TO eglise_tradlog_contacts;
ALTER TABLE IF EXISTS public.participants_secure RENAME TO eglise_participants_secure;