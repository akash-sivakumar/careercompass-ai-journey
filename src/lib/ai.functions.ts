import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

const Input = z.object({
  system: z.string().min(1).max(4000),
  prompt: z.string().min(1).max(20000),
  model: z.string().optional(),
  json: z.boolean().optional(),
});

export const generateAI = createServerFn({ method: "POST" })
  .inputValidator((d: unknown) => Input.parse(d))
  .handler(async ({ data }) => {
    const key = process.env.LOVABLE_API_KEY;
    if (!key) throw new Error("Missing LOVABLE_API_KEY");
    const res = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: { "Content-Type": "application/json", "Lovable-API-Key": key },
      body: JSON.stringify({
        model: data.model || "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: data.system },
          { role: "user", content: data.prompt },
        ],
        ...(data.json ? { response_format: { type: "json_object" } } : {}),
      }),
    });
    if (!res.ok) {
      const t = await res.text();
      if (res.status === 429) throw new Error("AI rate limit exceeded. Try again in a moment.");
      if (res.status === 402) throw new Error("AI credits exhausted. Please upgrade your plan.");
      throw new Error(`AI error: ${t.slice(0, 200)}`);
    }
    const json = await res.json();
    const content = json.choices?.[0]?.message?.content ?? "";
    return { content };
  });
