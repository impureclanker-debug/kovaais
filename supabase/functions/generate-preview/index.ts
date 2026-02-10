import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
  const PERPLEXITY_API_KEY = Deno.env.get("PERPLEXITY_API_KEY");
  const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
  const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

  if (!LOVABLE_API_KEY) {
    return new Response(JSON.stringify({ error: "LOVABLE_API_KEY not configured" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
  if (!PERPLEXITY_API_KEY) {
    return new Response(JSON.stringify({ error: "PERPLEXITY_API_KEY not configured" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

  try {
    const { lead_id } = await req.json();
    if (!lead_id) throw new Error("lead_id is required");

    // Fetch lead data
    const { data: lead, error: leadErr } = await supabase
      .from("business_leads")
      .select("*")
      .eq("id", lead_id)
      .single();
    if (leadErr || !lead) throw new Error("Lead not found");

    // Create preview record in "generating" state
    const { data: preview, error: prevErr } = await supabase
      .from("generated_previews")
      .insert({ lead_id, status: "generating" })
      .select()
      .single();
    if (prevErr) throw new Error("Failed to create preview record: " + prevErr.message);

    const businessContext = `
Business: ${lead.business_name}
Location: ${lead.city}, ${lead.state}
Industries: ${(lead.industries || []).join(", ")}
Services: ${lead.core_services || "Not specified"}
Description: ${lead.business_description || "Not provided"}
Notes: ${lead.notes || "None"}
    `.trim();

    // Step 1: Perplexity research on the business's industry and local market
    let perplexityResearch = "";
    try {
      const perpResp = await fetch("https://api.perplexity.ai/chat/completions", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${PERPLEXITY_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "sonar",
          messages: [
            {
              role: "system",
              content: "You are a business research analyst. Provide concise market insights, competitor landscape, and positioning opportunities. Keep it under 500 words.",
            },
            {
              role: "user",
              content: `Research the following local business and its market:\n\n${businessContext}\n\nProvide:\n1. Key market trends in their industry in ${lead.city}, ${lead.state}\n2. What top competitors are doing online\n3. Unique positioning opportunities\n4. Key messaging angles that would resonate with their target audience`,
            },
          ],
        }),
      });
      if (perpResp.ok) {
        const perpData = await perpResp.json();
        perplexityResearch = perpData.choices?.[0]?.message?.content || "";
      }
    } catch (e) {
      console.error("Perplexity research failed:", e);
      perplexityResearch = "Research unavailable - proceeding with AI generation.";
    }

    // Step 2: Use Lovable AI (Gemini) for brand positioning, page structure, copy direction
    const aiResp = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
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
            content: `You are a premium web design strategist for Kova Solutions. You create high-end website concept previews for local businesses. Your output should feel like a $10,000+ agency proposal.

RULES:
- Do NOT write full website copy. Write DIRECTION and CONCEPTS only.
- Every suggestion should feel premium, custom, and impossible to replicate with a template.
- Think about what makes THIS specific business unique.
- Reference the market research provided.

Return a JSON object (no markdown fences) with these exact keys:
{
  "brand_positioning": "2-3 sentence brand positioning statement",
  "copy_direction": "Brief direction for tone, voice, messaging strategy",
  "hero_headline": "A powerful, concise headline (max 8 words)",
  "hero_subheadline": "Supporting subheadline (max 20 words)",
  "page_structure": [
    {"section": "Section Name", "purpose": "What this section achieves", "concept": "Visual/content concept"}
  ],
  "feature_sections": [
    {"title": "Section Title", "description": "What this section previews", "locked": true/false}
  ],
  "ai_notes": "Internal notes for Kova team about implementation opportunities, upsell angles, system recommendations"
}`,
          },
          {
            role: "user",
            content: `Create a premium website concept preview for this business:\n\n${businessContext}\n\nMarket Research:\n${perplexityResearch}`,
          },
        ],
        tools: [
          {
            type: "function",
            function: {
              name: "generate_preview_concept",
              description: "Generate the structured website preview concept",
              parameters: {
                type: "object",
                properties: {
                  brand_positioning: { type: "string" },
                  copy_direction: { type: "string" },
                  hero_headline: { type: "string" },
                  hero_subheadline: { type: "string" },
                  page_structure: {
                    type: "array",
                    items: {
                      type: "object",
                      properties: {
                        section: { type: "string" },
                        purpose: { type: "string" },
                        concept: { type: "string" },
                      },
                      required: ["section", "purpose", "concept"],
                    },
                  },
                  feature_sections: {
                    type: "array",
                    items: {
                      type: "object",
                      properties: {
                        title: { type: "string" },
                        description: { type: "string" },
                        locked: { type: "boolean" },
                      },
                      required: ["title", "description", "locked"],
                    },
                  },
                  ai_notes: { type: "string" },
                },
                required: [
                  "brand_positioning",
                  "copy_direction",
                  "hero_headline",
                  "hero_subheadline",
                  "page_structure",
                  "feature_sections",
                  "ai_notes",
                ],
                additionalProperties: false,
              },
            },
          },
        ],
        tool_choice: { type: "function", function: { name: "generate_preview_concept" } },
      }),
    });

    if (!aiResp.ok) {
      const errText = await aiResp.text();
      console.error("AI gateway error:", aiResp.status, errText);
      
      await supabase.from("generated_previews").update({ status: "failed" }).eq("id", preview.id);
      
      const status = aiResp.status;
      if (status === 429) {
        return new Response(JSON.stringify({ error: "Rate limited. Please try again shortly." }), {
          status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (status === 402) {
        return new Response(JSON.stringify({ error: "AI credits exhausted. Please add funds." }), {
          status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      throw new Error("AI generation failed");
    }

    const aiData = await aiResp.json();
    let concept: any;
    
    // Extract from tool call
    const toolCall = aiData.choices?.[0]?.message?.tool_calls?.[0];
    if (toolCall?.function?.arguments) {
      concept = JSON.parse(toolCall.function.arguments);
    } else {
      // Fallback: try parsing content directly
      const content = aiData.choices?.[0]?.message?.content || "{}";
      concept = JSON.parse(content.replace(/```json?\n?/g, "").replace(/```/g, ""));
    }

    // Step 3: Generate hero image with Gemini image model
    let heroImageUrl = "";
    try {
      const imgResp = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${LOVABLE_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "google/gemini-2.5-flash-image",
          messages: [
            {
              role: "user",
              content: `Generate a premium hero website background image for a ${(lead.industries || []).join("/")} business called "${lead.business_name}" in ${lead.city}, ${lead.state}. Style: Abstract macro photography of architectural brushed steel and warm brass accents with elements relating to their industry. Soft cinematic studio lighting, shallow depth of field, elegant metallic curves, minimalist composition. High-end corporate luxury aesthetic. 16:9 aspect ratio. Ultra high resolution.`,
            },
          ],
          modalities: ["image", "text"],
        }),
      });

      if (imgResp.ok) {
        const imgData = await imgResp.json();
        const base64Image = imgData.choices?.[0]?.message?.images?.[0]?.image_url?.url;
        
        if (base64Image) {
          // Upload to Supabase storage
          const base64Data = base64Image.replace(/^data:image\/\w+;base64,/, "");
          const imageBytes = Uint8Array.from(atob(base64Data), (c) => c.charCodeAt(0));
          const fileName = `previews/${preview.id}/hero.png`;

          // Ensure previews bucket exists
          await supabase.storage.createBucket("previews", { public: true }).catch(() => {});

          const { error: uploadErr } = await supabase.storage
            .from("previews")
            .upload(fileName, imageBytes, { contentType: "image/png", upsert: true });

          if (!uploadErr) {
            const { data: urlData } = supabase.storage.from("previews").getPublicUrl(fileName);
            heroImageUrl = urlData.publicUrl;
          }
        }
      }
    } catch (e) {
      console.error("Image generation failed:", e);
    }

    // Update preview record with generated content
    const { error: updateErr } = await supabase
      .from("generated_previews")
      .update({
        brand_positioning: concept.brand_positioning,
        page_structure: concept.page_structure,
        copy_direction: concept.copy_direction,
        hero_headline: concept.hero_headline,
        hero_subheadline: concept.hero_subheadline,
        feature_sections: concept.feature_sections,
        hero_image_url: heroImageUrl,
        ai_notes: concept.ai_notes,
        perplexity_research: perplexityResearch,
        status: "ready",
      })
      .eq("id", preview.id);

    if (updateErr) throw new Error("Failed to update preview: " + updateErr.message);

    // Update lead status
    await supabase
      .from("business_leads")
      .update({ status: "preview_sent" })
      .eq("id", lead_id);

    return new Response(
      JSON.stringify({ success: true, preview_id: preview.id }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (e) {
    console.error("generate-preview error:", e);
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
