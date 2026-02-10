import { useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

const industries = [
  "Restaurant / Food Service",
  "Real Estate",
  "Legal / Law Firm",
  "Medical / Healthcare",
  "Construction / Trades",
  "Fitness / Wellness",
  "Retail / E-Commerce",
  "Automotive",
  "Beauty / Salon",
  "Professional Services",
  "Other",
];

const IntakeForm = () => {
  const [formData, setFormData] = useState({
    businessName: "",
    city: "Phoenix",
    state: "AZ",
    industries: [] as string[],
    services: "",
    description: "",
    notes: "",
  });
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const toggleIndustry = (industry: string) => {
    setFormData((prev) => ({
      ...prev,
      industries: prev.industries.includes(industry)
        ? prev.industries.filter((i) => i !== industry)
        : [...prev.industries, industry],
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.businessName.trim()) {
      toast.error("Please enter your business name.");
      return;
    }
    if (formData.industries.length === 0) {
      toast.error("Please select at least one industry.");
      return;
    }
    setIsSubmitting(true);

    // TODO: Submit to Supabase
    await new Promise((r) => setTimeout(r, 1500));
    toast.success("Submission received! We'll prepare your preview concept.");
    setIsSubmitting(false);
  };

  return (
    <section id="intake" className="py-24 md:py-32 bg-kova-surface/50">
      <div className="container max-w-3xl mx-auto px-6">
        <motion.div
          className="text-center mb-12"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <h2 className="text-3xl md:text-4xl font-display tracking-wide mb-4">
            Start Your <span className="gradient-gold-text">Preview</span>
          </h2>
          <p className="text-muted-foreground tracking-wider uppercase text-sm">
            Tell us about your business. We'll craft a premium concept — on us.
          </p>
        </motion.div>

        <motion.form
          onSubmit={handleSubmit}
          className="glass-surface metallic-border rounded-sm p-8 md:p-10 space-y-6"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          {/* Business Name */}
          <div className="space-y-2">
            <Label className="text-xs tracking-widest uppercase text-muted-foreground">Business Name *</Label>
            <Input
              value={formData.businessName}
              onChange={(e) => setFormData({ ...formData, businessName: e.target.value })}
              placeholder="Your Business Name"
              className="bg-kova-surface border-kova-chrome/20 focus:border-kova-gold/50 text-foreground placeholder:text-muted-foreground/50"
            />
          </div>

          {/* Location */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-xs tracking-widest uppercase text-muted-foreground">City</Label>
              <Input
                value={formData.city}
                onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                className="bg-kova-surface border-kova-chrome/20 focus:border-kova-gold/50 text-foreground"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-xs tracking-widest uppercase text-muted-foreground">State</Label>
              <Input
                value={formData.state}
                onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                className="bg-kova-surface border-kova-chrome/20 focus:border-kova-gold/50 text-foreground"
              />
            </div>
          </div>

          {/* Industry Multi-select */}
          <div className="space-y-2">
            <Label className="text-xs tracking-widest uppercase text-muted-foreground">Industry *</Label>
            <div className="flex flex-wrap gap-2">
              {industries.map((ind) => (
                <button
                  key={ind}
                  type="button"
                  onClick={() => toggleIndustry(ind)}
                  className={`px-3 py-1.5 text-xs tracking-wider uppercase rounded-sm border transition-all duration-200 ${
                    formData.industries.includes(ind)
                      ? "border-kova-gold/60 bg-kova-gold/10 text-kova-gold"
                      : "border-kova-chrome/20 text-muted-foreground hover:border-kova-chrome/40"
                  }`}
                >
                  {ind}
                </button>
              ))}
            </div>
          </div>

          {/* Core Services */}
          <div className="space-y-2">
            <Label className="text-xs tracking-widest uppercase text-muted-foreground">Core Services</Label>
            <Input
              value={formData.services}
              onChange={(e) => setFormData({ ...formData, services: e.target.value })}
              placeholder="e.g., Plumbing, HVAC, Emergency Repairs"
              className="bg-kova-surface border-kova-chrome/20 focus:border-kova-gold/50 text-foreground placeholder:text-muted-foreground/50"
            />
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label className="text-xs tracking-widest uppercase text-muted-foreground">Short Business Description</Label>
            <Textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="What makes your business unique?"
              rows={3}
              className="bg-kova-surface border-kova-chrome/20 focus:border-kova-gold/50 text-foreground placeholder:text-muted-foreground/50 resize-none"
            />
          </div>

          {/* Logo Upload */}
          <div className="space-y-2">
            <Label className="text-xs tracking-widest uppercase text-muted-foreground">Upload Logo</Label>
            <div className="flex items-center gap-4">
              <label className="cursor-pointer px-4 py-2 text-xs tracking-wider uppercase border border-kova-chrome/30 rounded-sm text-muted-foreground hover:border-kova-gold/40 hover:text-foreground transition-colors">
                Choose File
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => setLogoFile(e.target.files?.[0] || null)}
                />
              </label>
              <span className="text-xs text-muted-foreground">
                {logoFile ? logoFile.name : "No file selected"}
              </span>
            </div>
          </div>

          {/* Notes */}
          <div className="space-y-2">
            <Label className="text-xs tracking-widest uppercase text-muted-foreground">Additional Notes</Label>
            <Textarea
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              placeholder="Any other details, preferences, or inspiration..."
              rows={2}
              className="bg-kova-surface border-kova-chrome/20 focus:border-kova-gold/50 text-foreground placeholder:text-muted-foreground/50 resize-none"
            />
          </div>

          <Button
            type="submit"
            variant="gold"
            size="xl"
            className="w-full"
            disabled={isSubmitting}
          >
            {isSubmitting ? "Submitting..." : "Submit for Preview"}
          </Button>

          <p className="text-center text-xs text-muted-foreground tracking-wider">
            Preview concepts are complimentary. Build & installation are paid services.
          </p>
        </motion.form>
      </div>
    </section>
  );
};

export default IntakeForm;
