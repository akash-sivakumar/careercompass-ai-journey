import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import {
  LayoutDashboard, FileText, BookOpen, Mic, Trophy, ArrowRight, Sparkles,
  Flame, Star, Target, Map, Brain, Compass, Activity, Lock, Loader2, RefreshCw,
} from "lucide-react";
import { Card, PageHeader, GhostBtn } from "@/components/ui-kit";
import { NotificationBell } from "@/components/notification-bell";
import { GlobalSearch } from "@/components/global-search";
import { ensureUserStats, xpProgressInLevel, notify } from "@/lib/gamification";
import { useServerFn } from "@tanstack/react-start";
import { generateAI } from "@/lib/ai.functions";
import { toast } from "sonner";
import {
  ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, Radar, Tooltip,
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
} from "recharts";

export const Route = createFileRoute("/_authenticated/dashboard")({ component: Dashboard });

type Profile = {
  full_name: string | null; email: string | null; college_name: string | null;
  target_role: string | null; skills: string[] | null;
  resume_score: number | null; interview_readiness: number | null; courses_completed: number | null;
};
type Stats = { xp: number; level: number; current_streak: number; longest_streak: number };
type ActivityRow = { id: string; kind: string; title: string; xp_awarded: number; created_at: string };
type Achievement = { code: string; title: string; description: string; icon: string; xp_reward: number };
type Earned = { achievement_code: string; earned_at: string };

