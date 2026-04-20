-- Migration: Create wardrobe storage bucket

INSERT INTO storage.buckets (id, name, public)
VALUES ('wardrobe', 'wardrobe', true)
ON CONFLICT (id) DO NOTHING;

-- Storage policies for wardrobe bucket
DROP POLICY IF EXISTS "Anyone can view wardrobe images" ON storage.objects;
CREATE POLICY "Anyone can view wardrobe images"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'wardrobe');

DROP POLICY IF EXISTS "Users can upload own wardrobe images" ON storage.objects;
CREATE POLICY "Users can upload own wardrobe images"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'wardrobe'
    AND auth.role() = 'authenticated'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

DROP POLICY IF EXISTS "Users can delete own wardrobe images" ON storage.objects;
CREATE POLICY "Users can delete own wardrobe images"
  ON storage.objects FOR DELETE
  USING (
    bucket_id = 'wardrobe'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );
