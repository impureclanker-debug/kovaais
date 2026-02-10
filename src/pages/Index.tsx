import HeroSection from "@/components/HeroSection";
import PricingSection from "@/components/PricingSection";
import IntakeForm from "@/components/IntakeForm";
import FunnelCTA from "@/components/FunnelCTA";
import Footer from "@/components/Footer";

const Index = () => {
  return (
    <main className="min-h-screen bg-background">
      <HeroSection />
      <IntakeForm />
      <PricingSection />
      <FunnelCTA />
      <Footer />
    </main>
  );
};

export default Index;
