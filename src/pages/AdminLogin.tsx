import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import kovaLogo from "@/assets/kova-logo.png";

const AdminLogin = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [isSignUp, setIsSignUp] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    if (isSignUp) {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: { emailRedirectTo: window.location.origin + "/admin" },
      });
      if (error) {
        toast.error(error.message);
      } else {
        toast.success("Check your email to confirm your account, then sign in.");
        setIsSignUp(false);
      }
    } else {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) {
        toast.error(error.message);
      } else {
        navigate("/admin");
      }
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="glass-surface metallic-border rounded-sm p-10 w-full max-w-sm">
        <img src={kovaLogo} alt="Kova" className="h-10 mx-auto mb-8" />
        <h2 className="font-display text-xl tracking-wide text-center mb-6">
          {isSignUp ? "Create Admin Account" : "Admin Access"}
        </h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label className="text-xs tracking-widest uppercase text-muted-foreground">Email</Label>
            <Input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="bg-kova-surface border-kova-chrome/20 focus:border-kova-gold/50 text-foreground"
              required
            />
          </div>
          <div className="space-y-2">
            <Label className="text-xs tracking-widest uppercase text-muted-foreground">Password</Label>
            <Input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="bg-kova-surface border-kova-chrome/20 focus:border-kova-gold/50 text-foreground"
              required
            />
          </div>
          <Button type="submit" variant="gold" className="w-full" disabled={loading}>
            {loading ? (isSignUp ? "Creating..." : "Signing in...") : (isSignUp ? "Create Account" : "Sign In")}
          </Button>
          <button
            type="button"
            onClick={() => setIsSignUp(!isSignUp)}
            className="w-full text-xs text-muted-foreground hover:text-kova-gold transition-colors tracking-wider"
          >
            {isSignUp ? "Already have an account? Sign in" : "Need an account? Sign up"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default AdminLogin;
