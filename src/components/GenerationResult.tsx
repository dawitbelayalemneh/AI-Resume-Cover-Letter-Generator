import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Copy, Check, FileText, Mail, Pencil, Eye, Download } from "lucide-react";
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

function formatTextToHtml(text: string): string {
  const lines = text.split("\n");
  let html = "";

  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed) {
      html += "<br/>";
    } else if (trimmed.startsWith("# ")) {
      html += `<h1 style="font-size:22px;font-weight:700;margin:18px 0 8px;color:#1a1a2e;">${trimmed.slice(2)}</h1>`;
    } else if (trimmed.startsWith("## ")) {
      html += `<h2 style="font-size:17px;font-weight:600;margin:16px 0 6px;color:#1a1a2e;border-bottom:1px solid #e0e0e0;padding-bottom:4px;">${trimmed.slice(3)}</h2>`;
    } else if (trimmed.startsWith("### ")) {
      html += `<h3 style="font-size:15px;font-weight:600;margin:12px 0 4px;color:#333;">${trimmed.slice(4)}</h3>`;
    } else if (trimmed.startsWith("- ") || trimmed.startsWith("• ")) {
      html += `<p style="margin:3px 0 3px 20px;font-size:13px;line-height:1.6;color:#333;">• ${trimmed.slice(2)}</p>`;
    } else if (/^\*\*(.+?)\*\*(.*)/.test(trimmed)) {
      const match = trimmed.match(/^\*\*(.+?)\*\*(.*)/);
      html += `<p style="margin:4px 0;font-size:13px;line-height:1.6;color:#333;"><strong>${match![1]}</strong>${match![2]}</p>`;
    } else {
      html += `<p style="margin:4px 0;font-size:13px;line-height:1.6;color:#333;">${trimmed}</p>`;
    }
  }

  return html;
}

export function GenerationResult({ generatedResume, generatedCoverLetter }: Props) {
  const [activeTab, setActiveTab] = useState<"resume" | "cover">("resume");
  const [editing, setEditing] = useState(false);
  const [editedResume, setEditedResume] = useState(generatedResume);
  const [editedCoverLetter, setEditedCoverLetter] = useState(generatedCoverLetter);
  const [exporting, setExporting] = useState(false);
  const printRef = useRef<HTMLDivElement>(null);

  const [prevResume, setPrevResume] = useState(generatedResume);
  const [prevCover, setPrevCover] = useState(generatedCoverLetter);
  if (generatedResume !== prevResume) {
    setEditedResume(generatedResume);
    setPrevResume(generatedResume);
    setEditing(false);
  }
  if (generatedCoverLetter !== prevCover) {
    setEditedCoverLetter(generatedCoverLetter);
    setPrevCover(generatedCoverLetter);
    setEditing(false);
  }

  const currentText = activeTab === "resume" ? editedResume : editedCoverLetter;
  const setCurrentText = activeTab === "resume" ? setEditedResume : setEditedCoverLetter;
  const docLabel = activeTab === "resume" ? "Resume" : "Cover_Letter";

  const handleDownloadPdf = async () => {
    setExporting(true);
    try {
      const html2pdf = (await import("html2pdf.js")).default;

      const container = document.createElement("div");
      container.innerHTML = `
        <div style="font-family:'DM Sans',Helvetica,Arial,sans-serif;padding:48px 56px;max-width:700px;margin:0 auto;color:#1a1a2e;">
          ${formatTextToHtml(currentText)}
        </div>
      `;

      await html2pdf()
        .set({
          margin: 0,
          filename: `${docLabel}_${new Date().toISOString().slice(0, 10)}.pdf`,
          image: { type: "jpeg", quality: 0.98 },
          html2canvas: { scale: 2, useCORS: true },
          jsPDF: { unit: "in", format: "letter", orientation: "portrait" },
        })
        .from(container)
        .save();

      toast.success("PDF downloaded!");
    } catch (err) {
      console.error("PDF export error:", err);
      toast.error("Failed to export PDF");
    } finally {
      setExporting(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-2">
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
        <div className="flex gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setEditing(!editing)}
          >
            {editing ? <Eye className="h-4 w-4" /> : <Pencil className="h-4 w-4" />}
            {editing ? "Preview" : "Edit"}
          </Button>
          <CopyButton text={currentText} />
          <Button
            variant="outline"
            size="sm"
            onClick={handleDownloadPdf}
            disabled={exporting}
          >
            <Download className="h-4 w-4" />
            {exporting ? "Exporting..." : "PDF"}
          </Button>
        </div>
      </div>

      <div ref={printRef} className="bg-card rounded-xl p-6 shadow-[var(--card-shadow)]">
        {editing ? (
          <Textarea
            value={currentText}
            onChange={(e) => setCurrentText(e.target.value)}
            className="min-h-[400px] resize-y font-mono text-sm"
          />
        ) : (
          <div className="prose prose-sm max-w-none whitespace-pre-wrap text-foreground">
            {currentText}
          </div>
        )}
      </div>
    </div>
  );
}
