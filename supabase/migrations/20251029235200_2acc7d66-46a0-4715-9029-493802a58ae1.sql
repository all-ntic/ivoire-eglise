-- Supprimer l'utilisateur non confirmé
DELETE FROM auth.users WHERE email = 'aboubakar019@gmail.com' AND confirmed_at IS NULL;