function Dashboard() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [stats, setStats] = useState<Stats | null>(null);
  const [activity, setActivity] = useState<ActivityRow[]>([]);
  const [catalog, setCatalog] = useState<Achievement[]>([]);
  const [earned, setEarned] = useState<Set<string>>(new Set());
  const [recs, setRecs] = useState<string[]>([]);
  const [recsLoading, setRecsLoading] = useState(false);
  const generate = useServerFn(generateAI);

  useEffect(() => {
    (async () => {
      const { data: u } = await supabase.auth.getUser();
      if (!u.user) return;
      const uid = u.user.id;
      const s = await ensureUserStats();
      if (s) setStats(s as Stats);
      const [{ data: prof }, { data: act }, { data: ach }, { data: earnedRows }] = await Promise.all([
        supabase.from("profiles").select("*").eq("id", uid).maybeSingle(),
        supabase.from("activity_log").select("*").eq("user_id", uid).order("created_at", { ascending: false }).limit(15),
        supabase.from("achievements").select("*").order("xp_reward"),
        supabase.from("user_achievements").select("achievement_code, earned_at").eq("user_id", uid),
      ]);
      setProfile(prof as Profile);
      setActivity((act as ActivityRow[]) ?? []);
      setCatalog((ach as Achievement[]) ?? []);
      setEarned(new Set(((earnedRows as Earned[]) ?? []).map(e => e.achievement_code)));
    })();
  }, []);

  // Readiness score
  const readiness = useMemo(() => {
    const resume = profile?.resume_score ?? 0;
    const interview = profile?.interview_readiness ?? 0;
    const skills = Math.min((profile?.skills?.length ?? 0) * 8, 100);
    const courses = Math.min((profile?.courses_completed ?? 0) * 15, 100);
    return Math.round((resume + interview + skills + courses) / 4);
  }, [profile]);

  const radarData = useMemo(() => ([
    { axis: "Resume", value: profile?.resume_score ?? 0 },
    { axis: "Skills", value: Math.min((profile?.skills?.length ?? 0) * 8, 100) },
    { axis: "Interview", value: profile?.interview_readiness ?? 0 },
    { axis: "Learning", value: Math.min((profile?.courses_completed ?? 0) * 15, 100) },
    { axis: "Practice", value: Math.min((activity.filter(a => a.kind === "practice").length) * 10, 100) },
    { axis: "Roadmap", value: Math.min((activity.filter(a => a.kind === "roadmap").length) * 20, 100) },
  ]), [profile, activity]);

  // 7-day XP bar
  const weekly = useMemo(() => {
    const days: { d: string; xp: number }[] = [];
    for (let i = 6; i >= 0; i--) {
      const dt = new Date(); dt.setDate(dt.getDate() - i);
      const key = dt.toISOString().slice(0, 10);
      const label = dt.toLocaleDateString("en", { weekday: "short" });
      const xp = activity.filter(a => a.created_at.slice(0, 10) === key).reduce((s, a) => s + (a.xp_awarded || 0), 0);
      days.push({ d: label, xp });
    }
    return days;
  }, [activity]);

  const lvl = stats ? xpProgressInLevel(stats.xp) : { current: 0, needed: 500, level: 1 };

  async function getAIRecs() {
    setRecsLoading(true);
    try {
      const ctx = {
        target_role: profile?.target_role,
        skills: profile?.skills,
        resume_score: profile?.resume_score,
        interview_readiness: profile?.interview_readiness,
        readiness_score: readiness,
      };
      const { content } = await generate({
        data: {
          system: "You are a career coach for CareerCompass AI. Return concise, prioritized next-step recommendations as JSON.",
          prompt: `Based on this user context, give 5 personalized next-step recommendations to improve placement readiness. Each should be one short actionable sentence (max 18 words). Context: ${JSON.stringify(ctx)}\nReturn JSON: {"recommendations": string[]}`,
          json: true,
        },
      });
      const parsed = JSON.parse(content || "{}");
      setRecs(parsed.recommendations || []);
      await notify("New AI recommendations ready", "Check your dashboard for personalized next steps.", "/dashboard");
    } catch (e: any) {
      toast.error(e.message || "Failed to generate recommendations");
    } finally {
      setRecsLoading(false);
    }
  }

  const earnedAch = catalog.filter(c => earned.has(c.code));
  const lockedAch = catalog.filter(c => !earned.has(c.code)).slice(0, 4);

  const continueCards = [
    { to: "/roadmap", label: "Continue Roadmap", icon: Map, desc: "Resume your personalized learning path" },
    { to: "/mock-interview", label: "Continue Practice", icon: Mic, desc: "Run another mock interview round" },
  ];

  return (
    <div>
      {/* Top bar with search + bell */}
      <div className="flex items-center justify-between gap-3 mb-6">
        <PageHeader
          title={`Welcome back, ${profile?.full_name?.split(" ")[0] || "there"} 👋`}
          subtitle="Your personalized career command center."
          icon={LayoutDashboard}
        />
        <div className="flex items-center gap-2 shrink-0">
          <GlobalSearch />
          <NotificationBell />
        </div>
      </div>

      {/* Hero: readiness + level */}
      <div className="grid lg:grid-cols-3 gap-4 mb-6">
        <Card className="lg:col-span-2 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-accent/10 pointer-events-none" />
          <div className="relative flex flex-col md:flex-row items-center gap-6">
            <ReadinessGauge value={readiness} />
            <div className="flex-1">
              <div className="text-xs uppercase tracking-wider text-muted-foreground">Career Readiness Score</div>
              <div className="text-4xl font-bold mt-1">{readiness}<span className="text-lg text-muted-foreground">/100</span></div>
              <p className="text-sm text-muted-foreground mt-2">
                {readiness >= 80 ? "You're interview-ready. Polish, then start applying." :
                 readiness >= 50 ? "Solid base. Close key skill gaps to break through." :
                 "Let's build the foundation. Start with resume and roadmap."}
              </p>
              <div className="mt-4 flex flex-wrap gap-2">
                <Link to="/resume"><GhostBtn>Improve Resume</GhostBtn></Link>
                <Link to="/skill-gap"><GhostBtn>Close Skill Gaps</GhostBtn></Link>
                <Link to="/mock-interview"><GhostBtn>Practice Interview</GhostBtn></Link>
              </div>
            </div>
          </div>
        </Card>

        <Card>
          <div className="flex items-center justify-between">
            <div>
              <div className="text-xs uppercase tracking-wider text-muted-foreground">Level</div>
              <div className="text-3xl font-bold mt-1">Lv {lvl.level}</div>
            </div>
            <div className="size-12 rounded-2xl bg-gradient-primary grid place-items-center shadow-glow">
              <Star className="size-6 text-primary-foreground" />
            </div>
          </div>
          <div className="mt-4">
            <div className="flex justify-between text-xs text-muted-foreground mb-1">
              <span>{stats?.xp ?? 0} XP</span>
              <span>{lvl.current}/{lvl.needed}</span>
            </div>
            <div className="h-2 bg-muted rounded-full overflow-hidden">
              <div className="h-full bg-gradient-primary transition-all" style={{ width: `${(lvl.current / lvl.needed) * 100}%` }} />
            </div>
          </div>
          <div className="mt-4 flex items-center gap-3 pt-4 border-t border-border">
            <div className="flex items-center gap-1.5 text-sm">
              <Flame className="size-4 text-orange-400" />
              <span className="font-semibold">{stats?.current_streak ?? 0}</span>
              <span className="text-muted-foreground">day streak</span>
            </div>
            <div className="ml-auto text-xs text-muted-foreground">Best: {stats?.longest_streak ?? 0}</div>
          </div>
        </Card>
      </div>

      {/* Stat cards */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatCard label="Resume Score" value={`${profile?.resume_score ?? 0}/100`} icon={FileText} accent="from-blue-500 to-cyan-500" to="/resume" />
        <StatCard label="Skills Tracked" value={profile?.skills?.length ?? 0} icon={Target} accent="from-violet-500 to-purple-500" to="/skill-gap" />
        <StatCard label="Courses Done" value={profile?.courses_completed ?? 0} icon={BookOpen} accent="from-amber-500 to-orange-500" to="/roadmap" />
        <StatCard label="Interview Ready" value={`${profile?.interview_readiness ?? 0}%`} icon={Mic} accent="from-emerald-500 to-green-500" to="/mock-interview" />
      </div>

      {/* Charts row */}
      <div className="grid lg:grid-cols-2 gap-4 mb-6">
        <Card>
          <div className="flex items-center justify-between mb-4">
            <div>
              <div className="font-display font-semibold">Career Analytics</div>
              <div className="text-xs text-muted-foreground">Readiness across pillars</div>
            </div>
            <Compass className="size-5 text-muted-foreground" />
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart data={radarData}>
                <PolarGrid stroke="hsl(var(--border))" />
                <PolarAngleAxis dataKey="axis" tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 11 }} />
                <Radar dataKey="value" stroke="hsl(var(--primary))" fill="hsl(var(--primary))" fillOpacity={0.35} />
                <Tooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 12 }} />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card>
          <div className="flex items-center justify-between mb-4">
            <div>
              <div className="font-display font-semibold">This Week</div>
              <div className="text-xs text-muted-foreground">XP earned by day</div>
            </div>
            <Activity className="size-5 text-muted-foreground" />
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={weekly}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="d" tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 11 }} />
                <YAxis tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 11 }} />
                <Tooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 12 }} />
                <Bar dataKey="xp" fill="hsl(var(--primary))" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>

      {/* AI recommendations + continue */}
      <div className="grid lg:grid-cols-3 gap-4 mb-6">
        <Card className="lg:col-span-2">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Sparkles className="size-5 text-accent" />
              <div className="font-display font-semibold">Personalized AI Recommendations</div>
            </div>
            <button onClick={getAIRecs} disabled={recsLoading} className="text-xs inline-flex items-center gap-1 text-primary hover:underline disabled:opacity-50">
              {recsLoading ? <Loader2 className="size-3 animate-spin" /> : <RefreshCw className="size-3" />}
              {recs.length ? "Refresh" : "Generate"}
            </button>
          </div>
          {recs.length === 0 ? (
            <div className="text-sm text-muted-foreground py-6 text-center border border-dashed border-border rounded-xl">
              Tap <span className="text-primary">Generate</span> for AI-tailored next steps based on your full profile.
            </div>
          ) : (
            <ul className="space-y-2">
              {recs.map((r, i) => (
                <li key={i} className="flex items-start gap-3 p-3 rounded-xl bg-muted/40 border border-border/50">
                  <div className="size-6 rounded-full bg-gradient-primary text-primary-foreground text-xs font-bold grid place-items-center shrink-0">{i + 1}</div>
                  <span className="text-sm">{r}</span>
                </li>
              ))}
            </ul>
          )}
        </Card>

        <div className="space-y-4">
          {continueCards.map(c => (
            <Link key={c.to} to={c.to} className="block group">
              <Card className="hover:shadow-glow transition !p-5">
                <div className="flex items-center gap-3">
                  <div className="size-10 rounded-xl bg-gradient-primary grid place-items-center shadow-glow">
                    <c.icon className="size-5 text-primary-foreground" />
                  </div>
                  <div className="flex-1">
                    <div className="font-semibold text-sm">{c.label}</div>
                    <div className="text-xs text-muted-foreground">{c.desc}</div>
                  </div>
                  <ArrowRight className="size-4 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition" />
                </div>
              </Card>
            </Link>
          ))}
        </div>
      </div>

      {/* Achievements + Activity */}
      <div className="grid lg:grid-cols-2 gap-4 mb-6">
        <Card>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Trophy className="size-5 text-amber-400" />
              <div className="font-display font-semibold">Achievements</div>
            </div>
            <div className="text-xs text-muted-foreground">{earnedAch.length}/{catalog.length}</div>
          </div>
          {earnedAch.length === 0 && lockedAch.length === 0 ? (
            <div className="text-sm text-muted-foreground py-4 text-center">Loading…</div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {earnedAch.slice(0, 6).map(a => (
                <div key={a.code} className="p-3 rounded-xl border border-primary/30 bg-primary/5">
                  <Trophy className="size-5 text-amber-400 mb-2" />
                  <div className="text-xs font-semibold">{a.title}</div>
                  <div className="text-[10px] text-muted-foreground mt-0.5">+{a.xp_reward} XP</div>
                </div>
              ))}
              {lockedAch.slice(0, 6 - Math.min(earnedAch.length, 6)).map(a => (
                <div key={a.code} className="p-3 rounded-xl border border-border bg-muted/20 opacity-60">
                  <Lock className="size-5 text-muted-foreground mb-2" />
                  <div className="text-xs font-semibold">{a.title}</div>
                  <div className="text-[10px] text-muted-foreground mt-0.5">{a.description}</div>
                </div>
              ))}
            </div>
          )}
        </Card>

        <Card>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Activity className="size-5 text-muted-foreground" />
              <div className="font-display font-semibold">Recent Activity</div>
            </div>
          </div>
          {activity.length === 0 ? (
            <div className="text-sm text-muted-foreground py-8 text-center border border-dashed border-border rounded-xl">
              No activity yet. Use any module to start your timeline.
            </div>
          ) : (
            <ul className="space-y-3 max-h-64 overflow-y-auto pr-1">
              {activity.map(a => (
                <li key={a.id} className="flex items-center gap-3 text-sm">
                  <div className="size-2 rounded-full bg-primary shrink-0" />
                  <div className="flex-1 min-w-0">
                    <div className="truncate">{a.title}</div>
                    <div className="text-[10px] text-muted-foreground">{new Date(a.created_at).toLocaleString()} · {a.kind}</div>
                  </div>
                  {a.xp_awarded > 0 && (
                    <span className="text-[10px] font-semibold text-primary px-2 py-0.5 rounded-full bg-primary/10 shrink-0">+{a.xp_awarded} XP</span>
                  )}
                </li>
              ))}
            </ul>
          )}
        </Card>
      </div>
    </div>
  );
}

