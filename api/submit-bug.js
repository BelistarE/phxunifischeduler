const token = import.meta.env.VITE_GITHUB_TOKEN;

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method Not Allowed" });
  }

  const { title, body } = req.body;

  const githubRes = await fetch(
    "https://github.com/BelistarE/phxunifischeduler/issues",
    {
      method: "POST",
      headers: {
        Authorization: `token ${process.env.VITE_GITHUB_TOKEN}`,
        Accept: "application/vnd.github.v3+json",
      },
      body: JSON.stringify({ title, body }),
    }
  );

  const data = await githubRes.json();
  return res.status(githubRes.status).json(data);
}
