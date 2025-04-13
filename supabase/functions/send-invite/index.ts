// Follow this setup guide to integrate the Deno language server with your editor:
// https://deno.land/manual/getting_started/setup_your_environment
// This enables autocomplete, go to definition, etc.

// Setup type definitions for built-in Supabase Runtime APIs
// /supabase/functions/send-invite/index.ts
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { Resend } from "npm:resend";
import { createClient } from "https://esm.sh/@supabase/supabase-js";

serve(async (req: Request) => {
  const authHeader = req.headers.get("Authorization");

  // Handle preflight requests (OPTIONS method)
  if (req.method === "OPTIONS") {
    return new Response("ok", {
      status: 200,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "POST, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type, Authorization",
      },
    });
  }

  if (
    !authHeader ||
    authHeader !== `Bearer ${Deno.env.get("VITE_SUPABASE_ANON_KEY")}`
  ) {
    return new Response("Unauthorized", {
      status: 401,
      headers: { "Access-Control-Allow-Origin": "*" },
    });
  }

  try {
    const { name, email, token } = await req.json();

    const resend = new Resend(Deno.env.get("RESEND_API_KEY"));
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SERVICE_ROLE_KEY")!
    );

    // Insert into the "pending" table
    const { error } = await supabase
      .from("pending")
      .insert({ name, email, token });

    if (error) {
      console.error("Supabase Insert Error:", error);
      return new Response(JSON.stringify({ error }), {
        status: 500,
        headers: { "Access-Control-Allow-Origin": "*" },
      });
    }

    // Send email using Resend
    const emailResult = await resend.emails.send({
      from: "Unifi Scheduling <noreply@cs-memory.online>",

      to: email,
      subject: "You're Invited!",
      html: `<p>Hi ${name},</p><p>Click <a href="https://phxunifischeduler.vercel.app/activate?token=${token}">here</a> to activate your account.</p>`,
    });

    if (emailResult.error) {
      console.error("Resend Email Error:", emailResult.error);
      return new Response(JSON.stringify({ error: emailResult.error }), {
        status: 500,
        headers: { "Access-Control-Allow-Origin": "*" },
      });
    }

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { "Access-Control-Allow-Origin": "*" },
    });
  } catch (err) {
    console.error("Unexpected Error:", err);
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { "Access-Control-Allow-Origin": "*" },
    });
  }
});
/* To invoke locally:

  1. Run `supabase start` (see: https://supabase.com/docs/reference/cli/supabase-start)
  2. Make an HTTP request:

  curl -i --location --request POST 'http://127.0.0.1:54321/functions/v1/send-invite' \
    --header 'Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0' \
    --header 'Content-Type: application/json' \
    --data '{"name":"Functions"}'

*/
