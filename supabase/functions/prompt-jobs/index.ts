import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

function createJobId() {
  const stamp = new Date().toISOString().slice(0, 10).replaceAll("-", "");
  const suffix = crypto.randomUUID().slice(0, 8).toUpperCase();
  return `PJ-${stamp}-${suffix}`;
}

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? "",
      { global: { headers: { Authorization: req.headers.get("Authorization")! } } }
    );

    const { data: { user }, error: authError } = await supabaseClient.auth.getUser();
    if (authError || !user) return json({ error: "Unauthorized" }, 401);

    const { data: profile } = await supabaseClient
      .from("profiles")
      .select("membership_status")
      .eq("id", user.id)
      .maybeSingle();

    const role = profile?.membership_status ?? "member";
    if (!["operator", "admin"].includes(role)) return json({ error: "Forbidden" }, 403);

    if (req.method === "GET") {
      const url = new URL(req.url);
      const status = url.searchParams.get("status");
      const targetAgent = url.searchParams.get("target_agent");
      const limit = Math.min(parseInt(url.searchParams.get("limit") || "50", 10) || 50, 200);
      const id = url.searchParams.get("id");

      let query = supabaseClient
        .from("prompt_jobs")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(limit);

      if (id) query = query.eq("id", id);
      if (status) query = query.eq("status", status);
      if (targetAgent) query = query.eq("target_agent", targetAgent);

      const { data, error } = await query;
      if (error) throw error;
      if (id) return json({ item: (data && data[0]) || null });
      return json({ items: data || [] });
    }

    if (req.method === "POST") {
      const body = await req.json();
      const action = body.action || "create";

      if (action === "create") {
        if (!body.target_agent || !body.prompt) return json({ error: "target_agent and prompt required" }, 400);
        const payload = {
          id: createJobId(),
          target_agent: body.target_agent,
          prompt: body.prompt,
          status: "pending",
          source_client: body.source_client || "website-operator",
          priority: body.priority || "normal",
        };
        const { data, error } = await supabaseClient.from("prompt_jobs").insert(payload).select("*").single();
        if (error) throw error;
        return json({ item: data });
      }

      if (!body.id) return json({ error: "id required" }, 400);

      let patch: Record<string, unknown> = {};
      if (action === "claim") {
        patch = {
          status: "claimed",
          claimed_by: body.claimed_by || "website-operator",
          claimed_at: new Date().toISOString(),
        };
      } else if (action === "complete") {
        patch = {
          status: "completed",
          claimed_by: body.claimed_by || "website-operator",
          claimed_at: body.claimed_at || new Date().toISOString(),
          result_summary: body.result_summary || null,
          result_artifact: body.result_artifact || null,
          error: null,
          completed_at: new Date().toISOString(),
        };
      } else if (action === "fail") {
        patch = {
          status: "failed",
          claimed_by: body.claimed_by || "website-operator",
          claimed_at: body.claimed_at || new Date().toISOString(),
          result_summary: body.result_summary || null,
          error: body.error || "Unknown error",
          completed_at: new Date().toISOString(),
        };
      } else if (action === "cancel") {
        patch = {
          status: "cancelled",
          completed_at: new Date().toISOString(),
        };
      } else {
        return json({ error: "Unknown action" }, 400);
      }

      const { data, error } = await supabaseClient
        .from("prompt_jobs")
        .update(patch)
        .eq("id", body.id)
        .select("*")
        .single();

      if (error) throw error;
      return json({ item: data });
    }

    return json({ error: "Method not allowed" }, 405);
  } catch (err) {
    return json({ error: err instanceof Error ? err.message : String(err) }, 500);
  }
});
