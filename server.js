const express = require('express');
const bodyParser = require('body-parser');
const axios = require('axios');

const app = express().use(bodyParser.json()); // Create express app

const PAGE_ACCESS_TOKEN = process.env.PAGE_ACCESS_TOKEN; // Stored in Render as env variable

// Accepts POST requests at /webhook endpoint
app.post('/webhook', async (req, res) => {
  let body = req.body;

  // Checks if this is an event from a page subscription
  if (body.object === 'page') {
    for (let entry of body.entry) {
      let webhook_event = entry.messaging[0];
      let sender_psid = webhook_event.sender.id;

      if (webhook_event.message && webhook_event.message.text) {
        const message_text = webhook_event.message.text;

        // ✅ Forward to Make Webhook
        await axios.post('https://hook.us2.make.com/sevam9gvn8tv44c9nvlef9cw7n1cy6pc', {
          sender_id: sender_psid,
          message: message_text
        });
      }
    }

    // Return a '200 OK' response to all events
    res.status(200).send('EVENT_RECEIVED');
  } else {
    // Return a '404 Not Found' if event is not from a page subscription
    res.sendStatus(404);
  }
});

// Adds support for GET requests to our webhook (for verification)
app.get('/webhook', (req, res) => {
  const VERIFY_TOKEN = process.env.VERIFY_TOKEN;

  const mode = req.query['hub.mode'];
  const token = req.query['hub.verify_token'];
  const challenge = req.query['hub.challenge'];

  if (mode && token) {
    if (mode === 'subscribe' && token === VERIFY_TOKEN) {
      console.log('WEBHOOK_VERIFIED');
      res.status(200).send(challenge);
    } else {
      res.sendStatus(403);
    }
  }
});

module.exports = app;

