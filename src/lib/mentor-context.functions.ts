import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

export const getMentorContext = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabase, userId } = context;
    const [{ data: profile }, { data: stats }, { data: recent }] = await Promise.all([
      supabase.from("profiles").select("full_name,target_role,education,domain_interest,skills,resume_score").eq("id", userId).maybeSingle(),
      supabase.from("user_stats").select("xp,level,current_streak").eq("user_id", userId).maybeSingle(),
      supabase.from("activity_log").select("kind,title,created_at").eq("user_id", userId).order("created_at", { ascending: false }).limit(8),
    ]);
    return {
      profile: profile ?? null,
      stats: stats ?? null,
      recent: recent ?? [],
    };
  });
