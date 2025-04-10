export default async function handler(req, res) {
  if (req.method === "POST") {
    const { title, body } = req.body;

    const GITHUB_API_URL =
      "https://api.github.com/repos/BelistarE/phxunifischeduler/issues";
    const GITHUB_TOKEN = process.env.VITE_GITHUB_TOKEN; //

    try {
      const response = await fetch(GITHUB_API_URL, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${GITHUB_TOKEN}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ title, body }),
      });

      if (!response.ok) {
        const error = await response.json();
        console.error("GitHub API Error:", error);
        return res.status(response.status).json({ error: error.message });
      }

      const data = await response.json();
      res
        .status(200)
        .json({ message: "Bug submitted successfully!", issue: data });
    } catch (err) {
      console.error("Error creating GitHub issue:", err);
      res.status(500).json({ error: "Failed to create GitHub issue" });
    }
  } else {
    res.status(405).json({ error: "Method not allowed" });
  }
}
