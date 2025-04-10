export default async function handler(req, res) {
  if (req.method === "POST") {
    const { title, body } = req.body;

    // Example: Log the bug report
    console.log("Bug Report Submitted:", { title, body });

    // Respond with success
    res.status(200).json({ message: "Bug submitted successfully!" });
  } else {
    res.status(405).json({ error: "Method not allowed" });
  }
}
