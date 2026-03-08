import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { PDFDocument } from "https://cdn.skypack.dev/pdf-lib@1.17.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const formData = await req.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return new Response(JSON.stringify({ error: "No file provided" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const fileName = file.name.toLowerCase();
    let extractedText = "";

    if (fileName.endsWith(".pdf")) {
      // For PDF files, use Lovable AI to extract text from the raw content
      const arrayBuffer = await file.arrayBuffer();
      const bytes = new Uint8Array(arrayBuffer);
      
      // Try to extract text from PDF using pdf-lib
      try {
        const pdfDoc = await PDFDocument.load(bytes);
        const pages = pdfDoc.getPages();
        
        // pdf-lib doesn't have built-in text extraction, so we'll use 
        // a simpler approach: convert to base64 and use AI to extract
        const base64 = btoa(String.fromCharCode(...bytes));
        
        const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
        if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY not configured");

        const aiResponse = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${LOVABLE_API_KEY}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            model: "google/gemini-3-flash-preview",
            messages: [
              {
                role: "system",
                content: "You are a document text extractor. Extract ALL text content from the provided PDF document. Return ONLY the extracted text, preserving the structure and formatting as much as possible. Do not add any commentary or explanations.",
              },
              {
                role: "user",
                content: [
                  {
                    type: "text",
                    text: "Extract all text from this PDF resume document:",
                  },
                  {
                    type: "image_url",
                    image_url: {
                      url: `data:application/pdf;base64,${base64}`,
                    },
                  },
                ],
              },
            ],
          }),
        });

        if (!aiResponse.ok) {
          const errText = await aiResponse.text();
          console.error("AI extraction error:", aiResponse.status, errText);
          throw new Error("AI text extraction failed");
        }

        const aiData = await aiResponse.json();
        extractedText = aiData.choices?.[0]?.message?.content || "";
      } catch (pdfError) {
        console.error("PDF processing error:", pdfError);
        // Fallback: try reading as raw text
        const decoder = new TextDecoder("utf-8", { fatal: false });
        extractedText = decoder.decode(bytes);
        // Clean up binary artifacts
        extractedText = extractedText.replace(/[^\x20-\x7E\n\r\t]/g, " ").replace(/\s{3,}/g, "\n");
      }
    } else {
      // Text-based files (.txt, .md, etc.)
      extractedText = await file.text();
    }

    if (!extractedText.trim()) {
      return new Response(JSON.stringify({ error: "Could not extract text from the file" }), {
        status: 422,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify({ text: extractedText.trim() }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("extract-resume error:", e);
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
