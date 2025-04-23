import { serve } from "https://deno.land/std/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js";

// Serve function
serve(async () => {
  const supabase = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
  );

  // Calculate date 30 days ago
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - 30);

  // Delete shifts older than 30 days
  const { error } = await supabase
    .from("shifts")
    .delete()
    .lt("end_time", cutoffDate.toISOString());

  if (error) {
    console.error("Failed to delete old shifts:", error.message);
    return new Response("Error deleting old shifts", { status: 500 });
  }

  return new Response("Old shifts deleted successfully", { status: 200 });
});
