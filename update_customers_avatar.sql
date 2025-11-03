-- Προσθήκη avatar εικόνας για πελάτες

-- 1) Προσθήκη στήλης avatar_url (idempotent)
ALTER TABLE public.customers
  ADD COLUMN IF NOT EXISTS avatar_url TEXT;

-- 2) Δημιουργία storage bucket για avatars (idempotent)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM storage.buckets WHERE id = 'avatars'
  ) THEN
    -- Υπογραφή: storage.create_bucket(id text, name text default null, public boolean default false, file_size_limit text default null, allowed_mime_types text[] default null)
    PERFORM storage.create_bucket('avatars', NULL, TRUE, '5242880');
  END IF;
END$$;

-- 3) Policies για storage.objects (idempotent)
-- Δημόσιο read για το bucket avatars
DROP POLICY IF EXISTS "Public read avatars" ON storage.objects;
CREATE POLICY "Public read avatars"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'avatars');

-- Επιτρέπουμε σε authenticated να ανεβάζουν/ενημερώνουν/σβήνουν μόνο στο bucket avatars
DROP POLICY IF EXISTS "Authenticated insert avatars" ON storage.objects;
CREATE POLICY "Authenticated insert avatars"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'avatars' AND auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Authenticated update avatars" ON storage.objects;
CREATE POLICY "Authenticated update avatars"
  ON storage.objects FOR UPDATE
  USING (bucket_id = 'avatars' AND auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Authenticated delete avatars" ON storage.objects;
CREATE POLICY "Authenticated delete avatars"
  ON storage.objects FOR DELETE
  USING (bucket_id = 'avatars' AND auth.role() = 'authenticated');


