import { useCallback, useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

export type UserProfile = {
  id: string;
  full_name: string | null;
  email: string | null;
  target_role: string | null;
  skills: string[] | null;
  resume_score: number | null;
  interview_readiness: number | null;
  courses_completed: number | null;
  education: string | null;
  domain_interest: string | null;
  interests: string[] | null;
  selected_career: string | null;
  career_readiness: number | null;
};

export type Artifact = { id: string; kind: string; title: string | null; data: unknown; created_at: string };

/** Shared user profile + latest AI artifacts for cross-module workflow. */
export function useUserProfile() {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [artifacts, setArtifacts] = useState<Record<string, Artifact | null>>({});
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    const { data: u } = await supabase.auth.getUser();
    if (!u.user) { setProfile(null); setArtifacts({}); setLoading(false); return; }
    const [{ data: prof }, { data: arts }] = await Promise.all([
      supabase.from("profiles").select("*").eq("id", u.user.id).maybeSingle(),
      supabase.from("ai_artifacts").select("*").eq("user_id", u.user.id).order("created_at", { ascending: false }).limit(50),
    ]);
    setProfile((prof as UserProfile | null) ?? null);
    const latest: Record<string, Artifact> = {};
    ((arts as Artifact[]) ?? []).forEach((a) => { if (!latest[a.kind]) latest[a.kind] = a; });
    setArtifacts(latest);
    setLoading(false);
  }, []);

  useEffect(() => { void load(); }, [load]);

  return { profile, artifacts, loading, refresh: load };
}

/** Save (upsert) an AI artifact for the current user. */
export async function saveArtifact(kind: string, title: string, data: unknown) {
  const { data: u } = await supabase.auth.getUser();
  if (!u.user) return;
  await supabase.from("ai_artifacts").insert({ user_id: u.user.id, kind, title, data: data as never });
}

/** Update selected fields on the current user's profile. */
export async function updateProfile(patch: Partial<UserProfile>) {
  const { data: u } = await supabase.auth.getUser();
  if (!u.user) return;
  await supabase.from("profiles").update(patch as never).eq("id", u.user.id);
}
