const express = require("express");
const bodyParser = require("body-parser");
const app = express();

app.use(bodyParser.json());

const VERIFY_TOKEN = "ERNLog"; // <-- Use your exact Verify Token from Facebook

// Webhook verification endpoint
app.get("/webhook", (req, res) => {
  const mode = req.query["hub.mode"];
  const token = req.query["hub.verify_token"];
  const challenge = req.query["hub.challenge"];

  if (mode && token) {
    if (mode === "subscribe" && token === VERIFY_TOKEN) {
      console.log("WEBHOOK_VERIFIED");
      res.status(200).send(challenge);
    } else {
      res.sendStatus(403);
    }
  }
});

// Webhook to receive messages
app.post("/webhook", (req, res) => {
  console.log("📥 New Message Event:");
  console.dir(req.body, { depth: null });

  // Respond to FB immediately
  res.status(200).send("EVENT_RECEIVED");

  // Later: Forward to Make.com here if needed
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 Webhook server is running on port ${PORT}`);
});
