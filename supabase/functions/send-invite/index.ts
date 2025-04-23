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
      subject: "Activate Your When 3 Work Account",
      html: `
  <!DOCTYPE html>
  <html lang="en">
  <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Activate Your Account</title>
      <style>
          body {
              font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
              background-color: #f4f4f4;
              color: #333;
              margin: 0;
              padding: 20px;
              display: flex;
              justify-content: center;
              align-items: center;
              min-height: 100vh;
          }
          .container {
              background-color: #fff;
              padding: 40px;
              border-radius: 8px;
              box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
              text-align: center;
              width: 90%;
              max-width: 600px;
          }
          .logo {
              max-width: 150px;
              margin-bottom: 20px;
          }
          h1 {
              color: #007bff;
              margin-top: 0;
              margin-bottom: 20px;
          }
          p {
              font-size: 16px;
              line-height: 1.6;
              margin-bottom: 20px;
          }
          .button {
              display: inline-block;
              padding: 12px 24px;
              background-color: #007bff;
              color: #fff;
              text-decoration: none;
              border-radius: 6px;
              font-weight: bold;
              transition: background-color 0.3s ease;
          }
          .button:hover {
              background-color: #0056b3;
          }
          .activation-link {
              font-size: 14px;
              color: #555;
              word-break: break-all;
          }
          .footer {
              margin-top: 30px;
              font-size: 12px;
              color: #777;
          }
      </style>
  </head>
  <body>
      <div class="container">
<img src="https://unifiservice.com/wp-content/uploads/2023/02/logo-multicolor-horizontal-02.png" alt="Your Logo" class="logo">
          <h1>You're Invited!</h1>
          <p>Hi ${name},</p>
          <p>Welcome to Unifi Scheduling! Please click the button below to activate your account:</p>
          <p><a href="https://phxunifischeduler.vercel.app/activate?token=${token}" class="button">Activate Account</a></p>
          <p class="activation-link">Or, you can copy and paste the following link into your browser:<br>
          <a href="https://phxunifischeduler.vercel.app/activate?token=${token}">https://phxunifischeduler.vercel.app/activate?token=${token}</a></p>
          <p class="footer">If you did not sign up for Unifi Scheduling, you can safely ignore this email.</p>
      </div>
  </body>
  </html>
  `,
      text: `Hi <span class="math-inline">\{name\},\\n\\nPlease click the following link to activate your account\:\\nhttps\://phxunifischeduler\.vercel\.app/activate?token\=</span>{token}\n\nOr copy and paste this link into your browser:\nhttps://phxunifischeduler.vercel.app/activate?token=${token}\n\nIf you did not sign up for Unifi Scheduling, you can safely ignore this email.\n\nThanks,\nThe Unifi Scheduling Team`,
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
