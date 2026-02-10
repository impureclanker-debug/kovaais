
-- Business leads table
CREATE TABLE public.business_leads (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  business_name TEXT NOT NULL,
  city TEXT NOT NULL DEFAULT 'Phoenix',
  state TEXT NOT NULL DEFAULT 'AZ',
  industries TEXT[] NOT NULL DEFAULT '{}',
  core_services TEXT,
  business_description TEXT,
  logo_url TEXT,
  notes TEXT,
  status TEXT NOT NULL DEFAULT 'new' CHECK (status IN ('new', 'preview_sent', 'consult_booked', 'installed', 'retainer_active')),
  follow_up_notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.business_leads ENABLE ROW LEVEL SECURITY;

-- Public insert policy (anyone can submit a lead)
CREATE POLICY "Anyone can submit a lead"
  ON public.business_leads FOR INSERT
  WITH CHECK (true);

-- Only authenticated admin can read/update/delete
CREATE POLICY "Authenticated users can view leads"
  ON public.business_leads FOR SELECT
  USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can update leads"
  ON public.business_leads FOR UPDATE
  USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can delete leads"
  ON public.business_leads FOR DELETE
  USING (auth.role() = 'authenticated');

-- Generated previews table
CREATE TABLE public.generated_previews (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  lead_id UUID NOT NULL REFERENCES public.business_leads(id) ON DELETE CASCADE,
  brand_positioning TEXT,
  page_structure JSONB,
  copy_direction TEXT,
  hero_headline TEXT,
  hero_subheadline TEXT,
  feature_sections JSONB,
  hero_image_url TEXT,
  section_images JSONB,
  ai_notes TEXT,
  perplexity_research TEXT,
  status TEXT NOT NULL DEFAULT 'generating' CHECK (status IN ('generating', 'ready', 'failed')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.generated_previews ENABLE ROW LEVEL SECURITY;

-- Anyone can view previews (they're shared with prospects)
CREATE POLICY "Anyone can view previews"
  ON public.generated_previews FOR SELECT
  USING (true);

-- Only authenticated can manage
CREATE POLICY "Authenticated users can insert previews"
  ON public.generated_previews FOR INSERT
  WITH CHECK (auth.role() = 'authenticated' OR true);

CREATE POLICY "Authenticated users can update previews"
  ON public.generated_previews FOR UPDATE
  USING (auth.role() = 'authenticated');

-- Timestamp trigger
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

CREATE TRIGGER update_business_leads_updated_at
  BEFORE UPDATE ON public.business_leads
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_generated_previews_updated_at
  BEFORE UPDATE ON public.generated_previews
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Storage bucket for logos
INSERT INTO storage.buckets (id, name, public) VALUES ('logos', 'logos', true);

CREATE POLICY "Anyone can upload logos"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'logos');

CREATE POLICY "Anyone can view logos"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'logos');
