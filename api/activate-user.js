import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.VITE_SUPABASE_ANON_KEY
);

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { email, full_name, password, token } = req.body;

  try {
    // 1. Sign up user
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

    // 2. Add to profiles
    const { error: profileError } = await supabase
      .from("profiles")
      .insert([{ id: userId, email, full_name }]);

    if (profileError) {
      return res.status(500).json({ error: profileError.message });
    }

    // 3. Mark invite token as used
    await supabase.from("pending").update({ used: true }).eq("token", token);

    return res.status(200).json({ message: "User created and profile saved" });
  } catch (err) {
    console.error("Unexpected error:", err);
    return res.status(500).json({ error: "Unexpected error occurred" });
  }
}
