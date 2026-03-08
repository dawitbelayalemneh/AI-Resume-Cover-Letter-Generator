import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Copy, Check, FileText, Mail } from "lucide-react";
import { toast } from "sonner";

interface Props {
  generatedResume: string;
  generatedCoverLetter: string;
}

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    toast.success("Copied to clipboard!");
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Button variant="outline" size="sm" onClick={handleCopy}>
      {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
      {copied ? "Copied" : "Copy"}
    </Button>
  );
}

export function GenerationResult({ generatedResume, generatedCoverLetter }: Props) {
  const [activeTab, setActiveTab] = useState<"resume" | "cover">("resume");

  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        <Button
          variant={activeTab === "resume" ? "default" : "outline"}
          size="sm"
          onClick={() => setActiveTab("resume")}
        >
          <FileText className="h-4 w-4" />
          Resume
        </Button>
        <Button
          variant={activeTab === "cover" ? "default" : "outline"}
          size="sm"
          onClick={() => setActiveTab("cover")}
        >
          <Mail className="h-4 w-4" />
          Cover Letter
        </Button>
      </div>

      <div className="bg-card rounded-xl p-6 shadow-[var(--card-shadow)] relative">
        <div className="absolute top-4 right-4">
          <CopyButton text={activeTab === "resume" ? generatedResume : generatedCoverLetter} />
        </div>
        <div className="prose prose-sm max-w-none whitespace-pre-wrap text-foreground pr-24">
          {activeTab === "resume" ? generatedResume : generatedCoverLetter}
        </div>
      </div>
    </div>
  );
}
