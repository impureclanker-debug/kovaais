import { motion } from "framer-motion";
import { Check } from "lucide-react";
import { Button } from "@/components/ui/button";

const tiers = [
  {
    name: "Design & Build",
    subtitle: "Handoff Only",
    price: "$500–$800",
    priceLabel: "installation",
    features: [
      "Custom website design & build",
      "Client receives all files & code",
      "No hosting included",
      "No ongoing support",
      "No systems or automations",
    ],
    highlight: false,
  },
  {
    name: "Installed + Managed",
    subtitle: "Most Popular",
    price: "$1,200–$1,500",
    priceLabel: "installation",
    features: [
      "Site designed, built & deployed",
      "Full configuration & setup",
      "First month retainer FREE",
      "Then $100–$150/month",
      "Ongoing support & updates",
    ],
    highlight: true,
    badge: "Best Value",
  },
  {
    name: "Full Systems + Hosting",
    subtitle: "Enterprise",
    price: "$500/mo",
    priceLabel: "hosting & systems",
    features: [
      "Everything in Installed + Managed",
      "Installation fee applies",
      "Custom automations & dashboards",
      "AI-powered tools included",
      "Priority support & scaling",
    ],
    highlight: false,
  },
];

const PricingSection = () => {
  return (
    <section id="pricing" className="py-24 md:py-32 bg-background">
      <div className="container max-w-6xl mx-auto px-6">
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <h2 className="text-3xl md:text-4xl font-display tracking-wide mb-4">
            <span className="gradient-gold-text">Investment</span> Tiers
          </h2>
          <p className="text-muted-foreground tracking-wider uppercase text-sm max-w-xl mx-auto">
            Every project includes a custom design. No templates. No shortcuts.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-6 lg:gap-8">
          {tiers.map((tier, i) => (
            <motion.div
              key={tier.name}
              className={`relative flex flex-col p-8 rounded-sm metallic-border ${
                tier.highlight
                  ? "bg-kova-surface-elevated border-kova-gold/30"
                  : "bg-kova-surface"
              }`}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.15 }}
            >
              {tier.badge && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 gradient-gold text-primary-foreground text-xs font-semibold tracking-widest uppercase px-4 py-1 rounded-sm">
                  {tier.badge}
                </div>
              )}

              <div className="mb-6">
                <h3 className="font-display text-xl tracking-wide text-foreground">{tier.name}</h3>
                <p className="text-xs text-muted-foreground tracking-widest uppercase mt-1">{tier.subtitle}</p>
              </div>

              <div className="mb-6">
                <span className="text-3xl font-display gradient-gold-text">{tier.price}</span>
                <span className="text-sm text-muted-foreground ml-2">/{tier.priceLabel}</span>
              </div>

              <ul className="space-y-3 mb-8 flex-1">
                {tier.features.map((f) => (
                  <li key={f} className="flex items-start gap-3 text-sm text-foreground/80">
                    <Check className="w-4 h-4 text-kova-gold mt-0.5 shrink-0" />
                    <span>{f}</span>
                  </li>
                ))}
              </ul>

              <Button
                variant={tier.highlight ? "gold" : "gold-outline"}
                size="lg"
                className="w-full"
                onClick={() => document.getElementById("intake")?.scrollIntoView({ behavior: "smooth" })}
              >
                Get Started
              </Button>
            </motion.div>
          ))}
        </div>

        <motion.p
          className="text-center text-xs text-muted-foreground mt-10 tracking-wider uppercase"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.5 }}
        >
          All tiers include an installation fee. First month retainer free on Tier 2+.
        </motion.p>
      </div>
    </section>
  );
};

export default PricingSection;
