import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import kovaLogo from "@/assets/kova-logo.png";
import heroBg from "@/assets/hero-bg.jpg";

const HeroSection = () => {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0">
        <img src={heroBg} alt="" className="w-full h-full object-cover opacity-40" />
        <div className="absolute inset-0 bg-gradient-to-b from-background/80 via-background/60 to-background" />
      </div>

      {/* Content */}
      <div className="relative z-10 container max-w-5xl mx-auto px-6 text-center">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="glass-surface metallic-border rounded-sm p-12 md:p-16 lg:p-20"
        >
          {/* Logo */}
          <motion.img
            src={kovaLogo}
            alt="Kova Solutions"
            className="h-14 md:h-16 mx-auto mb-10"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3, duration: 0.6 }}
          />

          {/* Headline */}
          <motion.h1
            className="text-4xl md:text-5xl lg:text-6xl font-display font-semibold tracking-wide mb-4"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.6 }}
          >
            <span className="gradient-gold-text">Innovate.</span>{" "}
            <span className="text-foreground">Build.</span>{" "}
            <span className="text-foreground">Secure.</span>
          </motion.h1>

          <motion.p
            className="text-lg md:text-xl text-muted-foreground tracking-widest uppercase font-body mb-10"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6, duration: 0.6 }}
          >
            Enterprise-Grade Digital Frameworks & Consulting
          </motion.p>

          {/* CTAs */}
          <motion.div
            className="flex flex-col sm:flex-row gap-4 justify-center"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8, duration: 0.5 }}
          >
            <Button variant="gold" size="xl" onClick={() => document.getElementById("intake")?.scrollIntoView({ behavior: "smooth" })}>
              Get Your Preview
            </Button>
            <Button variant="chrome" size="xl" onClick={() => document.getElementById("pricing")?.scrollIntoView({ behavior: "smooth" })}>
              View Packages
            </Button>
          </motion.div>

          {/* Lock badge */}
          <motion.div
            className="mt-8 inline-flex items-center gap-2 px-4 py-2 rounded-sm bg-kova-surface border border-kova-chrome/20 text-xs text-muted-foreground tracking-wider uppercase"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.0, duration: 0.5 }}
          >
            <svg className="w-3.5 h-3.5 text-kova-gold" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
            </svg>
            Kova Signature Framework — Upgrade for Full Access
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
};

export default HeroSection;
