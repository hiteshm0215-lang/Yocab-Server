const express = require('express');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json({ limit: '10mb' }));

app.post('/generate', async (req, res) => {
  try {
    const apiKey = process.env.GEMINI_API_KEY;
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`;

    const messages = req.body.messages || [];
    const parts = [];

    for (const msg of messages) {
      if (Array.isArray(msg.content)) {
        for (const item of msg.content) {
          if (item.type === 'text') parts.push({ text: item.text });
          else if (item.type === 'image') parts.push({ inlineData: { mimeType: item.source.media_type, data: item.source.data } });
        }
      } else {
        parts.push({ text: msg.content });
      }
    }

    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts }],
        generationConfig: { temperature: 0.4, maxOutputTokens: 2000 }
      })
    });

    const data = await response.json();

    // Log full response for debugging
    console.log('Full Gemini response:', JSON.stringify(data));

    if (data.error) {
      return res.status(400).json({ error: data.error.message });
    }

    const text = data.candidates?.[0]?.content?.parts?.[0]?.text || '[]';
    console.log('Extracted text:', text.slice(0, 200));

    res.json({ content: [{ type: 'text', text }] });

  } catch (e) {
    console.error('Server error:', e.message);
    res.status(500).json({ error: e.message });
  }
});

app.get('/', (req, res) => res.send('Yocab API running ✓'));
app.listen(process.env.PORT || 3000, () => console.log('Yocab server running'));