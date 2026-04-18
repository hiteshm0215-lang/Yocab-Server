// server.js — Yocab AI Backend
// This is a tiny server that sits between your app and the Anthropic API.
// Your API key lives HERE (on the server), never in your app code.
// Render.com will run this 24/7 for free.

const express = require('express');
const cors = require('cors');

const app = express();
app.use(cors()); // Allow requests from your GitHub Pages site
app.use(express.json());

app.post('/generate', async (req, res) => {
  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': process.env.ANTHROPIC_API_KEY, // Key stored safely as env variable
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: 'claude-haiku-4-5',
        max_tokens: 1500,
        messages: req.body.messages
      })
    });
    const data = await response.json();
    res.json(data);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

app.get('/', (req, res) => res.send('Yocab API running ✓'));

app.listen(process.env.PORT || 3000, () => console.log('Yocab server running'));