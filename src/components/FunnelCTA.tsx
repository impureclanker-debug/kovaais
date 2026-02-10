import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Calendar, Shield, Zap } from "lucide-react";

const FunnelCTA = () => {
  return (
    <section className="py-24 md:py-32 bg-background relative overflow-hidden">
      {/* Subtle gradient accent */}
      <div className="absolute inset-0 bg-gradient-to-t from-kova-surface/50 to-transparent" />

      <div className="container max-w-4xl mx-auto px-6 relative z-10">
        <motion.div
          className="glass-surface metallic-border rounded-sm p-10 md:p-16 text-center"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <h2 className="text-3xl md:text-4xl font-display tracking-wide mb-6">
            Book a Free <span className="gradient-gold-text">Build Review</span>
          </h2>

          <p className="text-muted-foreground max-w-xl mx-auto mb-8 leading-relaxed">
            Your preview is just the beginning. Schedule a complimentary consultation to discuss 
            your custom build, installation, and ongoing systems.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
            {[
              { icon: Zap, title: "Preview = Concept Only", desc: "A taste of what Kova builds for you" },
              { icon: Shield, title: "Build & Install = Paid", desc: "Custom design, deployment & configuration" },
              { icon: Calendar, title: "First Month Free", desc: "Retainer starts free after installation" },
            ].map((item, i) => (
              <motion.div
                key={item.title}
                className="p-4 rounded-sm bg-kova-surface/50 border border-kova-chrome/10"
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.2 + i * 0.1, duration: 0.4 }}
              >
                <item.icon className="w-5 h-5 text-kova-gold mb-2 mx-auto" />
                <h4 className="text-sm font-display tracking-wide text-foreground mb-1">{item.title}</h4>
                <p className="text-xs text-muted-foreground">{item.desc}</p>
              </motion.div>
            ))}
          </div>

          <Button
            variant="gold"
            size="xl"
            asChild
          >
            <a href="https://calendar.google.com" target="_blank" rel="noopener noreferrer">
              <Calendar className="w-4 h-4 mr-2" />
              Schedule Consultation
            </a>
          </Button>

          <p className="text-xs text-muted-foreground mt-4 tracking-wider uppercase">
            30-minute Google Meet · No obligation
          </p>
        </motion.div>
      </div>
    </section>
  );
};

export default FunnelCTA;
