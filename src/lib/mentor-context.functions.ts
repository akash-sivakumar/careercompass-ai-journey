import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

export const getMentorContext = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabase, userId } = context;
    const [
      { data: profile },
      { data: stats },
      { data: recent },
      { data: artifacts },
      { data: roadmap },
    ] = await Promise.all([
      supabase.from("profiles").select("full_name,target_role,education,domain_interest,skills,resume_score,interview_readiness,selected_career,career_readiness,courses_completed").eq("id", userId).maybeSingle(),
      supabase.from("user_stats").select("xp,level,current_streak").eq("user_id", userId).maybeSingle(),
      supabase.from("activity_log").select("kind,title,created_at").eq("user_id", userId).order("created_at", { ascending: false }).limit(10),
      supabase.from("ai_artifacts").select("kind,title,data,created_at").eq("user_id", userId).order("created_at", { ascending: false }).limit(20),
      supabase.from("roadmap_progress").select("domain,level_index,topic,status").eq("user_id", userId),
    ]);

    const latest: Record<string, unknown> = {};
    (artifacts ?? []).forEach((a) => { if (!latest[a.kind]) latest[a.kind] = a; });

    // Summarize roadmap progress by domain
    const byDomain: Record<string, { done: number; inProg: number; total: number }> = {};
    (roadmap ?? []).forEach((r) => {
      const b = (byDomain[r.domain] ||= { done: 0, inProg: 0, total: 0 });
      b.total++;
      if (r.status === "completed") b.done++;
      else if (r.status === "in_progress") b.inProg++;
    });

    return {
      profile: profile ?? null,
      stats: stats ?? null,
      recent: recent ?? [],
      artifacts: latest,
      roadmap_progress: byDomain,
    };
  });
