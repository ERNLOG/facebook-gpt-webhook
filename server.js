const express = require('express');
const bodyParser = require('body-parser');
const axios = require('axios');

const app = express().use(bodyParser.json());

const PAGE_ACCESS_TOKEN = process.env.PAGE_ACCESS_TOKEN;
const VERIFY_TOKEN = process.env.VERIFY_TOKEN;

// Handles messages sent to the webhook
app.post('/webhook', async (req, res) => {
  try {
    const body = req.body;

    // Check if event is from a page subscription
    if (body.object === 'page') {
      for (const entry of body.entry) {
        const webhook_event = entry.messaging[0];
        const sender_psid = webhook_event.sender.id;

        // Only forward if it's a text message
        if (webhook_event.message && webhook_event.message.text) {
          const message_text = webhook_event.message.text;

          console.log(`🔁 Forwarding message to Make: "${message_text}" from ${sender_psid}`);

          // Send to Make webhook
          await axios.post('https://hook.us2.make.com/sevam9gvn8tv44c9nvlef9cw7n1cy6pc', {
            sender_id: sender_psid,
            message: message_text
          });
        }
      }

      // Respond to Meta that event is received
      res.status(200).send('EVENT_RECEIVED');
    } else {
      res.sendStatus(404);
    }
  } catch (error) {
    console.error('❌ Error handling webhook POST:', error.message);
    res.sendStatus(500);
  }
});

// Verifies webhook with Meta
app.get('/webhook', (req, res) => {
  const mode = req.query['hub.mode'];
  const token = req.query['hub.verify_token'];
  const challenge = req.query['hub.challenge'];

  if (mode && token) {
    if (mode === 'subscribe' && token === VERIFY_TOKEN) {
      console.log('✅ WEBHOOK_VERIFIED');
      res.status(200).send(challenge);
    } else {
      res.sendStatus(403);
    }
  }
});

// Start server
const PORT = process.env.PORT || 10000;
app.listen(PORT, () => {
  console.log(`🚀 Webhook server is running on port ${PORT}`);
});
