import { createFileRoute } from "@tanstack/react-router";
import { convertToModelMessages, streamText, type UIMessage } from "ai";
import { createLovableAiGatewayProvider } from "@/lib/ai-gateway.server";

type MentorContext = {
  profile?: {
    full_name?: string | null;
    target_role?: string | null;
    selected_career?: string | null;
    education?: string | null;
    domain_interest?: string | null;
    skills?: string[] | null;
    resume_score?: number | null;
    interview_readiness?: number | null;
    career_readiness?: number | null;
    courses_completed?: number | null;
  } | null;
  stats?: { xp?: number; level?: number; current_streak?: number } | null;
  recent?: { kind: string; title: string }[];
  artifacts?: Record<string, { kind: string; title: string | null; summary: string }>;
  roadmap_progress?: Record<string, { done: number; inProg: number; total: number }>;
};

function buildSystem(ctx?: MentorContext) {
  const p = ctx?.profile;
  const s = ctx?.stats;
  const r = ctx?.recent ?? [];
  const arts = ctx?.artifacts ?? {};
  const roadmap = ctx?.roadmap_progress ?? {};
  const roadmapLines = Object.entries(roadmap).map(([d, v]) => `  · ${d}: ${v.done}/${v.total} done${v.inProg ? `, ${v.inProg} in progress` : ""}`);
  const lines = [
    "You are CareerCompass Mentor — an expert AI career coach for students and early-career professionals.",
    "Be warm, concise, action-oriented. Use short paragraphs, bold key advice, and bullet lists when helpful.",
    "Stay strictly on career topics: resumes, skills, roadmaps, interviews, salaries, projects, certifications, learning paths, job search. Politely refuse off-topic requests.",
    "Use markdown formatting. Keep replies under ~250 words unless the user asks for depth.",
    "When suggesting next steps, reference the user's roadmap progress, missing skills, and recent activity by name.",
    "",
    "USER CONTEXT:",
    p?.full_name ? `- Name: ${p.full_name}` : "- Name: unknown",
    p?.selected_career ? `- Career goal: ${p.selected_career}` : p?.target_role ? `- Target role: ${p.target_role}` : "- Career goal: not set (suggest running Career AI)",
    p?.education ? `- Education: ${p.education}` : "",
    p?.domain_interest ? `- Domain interest: ${p.domain_interest}` : "",
    p?.skills?.length ? `- Skills: ${p.skills.slice(0, 20).join(", ")}` : "- Skills: none recorded",
    p?.resume_score != null ? `- Resume ATS score: ${p.resume_score}/100` : "- Resume: not analyzed",
    p?.interview_readiness != null ? `- Interview readiness: ${p.interview_readiness}/100` : "",
    p?.career_readiness != null ? `- Career readiness: ${p.career_readiness}/100` : "",
    s ? `- Progress: Level ${s.level ?? 1}, ${s.xp ?? 0} XP, ${s.current_streak ?? 0}-day streak` : "",
    arts.resume ? `- Latest resume artifact: ${arts.resume.title ?? ""} — ${arts.resume.summary}` : "",
    arts.skill_gap ? `- Latest skill-gap: ${arts.skill_gap.title ?? ""} — ${arts.skill_gap.summary}` : "",
    arts.career ? `- Latest career recs: ${arts.career.summary}` : "",
    arts.mock_interview ? `- Latest mock interview: ${arts.mock_interview.title ?? ""} — ${arts.mock_interview.summary}` : "",
    roadmapLines.length ? `- Roadmap progress:\n${roadmapLines.join("\n")}` : "",
    r.length ? `- Recent activity: ${r.slice(0, 6).map((x) => x.title).join("; ")}` : "",
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
