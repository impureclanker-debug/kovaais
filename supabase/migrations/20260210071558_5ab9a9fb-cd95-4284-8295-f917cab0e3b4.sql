
-- Create previews storage bucket
INSERT INTO storage.buckets (id, name, public) VALUES ('previews', 'previews', true)
ON CONFLICT (id) DO NOTHING;

CREATE POLICY "Anyone can view preview images"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'previews');

CREATE POLICY "Service can upload preview images"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'previews');
