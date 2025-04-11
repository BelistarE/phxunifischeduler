require("dotenv").config();
const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const axios = require("axios");

const app = express();
const PORT = 5000;

// Middleware
app.use(cors());
app.use(bodyParser.json());

// Endpoint to send email via Resend
app.post("/send-email", async (req, res) => {
  const { name, email, token } = req.body;

  try {
    const inviteUrl = `${req.headers.origin}/activate-account?token=${token}`;
    const response = await axios.post(
      "https://api.resend.com/emails",
      {
        from: "YourApp <no-reply@yourapp.com>",
        to: email,
        subject: "You're invited!",
        html: `
          <p>Hi ${name},</p>
          <p>You’ve been invited to join the PHX Unifi ramp app. Click the link below to activate your account:</p>
          <a href="${inviteUrl}">${inviteUrl}</a>
        `,
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.VITE_RESEND_API_KEY}`,
          "Content-Type": "application/json",
        },
      }
    );

    res
      .status(200)
      .json({ message: "Email sent successfully", data: response.data });
  } catch (error) {
    console.error(
      "Error sending email:",
      error.response?.data || error.message
    );
    res.status(500).json({ error: "Failed to send email" });
  }
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
