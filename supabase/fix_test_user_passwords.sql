-- Fix passwords for all test @negiysem.com users
-- Run this in Supabase Dashboard > SQL Editor

UPDATE auth.users
SET
  encrypted_password = crypt('Test1234!', gen_salt('bf')),
  email_confirmed_at = COALESCE(email_confirmed_at, now()),
  raw_app_meta_data = '{"provider":"email","providers":["email"]}'::jsonb,
  raw_user_meta_data = COALESCE(raw_user_meta_data, '{}'::jsonb),
  confirmation_token = COALESCE(confirmation_token, ''),
  recovery_token = COALESCE(recovery_token, ''),
  email_change_token_new = COALESCE(email_change_token_new, ''),
  email_change_token_current = COALESCE(email_change_token_current, ''),
  email_change = COALESCE(email_change, ''),
  phone_change = COALESCE(phone_change, ''),
  phone_change_token = COALESCE(phone_change_token, ''),
  reauthentication_token = COALESCE(reauthentication_token, ''),
  updated_at = now()
WHERE email LIKE '%@negiysem.com';

-- Make sure there's an identity row for each user
INSERT INTO auth.identities (id, user_id, provider_id, identity_data, provider, last_sign_in_at, created_at, updated_at)
SELECT
  gen_random_uuid(),
  u.id,
  u.id::text,
  jsonb_build_object('sub', u.id::text, 'email', u.email, 'email_verified', true),
  'email',
  now(),
  now(),
  now()
FROM auth.users u
WHERE u.email LIKE '%@negiysem.com'
  AND NOT EXISTS (
    SELECT 1 FROM auth.identities i
    WHERE i.user_id = u.id AND i.provider = 'email'
  );
