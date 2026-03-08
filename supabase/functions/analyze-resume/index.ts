import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { resumeText, jobDescription } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    const systemPrompt = `You are an expert career coach and resume reviewer. Analyze the provided resume against the job description and return structured feedback.

Return your analysis using the provided tool.`;

    const userContent = jobDescription
      ? `## Resume:\n${resumeText}\n\n## Job Description:\n${jobDescription}`
      : `## Resume:\n${resumeText}`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userContent },
        ],
        tools: [
          {
            type: "function",
            function: {
              name: "resume_analysis",
              description: "Return structured resume analysis",
              parameters: {
                type: "object",
                properties: {
                  overall_score: { type: "number", description: "Score from 1-100" },
                  strengths: {
                    type: "array",
                    items: { type: "string" },
                    description: "List of resume strengths (3-5 items)",
                  },
                  weaknesses: {
                    type: "array",
                    items: { type: "string" },
                    description: "List of weaknesses or missing skills (3-5 items)",
                  },
                  suggestions: {
                    type: "array",
                    items: { type: "string" },
                    description: "Actionable improvement suggestions (3-5 items)",
                  },
                  alignment_score: { type: "number", description: "Job alignment score 1-100 (only if job description provided)" },
                  alignment_notes: {
                    type: "array",
                    items: { type: "string" },
                    description: "Notes on how the resume aligns with the job description (2-4 items)",
                  },
                },
                required: ["overall_score", "strengths", "weaknesses", "suggestions"],
                additionalProperties: false,
              },
            },
          },
        ],
        tool_choice: { type: "function", function: { name: "resume_analysis" } },
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limit exceeded, please try again later." }), {
          status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "AI credits exhausted. Please add credits." }), {
          status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const errText = await response.text();
      console.error("AI gateway error:", response.status, errText);
      throw new Error("AI analysis failed");
    }

    const aiData = await response.json();
    const toolCall = aiData.choices?.[0]?.message?.tool_calls?.[0];

    if (!toolCall) throw new Error("No analysis returned from AI");

    const result = JSON.parse(toolCall.function.arguments);
    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("analyze-resume error:", e);
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