function StatCard({ label, value, icon: Icon, accent, to }: { label: string; value: string | number; icon: any; accent: string; to: string }) {
  return (
    <Link to={to} className="block group">
      <Card className="!p-5 hover:shadow-glow transition">
        <div className="flex items-start justify-between">
          <div>
            <div className="text-xs text-muted-foreground uppercase tracking-wider">{label}</div>
            <div className="text-3xl font-bold mt-1">{value}</div>
          </div>
          <div className={`size-10 rounded-xl bg-gradient-to-br ${accent} grid place-items-center group-hover:scale-110 transition`}>
            <Icon className="size-5 text-white" />
          </div>
        </div>
      </Card>
    </Link>
  );
}

function ReadinessGauge({ value }: { value: number }) {
  const size = 140;
  const stroke = 12;
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const offset = c - (value / 100) * c;
  const color = value >= 80 ? "hsl(142 76% 50%)" : value >= 50 ? "hsl(38 92% 55%)" : "hsl(0 84% 60%)";
  return (
    <div className="relative shrink-0" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={size / 2} cy={size / 2} r={r} stroke="hsl(var(--muted))" strokeWidth={stroke} fill="none" />
        <circle
          cx={size / 2} cy={size / 2} r={r}
          stroke={color} strokeWidth={stroke} fill="none"
          strokeDasharray={c} strokeDashoffset={offset} strokeLinecap="round"
          style={{ transition: "stroke-dashoffset 1s ease" }}
        />
      </svg>
      <div className="absolute inset-0 grid place-items-center">
        <div className="text-center">
          <div className="text-3xl font-bold">{value}</div>
          <div className="text-[10px] uppercase tracking-widest text-muted-foreground">Ready</div>
        </div>
      </div>
    </div>
  );
}
