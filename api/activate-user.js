import { supabase } from "../services/SupabaseClient";

export default async function handler(req, res) {
  // Enable CORS
  res.setHeader(
    "Access-Control-Allow-Origin",
    "https://phxunifischeduler.vercel.app"
  );
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS"); // Allow POST and OPTIONS methods
  res.setHeader("Access-Control-Allow-Headers", "Content-Type"); // Allow Content-Type header

  // Handle preflight OPTIONS request
  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  // Your existing code...
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { email, full_name, password, token } = req.body;

  try {
    const { data: authData, error: authError } =
      await supabase.auth.admin.createUser({
        email,
        password,
        email_confirm: true,
      });

    if (authError) {
      console.error("Auth Error:", authError.message);
      return res.status(400).json({ error: authError.message });
    }

    const userId = authData.user.id;

    const { error: profileError } = await supabase
      .from("profiles")
      .insert([{ id: userId, email, full_name }]);

    if (profileError) {
      console.error("Profile Insert Error:", profileError.message);
      return res.status(500).json({ error: profileError.message });
    }

    await supabase.from("pending").update({ used: true }).eq("token", token);

    return res.status(200).json({ message: "User created and profile saved" });
  } catch (err) {
    console.error("Unexpected error:", err);
    return res.status(500).json({ error: "Unexpected error occurred" });
  }
}
