import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const LEVEL_STEP = 500; // xp per level

export function levelFromXP(xp: number) {
  return Math.max(1, Math.floor(xp / LEVEL_STEP) + 1);
}
export function xpProgressInLevel(xp: number) {
  const lvl = levelFromXP(xp);
  const base = (lvl - 1) * LEVEL_STEP;
  return { current: xp - base, needed: LEVEL_STEP, level: lvl };
}

async function getUserId() {
  const { data } = await supabase.auth.getUser();
  return data.user?.id ?? null;
}

export async function ensureUserStats() {
  const uid = await getUserId();
  if (!uid) return null;
  const { data } = await supabase.from("user_stats").select("*").eq("user_id", uid).maybeSingle();
  if (data) return data;
  const { data: created } = await supabase
    .from("user_stats")
    .insert({ user_id: uid })
    .select("*")
    .single();
  return created;
}

/** Awards XP, updates streak, returns new totals */
export async function awardXP(amount: number, opts?: { silent?: boolean }) {
  const uid = await getUserId();
  if (!uid) return null;
  const current = (await ensureUserStats()) as any;
  if (!current) return null;
  const today = new Date().toISOString().slice(0, 10);
  const last = current.last_active_date as string | null;
  let streak = current.current_streak ?? 0;
  if (last === today) {
    // same day, keep streak
  } else if (last && new Date(today).getTime() - new Date(last).getTime() === 86400000) {
    streak += 1;
  } else {
    streak = 1;
  }
  const xp = (current.xp ?? 0) + amount;
  const longest = Math.max(current.longest_streak ?? 0, streak);
  await supabase
    .from("user_stats")
    .update({
      xp,
      level: levelFromXP(xp),
      current_streak: streak,
      longest_streak: longest,
      last_active_date: today,
    })
    .eq("user_id", uid);
  if (!opts?.silent && amount > 0) toast.success(`+${amount} XP`);
  // streak achievements
  if (streak >= 30) await unlockAchievement("streak_30", { silent: true });
  else if (streak >= 7) await unlockAchievement("streak_7", { silent: true });
  else if (streak >= 3) await unlockAchievement("streak_3", { silent: true });
  if (xp >= 1000) await unlockAchievement("xp_1000", { silent: true });
  return { xp, streak, level: levelFromXP(xp) };
}

export async function logActivity(kind: string, title: string, opts?: { xp?: number; meta?: Record<string, unknown> }) {
  const uid = await getUserId();
  if (!uid) return;
  const xp = opts?.xp ?? 0;
  await supabase.from("activity_log").insert({
    user_id: uid,
    kind,
    title,
    meta: opts?.meta ?? {},
    xp_awarded: xp,
  });
  if (xp > 0) await awardXP(xp, { silent: true });
}

export async function unlockAchievement(code: string, opts?: { silent?: boolean }) {
  const uid = await getUserId();
  if (!uid) return;
  const { data: existing } = await supabase
    .from("user_achievements")
    .select("id")
    .eq("user_id", uid)
    .eq("achievement_code", code)
    .maybeSingle();
  if (existing) return;
  const { error } = await supabase
    .from("user_achievements")
    .insert({ user_id: uid, achievement_code: code });
  if (error) return;
  const { data: ach } = await supabase
    .from("achievements")
    .select("title,xp_reward")
    .eq("code", code)
    .maybeSingle();
  if (ach) {
    await awardXP(ach.xp_reward ?? 0, { silent: true });
    await notify(`Achievement unlocked: ${ach.title}`, `+${ach.xp_reward} XP`);
    if (!opts?.silent) toast.success(`🏆 ${ach.title}`, { description: `+${ach.xp_reward} XP` });
  }
}

export async function notify(title: string, body?: string, route?: string, kind = "info") {
  const uid = await getUserId();
  if (!uid) return;
  await supabase.from("notifications").insert({ user_id: uid, title, body, route, kind });
}
