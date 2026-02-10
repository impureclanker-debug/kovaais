import kovaLogo from "@/assets/kova-logo.png";

const Footer = () => {
  return (
    <footer className="py-10 border-t border-kova-chrome/10 bg-background">
      <div className="container max-w-5xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-4">
        <img src={kovaLogo} alt="Kova Solutions" className="h-8 opacity-70" />
        <p className="text-xs text-muted-foreground tracking-wider">
          © {new Date().getFullYear()} Kova Solutions · Phoenix, AZ · All rights reserved
        </p>
      </div>
    </footer>
  );
};

export default Footer;
