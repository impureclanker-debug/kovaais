import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
  const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

  const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

  try {
    const { business_name, city, state, industries, core_services, business_description, notes, logo_url } = await req.json();

    if (!business_name?.trim()) throw new Error("Business name is required");
    if (!industries?.length) throw new Error("At least one industry is required");

    // Insert lead
    const { data: lead, error: insertErr } = await supabase
      .from("business_leads")
      .insert({
        business_name: business_name.trim(),
        city: city || "Phoenix",
        state: state || "AZ",
        industries,
        core_services: core_services || null,
        business_description: business_description || null,
        notes: notes || null,
        logo_url: logo_url || null,
        status: "new",
      })
      .select()
      .single();

    if (insertErr) throw new Error("Failed to save lead: " + insertErr.message);

    // Trigger preview generation in the background
    const generateUrl = `${SUPABASE_URL}/functions/v1/generate-preview`;
    fetch(generateUrl, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ lead_id: lead.id }),
    }).catch((e) => console.error("Failed to trigger preview generation:", e));

    return new Response(
      JSON.stringify({ success: true, lead_id: lead.id }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (e) {
    console.error("submit-lead error:", e);
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
