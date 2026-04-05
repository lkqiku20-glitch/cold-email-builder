import "dotenv/config";
import express from "express";
import Anthropic from "@anthropic-ai/sdk";
import { readFileSync } from "fs";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

const __dirname = dirname(fileURLToPath(import.meta.url));
const app = express();
app.use(express.json());
app.use(express.static(__dirname));

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

app.get("/", (req, res) => {
  res.sendFile(join(__dirname, "index.html"));
});

app.post("/generate", async (req, res) => {
  const { targetAudience, offer, senderName, senderCompany, tone } = req.body;

  if (!targetAudience || !offer || !senderName) {
    return res.status(400).json({ error: "Missing required fields." });
  }

  const prompt = `You are an expert cold email copywriter. Generate a 5-email cold outreach sequence.

Target audience: ${targetAudience}
Offer / product: ${offer}
Sender name: ${senderName}
Sender company: ${senderCompany || "their company"}
Tone: ${tone || "professional but conversational"}

Rules:
- Each email must be short (under 150 words for emails 1-4, under 100 for email 5)
- No fluff, no hype, no buzzwords
- Subject lines must be curiosity-driven and under 8 words
- Email 1: Hook with a specific pain point, soft CTA (just a question)
- Email 2: Social proof or result, ask if relevant
- Email 3: Address the #1 objection they probably have
- Email 4: Case study or specific outcome, clear CTA
- Email 5: Final short breakup email

Return ONLY valid JSON in this exact format, no other text:
{
  "sequence": [
    {
      "number": 1,
      "subject": "...",
      "body": "..."
    },
    {
      "number": 2,
      "subject": "...",
      "body": "..."
    },
    {
      "number": 3,
      "subject": "...",
      "body": "..."
    },
    {
      "number": 4,
      "subject": "...",
      "body": "..."
    },
    {
      "number": 5,
      "subject": "...",
      "body": "..."
    }
  ]
}`;

  try {
    const message = await client.messages.create({
      model: "claude-sonnet-4-6",
      max_tokens: 2048,
      messages: [{ role: "user", content: prompt }],
    });

    const raw = message.content[0].text.trim();
    const json = JSON.parse(raw);
    res.json(json);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to generate sequence. Check your API key and try again." });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Running at http://localhost:${PORT}`));
