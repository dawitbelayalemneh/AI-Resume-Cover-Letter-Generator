import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { GeneratorForm } from "@/components/GeneratorForm";
import { GenerationResult } from "@/components/GenerationResult";
import { GenerationHistory } from "@/components/GenerationHistory";
import { ResumeAnalysis } from "@/components/ResumeAnalysis";
import { Button } from "@/components/ui/button";
import { LogOut, Sparkles } from "lucide-react";
import { toast } from "sonner";

const Dashboard = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState<any>(null);
  const [result, setResult] = useState<{ generated_resume: string; generated_cover_letter: string } | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);
  const [resumeText, setResumeText] = useState("");
  const [jobDescription, setJobDescription] = useState("");

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (!session) navigate("/auth");
      else setUser(session.user);
    });

    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) navigate("/auth");
      else setUser(session.user);
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    toast.success("Signed out");
    navigate("/auth");
  };

  const handleGenerated = (data: { generated_resume: string; generated_cover_letter: string }) => {
    setResult(data);
    setRefreshKey((k) => k + 1);
  };

  if (!user) return null;

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-card/80 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="h-6 w-6 text-primary" />
            <span className="font-display text-xl font-bold text-foreground">ResumeAI</span>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-sm text-muted-foreground hidden sm:inline">{user.email}</span>
            <Button variant="ghost" size="sm" onClick={handleSignOut}>
              <LogOut className="h-4 w-4" />
              Sign Out
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="font-display text-3xl font-bold text-foreground">Dashboard</h1>
          <p className="text-muted-foreground mt-1">
            Upload your resume and paste a job description to generate tailored content.
          </p>
        </div>

        <div className="grid lg:grid-cols-5 gap-8">
          <div className="lg:col-span-3 space-y-8">
            <div className="bg-card rounded-xl p-6 shadow-[var(--card-shadow)]">
              <GeneratorForm
                onGenerated={handleGenerated}
                resumeText={resumeText}
                onResumeTextChange={setResumeText}
                jobDescription={jobDescription}
                onJobDescriptionChange={setJobDescription}
              />
            </div>

            {/* Resume Analysis */}
            <div className="bg-card rounded-xl p-6 shadow-[var(--card-shadow)]">
              <ResumeAnalysis resumeText={resumeText} jobDescription={jobDescription} />
            </div>

            {result && (
              <GenerationResult
                generatedResume={result.generated_resume}
                generatedCoverLetter={result.generated_cover_letter}
              />
            )}
          </div>
          <div className="lg:col-span-2">
            <GenerationHistory onSelect={(gen) => {
              if (gen.generated_resume && gen.generated_cover_letter) {
                setResult({
                  generated_resume: gen.generated_resume,
                  generated_cover_letter: gen.generated_cover_letter,
                });
              }
            }} refreshKey={refreshKey} />
          </div>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
