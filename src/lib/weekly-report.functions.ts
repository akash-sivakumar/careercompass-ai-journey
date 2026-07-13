import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

const SYSTEM = `You are a career coach writing a friendly, concise weekly report for a learner using an AI career platform. Return STRICT JSON:
{
  "summary": "2-3 sentences on the week",
  "wins": ["3-5 concrete positives"],
  "weak_areas": ["2-4 items to focus on"],
  "recommended_projects": ["2-3 short project ideas"],
  "next_week_goals": ["3-5 crisp goals for next 7 days"],
  "readiness_note": "1 sentence on career readiness momentum"
}
No markdown. No commentary. JSON only.`;

export const generateWeeklyReport = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabase, userId } = context;
    const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
    const [{ data: profile }, { data: stats }, { data: activity }, { data: lessons }] = await Promise.all([
      supabase.from("profiles").select("target_role,selected_career,career_readiness,resume_score,interview_readiness,skills").eq("id", userId).maybeSingle(),
      supabase.from("user_stats").select("xp,level,current_streak").eq("user_id", userId).maybeSingle(),
      supabase.from("activity_log").select("kind,title,xp_awarded,created_at").eq("user_id", userId).gte("created_at", weekAgo).order("created_at", { ascending: false }),
      supabase.from("lesson_progress").select("track,lesson_slug,status,quiz_score,quiz_total,completed_at").eq("user_id", userId).gte("completed_at", weekAgo),
    ]);

    const context_prompt = JSON.stringify({
      profile, stats,
      lessons_completed_this_week: (lessons ?? []).length,
      activity_this_week: (activity ?? []).slice(0, 30),
    });

    const key = process.env.LOVABLE_API_KEY;
    if (!key) throw new Error("Missing LOVABLE_API_KEY");
    const res = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: { "Content-Type": "application/json", "Lovable-API-Key": key },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: SYSTEM },
          { role: "user", content: `Generate this learner's weekly report from the following data:\n${context_prompt}` },
        ],
        response_format: { type: "json_object" },
      }),
    });
    if (!res.ok) {
      const t = await res.text();
      if (res.status === 429) throw new Error("AI rate limit exceeded. Try again in a moment.");
      if (res.status === 402) throw new Error("AI credits exhausted.");
      throw new Error(`AI error: ${t.slice(0, 200)}`);
    }
    const j = await res.json();
    const content = j.choices?.[0]?.message?.content ?? "{}";
    let report: unknown = {};
    try { report = JSON.parse(content); } catch { report = { summary: content }; }
    await supabase.from("ai_artifacts").insert({ user_id: userId, kind: "weekly_report", title: `Weekly report ${new Date().toLocaleDateString()}`, data: report as never });
    return { report };
  });
