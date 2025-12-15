// deno-lint-ignore-file no-explicit-any
import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = (origin: string | null) => ({
  "Access-Control-Allow-Origin": origin || "*",
  "Access-Control-Allow-Headers": "authorization, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  Vary: "Origin",
});

serve(async (req) => {
  const origin = req.headers.get("origin");

  // Preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 204, headers: corsHeaders(origin) });
  }

  if (req.method !== "POST") {
    return new Response("Method not allowed", {
      status: 405,
      headers: corsHeaders(origin),
    });
  }

  const token = req.headers.get("authorization")?.replace("Bearer ", "");
  if (!token) {
    return new Response("Missing token", {
      status: 401,
      headers: corsHeaders(origin),
    });
  }

  const supabaseUrl = Deno.env.get("SUPABASE_URL");
  const anonKey = Deno.env.get("SUPABASE_ANON_KEY");
  const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

  if (!supabaseUrl || !anonKey || !serviceKey) {
    return new Response("Server missing Supabase env vars", {
      status: 500,
      headers: corsHeaders(origin),
    });
  }

  const anon = createClient(supabaseUrl, anonKey);
  const { data: userData, error: userErr } = await anon.auth.getUser(token);
  if (userErr || !userData?.user) {
    return new Response("Invalid token", {
      status: 401,
      headers: corsHeaders(origin),
    });
  }

  const userId = userData.user.id;
  const service = createClient(supabaseUrl, serviceKey);

  // Clean up related data first
  // Adjust table names/relations as needed
  await service.from("profiles").delete().eq("id", userId);

  const { error: deleteErr } = await service.auth.admin.deleteUser(userId);
  if (deleteErr) {
    return new Response(deleteErr.message, {
      status: 400,
      headers: corsHeaders(origin),
    });
  }

  return new Response(null, { status: 204, headers: corsHeaders(origin) });
});
