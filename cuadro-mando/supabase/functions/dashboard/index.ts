import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "jsr:@supabase/supabase-js@2";

const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const supabase = createClient(supabaseUrl, serviceRoleKey);

Deno.serve(async (_req: Request) => {
  const { data, error } = await supabase
    .from("app_files")
    .select("content")
    .eq("name", "dashboard")
    .single();

  if (error || !data) {
    return new Response("Dashboard not found: " + (error?.message ?? "no data in app_files"), {
      status: 500,
      headers: { "Content-Type": "text/plain; charset=utf-8" },
    });
  }

  return new Response(data.content, {
    headers: { "Content-Type": "text/html; charset=utf-8" },
  });
});
