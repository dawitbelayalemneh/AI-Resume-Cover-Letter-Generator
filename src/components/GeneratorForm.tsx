import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { FileText, Sparkles, Upload } from "lucide-react";

interface GenerationResult {
  generated_resume: string;
  generated_cover_letter: string;
}

export function GeneratorForm({ onGenerated }: { onGenerated: (result: GenerationResult) => void }) {
  const [jobDescription, setJobDescription] = useState("");
  const [resumeText, setResumeText] = useState("");
  const [resumeFile, setResumeFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setResumeFile(file);

    // Read text from file
    const text = await file.text();
    setResumeText(text);
    toast.success("Resume uploaded!");
  };

  const handleGenerate = async () => {
    if (!jobDescription.trim()) {
      toast.error("Please paste a job description");
      return;
    }
    if (!resumeText.trim()) {
      toast.error("Please upload or paste your resume");
      return;
    }

    setLoading(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error("Not authenticated");

      // Upload file if present
      let resumeFileUrl: string | null = null;
      if (resumeFile) {
        const filePath = `${session.user.id}/${Date.now()}_${resumeFile.name}`;
        const { error: uploadError } = await supabase.storage
          .from("resumes")
          .upload(filePath, resumeFile);
        if (uploadError) console.error("File upload error:", uploadError);
        else resumeFileUrl = filePath;
      }

      const { data, error } = await supabase.functions.invoke("generate-resume", {
        body: { jobDescription, resumeText },
      });

      if (error) throw error;

      // Save generation to DB
      await supabase.from("generations").insert({
        user_id: session.user.id,
        job_description: jobDescription,
        resume_text: resumeText,
        resume_file_url: resumeFileUrl,
        generated_resume: data.generated_resume,
        generated_cover_letter: data.generated_cover_letter,
      });

      onGenerated(data);
      toast.success("Generation complete!");
    } catch (error: any) {
      toast.error(error.message || "Generation failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="space-y-3">
        <Label className="text-base font-semibold flex items-center gap-2">
          <Upload className="h-4 w-4 text-primary" />
          Your Resume
        </Label>
        <div className="flex gap-3">
          <label className="flex-1 cursor-pointer">
            <div className="border-2 border-dashed border-border rounded-xl p-6 text-center hover:border-primary/50 transition-colors">
              <FileText className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
              <p className="text-sm text-muted-foreground">
                {resumeFile ? resumeFile.name : "Click to upload (.txt, .md)"}
              </p>
            </div>
            <input type="file" className="hidden" accept=".txt,.md,.text" onChange={handleFileUpload} />
          </label>
        </div>
        <Textarea
          placeholder="Or paste your resume text here..."
          value={resumeText}
          onChange={(e) => setResumeText(e.target.value)}
          className="min-h-[150px] resize-none"
        />
      </div>

      <div className="space-y-3">
        <Label className="text-base font-semibold flex items-center gap-2">
          <FileText className="h-4 w-4 text-accent" />
          Job Description
        </Label>
        <Textarea
          placeholder="Paste the job description here..."
          value={jobDescription}
          onChange={(e) => setJobDescription(e.target.value)}
          className="min-h-[150px] resize-none"
        />
      </div>

      <Button
        variant="hero"
        size="lg"
        className="w-full"
        onClick={handleGenerate}
        disabled={loading}
      >
        <Sparkles className="h-5 w-5" />
        {loading ? "Generating..." : "Generate Resume & Cover Letter"}
      </Button>
    </div>
  );
}
