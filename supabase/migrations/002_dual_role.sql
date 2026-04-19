-- Migration: Dual Role Support
-- Remove user_type column - role is now determined by stylist_profiles existence

-- Drop user_type column from users
ALTER TABLE public.users DROP COLUMN user_type;

-- Update trigger to not reference user_type
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (id, email, name, phone)
  VALUES (
    NEW.id,
    NEW.email,
    NEW.raw_user_meta_data->>'name',
    NEW.raw_user_meta_data->>'phone'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
