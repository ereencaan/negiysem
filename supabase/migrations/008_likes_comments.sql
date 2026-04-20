-- Migration: Post likes and comments for Instagram-like feed

-- Likes table (unique per user+post)
CREATE TABLE IF NOT EXISTS public.post_likes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id UUID NOT NULL REFERENCES public.feed_posts(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(post_id, user_id)
);

CREATE INDEX IF NOT EXISTS idx_post_likes_post ON public.post_likes(post_id);
CREATE INDEX IF NOT EXISTS idx_post_likes_user ON public.post_likes(user_id);

ALTER TABLE public.post_likes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read likes" ON public.post_likes FOR SELECT USING (true);

CREATE POLICY "Authenticated users can like" ON public.post_likes FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can unlike own likes" ON public.post_likes FOR DELETE
  USING (auth.uid() = user_id);

-- Comments table
CREATE TABLE IF NOT EXISTS public.post_comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id UUID NOT NULL REFERENCES public.feed_posts(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_post_comments_post ON public.post_comments(post_id);

ALTER TABLE public.post_comments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read comments" ON public.post_comments FOR SELECT USING (true);

CREATE POLICY "Authenticated users can comment" ON public.post_comments FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own comments" ON public.post_comments FOR DELETE
  USING (auth.uid() = user_id);

-- Trigger: update likes_count on feed_posts when like is added/removed
CREATE OR REPLACE FUNCTION public.update_likes_count()
RETURNS TRIGGER AS $$
DECLARE
  target_post_id UUID;
BEGIN
  target_post_id := COALESCE(NEW.post_id, OLD.post_id);
  UPDATE public.feed_posts
  SET likes_count = (SELECT count(*) FROM public.post_likes WHERE post_id = target_post_id)
  WHERE id = target_post_id;
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_like_change ON public.post_likes;
CREATE TRIGGER on_like_change
  AFTER INSERT OR DELETE ON public.post_likes
  FOR EACH ROW
  EXECUTE FUNCTION public.update_likes_count();

-- Allow anyone to read feed post authors (for comments, etc.)
DROP POLICY IF EXISTS "Feed post authors are publicly readable" ON public.users;
CREATE POLICY "Feed post authors are publicly readable"
  ON public.users FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.feed_posts WHERE feed_posts.user_id = users.id
    )
    OR
    EXISTS (
      SELECT 1 FROM public.post_comments WHERE post_comments.user_id = users.id
    )
  );
