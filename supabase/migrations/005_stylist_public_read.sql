-- Migration: Allow public read access to users who are stylists
-- Needed for the inner join in getStylistList() to work

DROP POLICY IF EXISTS "Stylist users are publicly readable" ON public.users;
CREATE POLICY "Stylist users are publicly readable"
  ON public.users FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.stylist_profiles
      WHERE stylist_profiles.user_id = users.id
    )
  );

-- Feed posts also need readable user info for the author
-- (already handled by the above since authors of feed posts from stylists are readable)
