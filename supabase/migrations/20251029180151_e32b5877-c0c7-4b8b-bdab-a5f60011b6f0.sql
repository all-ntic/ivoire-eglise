-- Fix PUBLIC_DATA_EXPOSURE: Secure eglise_tradlog_contacts table
DROP POLICY IF EXISTS "Public read access for now" ON eglise_tradlog_contacts;

CREATE POLICY "Only admins can view tradlog contacts"
ON eglise_tradlog_contacts
FOR SELECT
USING (has_role(auth.uid(), 'admin'::app_role));

-- Fix MISSING_RLS: Add UPDATE/DELETE policies for contact_messages
CREATE POLICY "Admins can update contact messages"
ON contact_messages
FOR UPDATE
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can delete contact messages"
ON contact_messages
FOR DELETE
USING (has_role(auth.uid(), 'admin'::app_role));