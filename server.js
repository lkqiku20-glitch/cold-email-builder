import "dotenv/config";
import express from "express";
import Anthropic from "@anthropic-ai/sdk";
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
  const { senderName, senderRole, targetRole, targetIndustry, offer, painPoint, cta } = req.body;

  if (!senderName || !offer) {
    return res.status(400).json({ error: "Sender name and offer are required." });
  }

  const prompt = `You are an elite cold outreach strategist and copywriter. Generate a complete 30-day outreach system for the following:

Sender Name: ${senderName}
Sender Role: ${senderRole || "consultant"}
Target Role: ${targetRole || "decision maker"}
Target Industry: ${targetIndustry || "general business"}
Offer: ${offer}
Pain Point: ${painPoint || "general inefficiencies and lost revenue"}
Desired CTA: ${cta || "book a 15-minute call"}

Return ONLY valid JSON — no markdown, no code fences, no extra text — in exactly this structure:

{
  "email_sequence": [
    {
      "day": 1,
      "subject": "...",
      "body": "...",
      "cta": "..."
    },
    {
      "day": 3,
      "subject": "...",
      "body": "...",
      "cta": "..."
    },
    {
      "day": 7,
      "subject": "...",
      "body": "...",
      "cta": "..."
    },
    {
      "day": 14,
      "subject": "...",
      "body": "...",
      "cta": "..."
    },
    {
      "day": 21,
      "subject": "...",
      "body": "...",
      "cta": "..."
    }
  ],
  "linkedin_messages": {
    "connection_request": "...",
    "follow_up_1": "...",
    "follow_up_2": "..."
  },
  "twitter_dms": [
    "...",
    "...",
    "..."
  ],
  "subject_line_variations": [
    { "subject": "...", "open_rate_tip": "..." },
    { "subject": "...", "open_rate_tip": "..." },
    { "subject": "...", "open_rate_tip": "..." },
    { "subject": "...", "open_rate_tip": "..." },
    { "subject": "...", "open_rate_tip": "..." },
    { "subject": "...", "open_rate_tip": "..." },
    { "subject": "...", "open_rate_tip": "..." },
    { "subject": "...", "open_rate_tip": "..." },
    { "subject": "...", "open_rate_tip": "..." },
    { "subject": "...", "open_rate_tip": "..." }
  ],
  "personalization_tips": [
    "...",
    "...",
    "...",
    "...",
    "..."
  ],
  "outreach_calendar": [
    { "day": 1, "action": "...", "channel": "...", "notes": "..." },
    { "day": 2, "action": "...", "channel": "...", "notes": "..." },
    { "day": 3, "action": "...", "channel": "...", "notes": "..." },
    { "day": 4, "action": "...", "channel": "...", "notes": "..." },
    { "day": 5, "action": "...", "channel": "...", "notes": "..." },
    { "day": 6, "action": "...", "channel": "...", "notes": "..." },
    { "day": 7, "action": "...", "channel": "..", "notes": "..." },
    { "day": 8, "action": "...", "channel": "...", "notes": "..." },
    { "day": 9, "action": "...", "channel": "...", "notes": "..." },
    { "day": 10, "action": "...", "channel": "...", "notes": "..." },
    { "day": 11, "action": "...", "channel": "...", "notes": "..." },
    { "day": 12, "action": "...", "channel": "...", "notes": "..." },
    { "day": 13, "action": "...", "channel": "...", "notes": "..." },
    { "day": 14, "action": "...", "channel": "...", "notes": "..." },
    { "day": 15, "action": "...", "channel": "...", "notes": "..." },
    { "day": 16, "action": "...", "channel": "...", "notes": "..." },
    { "day": 17, "action": "...", "channel": "...", "notes": "..." },
    { "day": 18, "action": "...", "channel": "...", "notes": "..." },
    { "day": 19, "action": "...", "channel": "...", "notes": "..." },
    { "day": 20, "action": "...", "channel": "...", "notes": "..." },
    { "day": 21, "action": "...", "channel": "...", "notes": "..." },
    { "day": 22, "action": "...", "channel": "...", "notes": "..." },
    { "day": 23, "action": "...", "channel": "...", "notes": "..." },
    { "day": 24, "action": "...", "channel": "...", "notes": "..." },
    { "day": 25, "action": "...", "channel": "...", "notes": "..." },
    { "day": 26, "action": "...", "channel": "...", "notes": "..." },
    { "day": 27, "action": "...", "channel": "...", "notes": "..." },
    { "day": 28, "action": "...", "channel": "...", "notes": "..." },
    { "day": 29, "action": "...", "channel": "...", "notes": "..." },
    { "day": 30, "action": "...", "channel": "...", "notes": "..." }
  ],
  "objection_responses": [
    { "objection": "...", "email_response": "..." },
    { "objection": "...", "email_response": "..." },
    { "objection": "...", "email_response": "..." },
    { "objection": "...", "email_response": "..." },
    { "objection": "...", "email_response": "..." }
  ],
  "follow_up_strategy": "..."
}

Rules for content quality:
- Email sequence: Day 1 is first touch (hook + pain point), Day 3 social proof, Day 7 handle objection, Day 14 case study with specific result, Day 21 polite breakup. Each under 150 words. Each cta field is a single clear call to action sentence.
- LinkedIn connection_request: under 300 characters. follow_up_1 sent after connection accepted. follow_up_2 sent 5 days later if no reply.
- Twitter DMs: casual, under 280 characters each, 3 different angles.
- Subject lines: varied styles (question, number, name-drop, curiosity, direct). Each open_rate_tip explains WHY this subject line works.
- Personalization tips: specific and actionable, not generic advice.
- outreach_calendar: realistic daily actions mixing email, LinkedIn, Twitter, research, and rest days. Channel field is one of: Email, LinkedIn, Twitter/X, Research, Rest.
- Objections: most common real objections prospects raise. email_response is a short ready-to-send email reply.
- follow_up_strategy: 2-3 paragraphs with specific timing, tone, and channel-mixing advice.`;

  try {
    const message = await client.messages.create({
      model: "claude-opus-4-5",
      max_tokens: 8000,
      messages: [{ role: "user", content: prompt }],
    });

    const raw = message.content[0].text.trim();
    const json = JSON.parse(raw);
    res.json(json);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to generate outreach system. Check your API key and try again." });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Running at http://localhost:${PORT}`));
