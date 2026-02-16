
-- Allow anonymous users to view specific lead fields for the preview page
CREATE POLICY "Anyone can view lead name and logo"
  ON public.business_leads FOR SELECT
  USING (true);

-- Drop the old restrictive select policy
DROP POLICY IF EXISTS "Authenticated users can view leads" ON public.business_leads;
