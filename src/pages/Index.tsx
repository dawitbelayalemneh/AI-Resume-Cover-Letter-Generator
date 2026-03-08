import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Sparkles, FileText, Target, Zap } from "lucide-react";

const Index = () => {
  const navigate = useNavigate();
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) navigate("/dashboard");
      else setChecking(false);
    });
  }, [navigate]);

  if (checking) return null;

  return (
    <div className="min-h-screen bg-background">
      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-[var(--hero-gradient)] opacity-5" />
        <div className="max-w-5xl mx-auto px-4 py-24 text-center relative">
          <div className="inline-flex items-center gap-2 bg-primary/10 text-primary rounded-full px-4 py-1.5 text-sm font-medium mb-6">
            <Sparkles className="h-4 w-4" />
            AI-Powered Resume Tools
          </div>
          <h1 className="font-display text-5xl md:text-6xl font-bold text-foreground leading-tight">
            Land Your Dream Job<br />
            <span className="bg-clip-text text-transparent bg-[var(--hero-gradient)]">
              With AI Precision
            </span>
          </h1>
          <p className="text-lg text-muted-foreground mt-6 max-w-2xl mx-auto">
            Upload your resume, paste any job description, and let AI craft a perfectly tailored resume and cover letter in seconds.
          </p>
          <div className="flex gap-4 justify-center mt-8">
            <Button variant="hero" size="lg" onClick={() => navigate("/auth")}>
              Get Started Free
            </Button>
            <Button variant="outline" size="lg" onClick={() => navigate("/auth")}>
              Sign In
            </Button>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="max-w-5xl mx-auto px-4 py-20">
        <div className="grid md:grid-cols-3 gap-8">
          {[
            {
              icon: FileText,
              title: "Smart Resume Tailoring",
              desc: "AI analyzes the job description and restructures your resume to highlight the most relevant skills and experience.",
            },
            {
              icon: Target,
              title: "Custom Cover Letters",
              desc: "Generate compelling, personalized cover letters that speak directly to the role and company.",
            },
            {
              icon: Zap,
              title: "Instant Results",
              desc: "Get polished, professional outputs in seconds — no more hours spent on customization.",
            },
          ].map((f, i) => (
            <div
              key={i}
              className="bg-card rounded-xl p-6 shadow-[var(--card-shadow)] hover:shadow-[var(--card-shadow-hover)] transition-shadow"
            >
              <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                <f.icon className="h-6 w-6 text-primary" />
              </div>
              <h3 className="font-display text-lg font-semibold text-foreground mb-2">{f.title}</h3>
              <p className="text-muted-foreground text-sm leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};

export default Index;
