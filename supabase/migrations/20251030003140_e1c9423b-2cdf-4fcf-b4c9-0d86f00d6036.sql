-- Supprimer tous les triggers
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP TRIGGER IF EXISTS update_eglise_profiles_updated_at ON public.eglise_profiles;
DROP TRIGGER IF EXISTS update_ie_events_updated_at ON public.ie_events;
DROP TRIGGER IF EXISTS update_ie_announcements_updated_at ON public.ie_announcements;
DROP TRIGGER IF EXISTS update_contact_messages_updated_at ON public.contact_messages;
DROP TRIGGER IF EXISTS update_donations_updated_at ON public.donations;
DROP TRIGGER IF EXISTS increment_prayer_count_trigger ON public.ie_prayer_responses;
DROP TRIGGER IF EXISTS update_ie_prayer_requests_updated_at ON public.ie_prayer_requests;

-- Supprimer toutes les tables (dans l'ordre pour respecter les foreign keys)
DROP TABLE IF EXISTS public.ie_prayer_responses CASCADE;
DROP TABLE IF EXISTS public.ie_prayer_requests CASCADE;
DROP TABLE IF EXISTS public.ie_event_registrations CASCADE;
DROP TABLE IF EXISTS public.ie_events CASCADE;
DROP TABLE IF EXISTS public.ie_announcements CASCADE;
DROP TABLE IF EXISTS public.ie_chatbot_knowledge CASCADE;
DROP TABLE IF EXISTS public.chatbot_rate_limits CASCADE;
DROP TABLE IF EXISTS public.donations CASCADE;
DROP TABLE IF EXISTS public.contact_messages CASCADE;
DROP TABLE IF EXISTS public."OLCAP-CI_message" CASCADE;
DROP TABLE IF EXISTS public.tradlog_contacts CASCADE;
DROP TABLE IF EXISTS public.eglise_user_roles CASCADE;
DROP TABLE IF EXISTS public.eglise_profiles CASCADE;
DROP TABLE IF EXISTS public.eglise_churches CASCADE;

-- Supprimer toutes les fonctions personnalisées
DROP FUNCTION IF EXISTS public.create_church_with_pastor(TEXT, TEXT, UUID);
DROP FUNCTION IF EXISTS public.increment_prayer_count();
DROP FUNCTION IF EXISTS public.has_role(UUID, app_role);
DROP FUNCTION IF EXISTS public.get_user_church(UUID);
DROP FUNCTION IF EXISTS public.cleanup_old_rate_limits();
DROP FUNCTION IF EXISTS public.handle_new_user();
DROP FUNCTION IF EXISTS public.update_contact_messages_updated_at();
DROP FUNCTION IF EXISTS public.update_updated_at_column();

-- Supprimer les types énumérés personnalisés
DROP TYPE IF EXISTS public.app_role CASCADE;