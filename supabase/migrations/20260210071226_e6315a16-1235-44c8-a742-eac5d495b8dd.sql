
-- Fix overly permissive insert on generated_previews
DROP POLICY "Authenticated users can insert previews" ON public.generated_previews;
CREATE POLICY "Service role or authenticated can insert previews"
  ON public.generated_previews FOR INSERT
  WITH CHECK (auth.role() = 'authenticated');
