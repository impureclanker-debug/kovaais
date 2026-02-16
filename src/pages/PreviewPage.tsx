import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Lock, Calendar, Loader2 } from "lucide-react";
import kovaLogo from "@/assets/kova-logo.png";
import PricingSection from "@/components/PricingSection";
import FunnelCTA from "@/components/FunnelCTA";
import Footer from "@/components/Footer";

interface Preview {
  id: string;
  hero_headline: string;
  hero_subheadline: string;
  brand_positioning: string;
  copy_direction: string;
  feature_sections: Array<{ title: string; description: string; locked: boolean }>;
  hero_image_url: string;
  status: string;
}

interface Lead {
  business_name: string;
  logo_url: string | null;
  city: string;
  state: string;
}

const PreviewPage = () => {
  const { leadId } = useParams<{ leadId: string }>();
  const [preview, setPreview] = useState<Preview | null>(null);
  const [lead, setLead] = useState<Lead | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!leadId) return;

    const fetchData = async () => {
      // Fetch lead info
      const { data: leadData } = await supabase
        .from("business_leads")
        .select("business_name, logo_url, city, state")
        .eq("id", leadId)
        .single();
      if (leadData) setLead(leadData as Lead);

      // Fetch or poll preview
      const checkPreview = async () => {
        const { data: previewData } = await supabase
          .from("generated_previews")
          .select("*")
          .eq("lead_id", leadId)
          .order("created_at", { ascending: false })
          .limit(1)
          .single();

        if (previewData) {
          setPreview(previewData as unknown as Preview);
          if (previewData.status === "ready" || previewData.status === "failed") {
            setLoading(false);
            return true;
          }
        }
        return false;
      };

      const done = await checkPreview();
      if (!done) {
        // Poll every 5 seconds
        const interval = setInterval(async () => {
          const isDone = await checkPreview();
          if (isDone) {
            clearInterval(interval);
          }
        }, 5000);
        // Timeout after 3 minutes
        setTimeout(() => {
          clearInterval(interval);
          setLoading(false);
        }, 180000);
      }
    };

    fetchData();
  }, [leadId]);

  if (loading || !preview || preview.status === "generating") {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <motion.div
          className="glass-surface metallic-border rounded-sm p-12 text-center max-w-md"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
        >
          <img src={kovaLogo} alt="Kova" className="h-10 mx-auto mb-6" />
          <Loader2 className="w-8 h-8 text-kova-gold animate-spin mx-auto mb-4" />
          <h2 className="font-display text-xl tracking-wide mb-2">Crafting Your Preview</h2>
          <p className="text-sm text-muted-foreground">
            Our AI is researching your market and generating a custom concept.
            This typically takes 30–60 seconds.
          </p>
        </motion.div>
      </div>
    );
  }

  if (preview.status === "failed") {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="glass-surface metallic-border rounded-sm p-12 text-center max-w-md">
          <img src={kovaLogo} alt="Kova" className="h-10 mx-auto mb-6" />
          <h2 className="font-display text-xl tracking-wide mb-2">Preview Generation Issue</h2>
          <p className="text-sm text-muted-foreground mb-6">
            We encountered an issue generating your preview. Our team has been notified.
          </p>
          <Button variant="gold" asChild>
            <Link to="/">Return Home</Link>
          </Button>
        </div>
      </div>
    );
  }

  const featureSections = (preview.feature_sections || []) as Array<{ title: string; description: string; locked: boolean }>;

  return (
    <main className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="relative min-h-[80vh] flex items-center justify-center overflow-hidden">
        {preview.hero_image_url && (
          <div className="absolute inset-0">
            <img src={preview.hero_image_url} alt="" className="w-full h-full object-cover opacity-30" />
            <div className="absolute inset-0 bg-gradient-to-b from-background/70 via-background/50 to-background" />
          </div>
        )}
        <div className="relative z-10 container max-w-5xl mx-auto px-6 text-center">
          <motion.div
            className="glass-surface metallic-border rounded-sm p-12 md:p-16"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <div className="flex items-center justify-center gap-4 mb-8">
              {lead?.logo_url && (
                <img src={lead.logo_url} alt={lead.business_name} className="h-12 object-contain" />
              )}
              <span className="text-xs tracking-widest uppercase text-muted-foreground">×</span>
              <img src={kovaLogo} alt="Kova Solutions" className="h-8" />
            </div>

            <h1 className="text-4xl md:text-5xl lg:text-6xl font-display font-semibold tracking-wide mb-4">
              <span className="gradient-gold-text">{preview.hero_headline}</span>
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground tracking-wider uppercase font-body mb-8">
              {preview.hero_subheadline}
            </p>

            <button
              onClick={() => document.getElementById("preview-content")?.scrollIntoView({ behavior: "smooth" })}
              className="inline-flex items-center gap-2 px-6 py-3 rounded-sm border border-kova-gold/40 bg-gradient-to-r from-kova-gold/10 to-kova-gold/5 text-sm text-kova-gold tracking-wider uppercase hover:from-kova-gold/20 hover:to-kova-gold/10 transition-all cursor-pointer"
            >
              <Lock className="w-3.5 h-3.5" />
              Preview Concept — {lead?.business_name || "Your Business"}
            </button>
          </motion.div>
        </div>
      </section>

      {/* Brand Positioning */}
      <section id="preview-content" className="py-16 bg-kova-surface/50">
        <div className="container max-w-3xl mx-auto px-6 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <p className="text-xs tracking-widest uppercase text-kova-gold mb-4">Brand Positioning</p>
            <p className="text-lg text-foreground/80 leading-relaxed italic">
              "{preview.brand_positioning}"
            </p>
          </motion.div>
        </div>
      </section>

      {/* Feature Sections — first unlocked, rest locked */}
      <section className="py-20">
        <div className="container max-w-5xl mx-auto px-6">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {featureSections.map((section, i) => (
              <motion.div
                key={i}
                className={`relative p-6 rounded-sm metallic-border ${
                  section.locked ? "bg-kova-surface/30" : "bg-kova-surface-elevated"
                }`}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
              >
                {section.locked && (
                  <div className="absolute inset-0 bg-kova-obsidian/60 backdrop-blur-sm rounded-sm flex items-center justify-center z-10">
                    <div className="text-center">
                      <Lock className="w-5 h-5 text-kova-gold mx-auto mb-2" />
                      <p className="text-xs text-muted-foreground tracking-wider uppercase">
                        Unlocked Post-Build
                      </p>
                    </div>
                  </div>
                )}
                <h3 className="font-display text-lg tracking-wide mb-2 text-foreground">
                  {section.title}
                </h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {section.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Locked Systems Banner */}
      <section className="py-12 bg-kova-surface/50">
        <div className="container max-w-3xl mx-auto px-6">
          <motion.div
            className="glass-surface metallic-border rounded-sm p-8 text-center"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <Lock className="w-6 h-6 text-kova-gold mx-auto mb-3" />
            <h3 className="font-display text-xl tracking-wide mb-2">
              Final Copy & Systems Available After Install
            </h3>
            <p className="text-sm text-muted-foreground mb-1">
              Live functionality unlocked post-build
            </p>
            <p className="text-xs text-kova-gold tracking-wider uppercase">
              This preview is a concept only — not a finished product
            </p>
          </motion.div>
        </div>
      </section>

      <PricingSection />
      <FunnelCTA />
      <Footer />
    </main>
  );
};

export default PreviewPage;
