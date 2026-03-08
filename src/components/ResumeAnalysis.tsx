import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import {
  Search,
  ThumbsUp,
  AlertTriangle,
  Lightbulb,
  Target,
  Loader2,
  Key,
  Wrench,
  ArrowRightLeft,
} from "lucide-react";

interface PhrasingImprovement {
  original: string;
  improved: string;
  reason: string;
}

interface AnalysisData {
  overall_score: number;
  strengths: string[];
  weaknesses: string[];
  suggestions: string[];
  alignment_score?: number;
  alignment_notes?: string[];
  keywords_to_add?: string[];
  missing_skills?: string[];
  phrasing_improvements?: PhrasingImprovement[];
}

function ScoreBadge({ score, label }: { score: number; label: string }) {
  const color =
    score >= 75
      ? "text-emerald-600 bg-emerald-50 border-emerald-200"
      : score >= 50
        ? "text-amber-600 bg-amber-50 border-amber-200"
        : "text-red-600 bg-red-50 border-red-200";

  return (
    <div className={`inline-flex items-center gap-2 rounded-lg border px-4 py-2 ${color}`}>
      <span className="text-2xl font-display font-bold">{score}</span>
      <span className="text-xs font-medium">/100<br />{label}</span>
    </div>
  );
}

function Section({
  icon: Icon,
  title,
  items,
  variant,
}: {
  icon: React.ElementType;
  title: string;
  items: string[];
  variant: "strength" | "weakness" | "suggestion" | "alignment";
}) {
  const styles = {
    strength: "border-emerald-200 bg-emerald-50/50",
    weakness: "border-amber-200 bg-amber-50/50",
    suggestion: "border-primary/20 bg-primary/5",
    alignment: "border-accent/20 bg-accent/5",
  };

  const iconColors = {
    strength: "text-emerald-600",
    weakness: "text-amber-600",
    suggestion: "text-primary",
    alignment: "text-accent",
  };

  const dotColors = {
    strength: "bg-emerald-500",
    weakness: "bg-amber-500",
    suggestion: "bg-primary",
    alignment: "bg-accent",
  };

  return (
    <div className={`rounded-xl border p-5 ${styles[variant]}`}>
      <h4 className="font-display font-semibold text-foreground flex items-center gap-2 mb-3">
        <Icon className={`h-5 w-5 ${iconColors[variant]}`} />
        {title}
      </h4>
      <ul className="space-y-2">
        {items.map((item, i) => (
          <li key={i} className="flex items-start gap-2.5 text-sm text-foreground/80">
            <span className={`mt-1.5 h-2 w-2 rounded-full flex-shrink-0 ${dotColors[variant]}`} />
            {item}
          </li>
        ))}
      </ul>
    </div>
  );
}

export function ResumeAnalysis({
  resumeText,
  jobDescription,
}: {
  resumeText: string;
  jobDescription: string;
}) {
  const [analysis, setAnalysis] = useState<AnalysisData | null>(null);
  const [loading, setLoading] = useState(false);

  const handleAnalyze = async () => {
    if (!resumeText.trim()) {
      toast.error("Please upload or paste your resume first");
      return;
    }

    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("analyze-resume", {
        body: { resumeText, jobDescription },
      });

      if (error) throw error;
      setAnalysis(data);
      toast.success("Analysis complete!");
    } catch (error: any) {
      toast.error(error.message || "Analysis failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-5">
      <Button
        variant="outline"
        size="lg"
        className="w-full border-primary/30 hover:border-primary/60"
        onClick={handleAnalyze}
        disabled={loading || !resumeText.trim()}
      >
        {loading ? (
          <Loader2 className="h-5 w-5 animate-spin" />
        ) : (
          <Search className="h-5 w-5" />
        )}
        {loading ? "Analyzing..." : "Analyze My Resume"}
      </Button>

      {analysis && (
        <div className="space-y-4 animate-in fade-in-0 slide-in-from-bottom-4 duration-500">
          <div className="flex flex-wrap gap-3">
            <ScoreBadge score={analysis.overall_score} label="Overall" />
            {analysis.alignment_score != null && (
              <ScoreBadge score={analysis.alignment_score} label="Job Fit" />
            )}
          </div>

          <Section
            icon={ThumbsUp}
            title="Strengths"
            items={analysis.strengths}
            variant="strength"
          />
          <Section
            icon={AlertTriangle}
            title="Weaknesses & Missing Skills"
            items={analysis.weaknesses}
            variant="weakness"
          />
          <Section
            icon={Lightbulb}
            title="Suggestions"
            items={analysis.suggestions}
            variant="suggestion"
          />
          {analysis.alignment_notes && analysis.alignment_notes.length > 0 && (
            <Section
              icon={Target}
              title="Job Alignment"
              items={analysis.alignment_notes}
              variant="alignment"
            />
          )}
        </div>
      )}
    </div>
  );
}
