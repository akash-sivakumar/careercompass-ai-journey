import { createFileRoute } from "@tanstack/react-router";
import { convertToModelMessages, streamText, type UIMessage } from "ai";
import { createLovableAiGatewayProvider } from "@/lib/ai-gateway.server";

type MentorContext = {
  profile?: {
    full_name?: string | null;
    target_role?: string | null;
    education?: string | null;
    domain_interest?: string | null;
    skills?: string[] | null;
    resume_score?: number | null;
  } | null;
  stats?: { xp?: number; level?: number; current_streak?: number } | null;
  recent?: { kind: string; title: string }[];
};

function buildSystem(ctx?: MentorContext) {
  const p = ctx?.profile;
  const s = ctx?.stats;
  const r = ctx?.recent ?? [];
  const lines = [
    "You are CareerCompass Mentor — an expert AI career coach for students and early-career professionals.",
    "Be warm, concise, action-oriented. Use short paragraphs, bold key advice, and bullet lists when helpful.",
    "Stay strictly on career topics: resumes, skills, roadmaps, interviews, salaries, projects, certifications, learning paths, job search. Politely refuse off-topic requests.",
    "Use markdown formatting. Keep replies under ~250 words unless the user asks for depth.",
    "",
    "USER CONTEXT:",
    p?.full_name ? `- Name: ${p.full_name}` : "- Name: unknown",
    p?.target_role ? `- Target role: ${p.target_role}` : "- Target role: not set (suggest exploring careers)",
    p?.education ? `- Education: ${p.education}` : "",
    p?.domain_interest ? `- Domain interest: ${p.domain_interest}` : "",
    p?.skills?.length ? `- Skills: ${p.skills.slice(0, 20).join(", ")}` : "- Skills: none recorded yet",
    p?.resume_score != null ? `- Latest resume ATS score: ${p.resume_score}/100` : "- Resume: not yet analyzed",
    s ? `- Progress: Level ${s.level ?? 1}, ${s.xp ?? 0} XP, ${s.current_streak ?? 0}-day streak` : "",
    r.length ? `- Recent activity: ${r.slice(0, 5).map((x) => x.title).join("; ")}` : "",
  ].filter(Boolean);
  return lines.join("\n");
}

export const Route = createFileRoute("/api/mentor")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const body = (await request.json()) as { messages?: UIMessage[]; context?: MentorContext };
        if (!Array.isArray(body.messages)) return new Response("messages required", { status: 400 });
        const key = process.env.LOVABLE_API_KEY;
        if (!key) return new Response("Missing LOVABLE_API_KEY", { status: 500 });
        const gateway = createLovableAiGatewayProvider(key);
        const result = streamText({
          model: gateway("google/gemini-3-flash-preview"),
          system: buildSystem(body.context),
          messages: await convertToModelMessages(body.messages),
        });
        return result.toUIMessageStreamResponse({ originalMessages: body.messages });
      },
    },
  },
});
