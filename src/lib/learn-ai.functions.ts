import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

const Input = z.object({
  language: z.string().min(1).max(60),
  topic: z.string().min(1).max(120),
});

const SYSTEM = `You are an expert programming instructor. Given a language and a topic, generate ONE beginner-friendly lesson as strict JSON with this exact shape:
{
  "slug": "kebab-case-slug",
  "title": "string",
  "minutes": number,
  "summary": "one sentence",
  "sections": [{ "heading": "string", "body": "150-250 word explanation" }],
  "examples": [{ "language": "string", "code": "string", "note": "optional" }],
  "quiz": [{ "q": "string", "options": ["a","b","c","d"], "answer": 0, "explain": "optional" }]
}
Rules: 2-4 sections, 1-2 examples, 3-5 quiz questions, accurate technical content, no markdown, no code fences, valid JSON only.`;

export const generateLesson = createServerFn({ method: "POST" })
  .inputValidator((d: unknown) => Input.parse(d))
  .handler(async ({ data }) => {
    const key = process.env.LOVABLE_API_KEY;
    if (!key) throw new Error("Missing LOVABLE_API_KEY");
    const res = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: { "Content-Type": "application/json", "Lovable-API-Key": key },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: SYSTEM },
          { role: "user", content: `Language: ${data.language}\nTopic: ${data.topic}` },
        ],
        response_format: { type: "json_object" },
      }),
    });
    if (!res.ok) {
      const t = await res.text();
      if (res.status === 429) throw new Error("AI rate limit exceeded. Try again in a moment.");
      if (res.status === 402) throw new Error("AI credits exhausted. Please upgrade your plan.");
      throw new Error(`AI error: ${t.slice(0, 200)}`);
    }
    const json = await res.json();
    const content = json.choices?.[0]?.message?.content ?? "{}";
    try {
      const lesson = JSON.parse(content);
      return { lesson };
    } catch {
      throw new Error("AI returned invalid JSON");
    }
  });
