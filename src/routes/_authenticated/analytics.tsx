import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { BarChart3, Trophy, Flame, Clock, Sparkles, Loader2, RefreshCw, Target as TargetIcon } from "lucide-react";
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, LineChart, Line } from "recharts";
import { useServerFn } from "@tanstack/react-start";
import { generateWeeklyReport } from "@/lib/weekly-report.functions";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/analytics")({
  head: () => ({ meta: [
    { title: "Learning Analytics — CareerCompass AI" },
    { name: "description", content: "Track lessons completed, study time, streaks, quiz accuracy, and AI weekly reports." },
  ] }),
  component: AnalyticsPage,
});

type LessonRow = { track: string; lesson_slug: string; status: string; quiz_score: number | null; quiz_total: number | null; completed_at: string | null };
type ActivityRow = { kind: string; title: string; xp_awarded: number; created_at: string };
type Stats = { xp: number; level: number; current_streak: number; longest_streak: number };
type WeeklyReport = { summary?: string; wins?: string[]; weak_areas?: string[]; recommended_projects?: string[]; next_week_goals?: string[]; readiness_note?: string };

function AnalyticsPage() {
  const [lessons, setLessons] = useState<LessonRow[]>([]);
  const [activity, setActivity] = useState<ActivityRow[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [certCount, setCertCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [report, setReport] = useState<WeeklyReport | null>(null);
  const [reportLoading, setReportLoading] = useState(false);
  const gen = useServerFn(generateWeeklyReport);

  useEffect(() => {
    (async () => {
      setLoading(true);
      const { data: u } = await supabase.auth.getUser();
      if (!u.user) { setLoading(false); return; }
      const [{ data: l }, { data: a }, { data: s }, { count: certs }, { data: prev }] = await Promise.all([
        supabase.from("lesson_progress").select("track,lesson_slug,status,quiz_score,quiz_total,completed_at").eq("user_id", u.user.id),
        supabase.from("activity_log").select("kind,title,xp_awarded,created_at").eq("user_id", u.user.id).order("created_at", { ascending: false }).limit(500),
        supabase.from("user_stats").select("xp,level,current_streak,longest_streak").eq("user_id", u.user.id).maybeSingle(),
        supabase.from("certificates").select("*", { count: "exact", head: true }).eq("user_id", u.user.id),
        supabase.from("ai_artifacts").select("data").eq("user_id", u.user.id).eq("kind", "weekly_report").order("created_at", { ascending: false }).limit(1).maybeSingle(),
      ]);
      setLessons((l as LessonRow[]) ?? []);
      setActivity((a as ActivityRow[]) ?? []);
      setStats((s as Stats) ?? null);
      setCertCount(certs ?? 0);
      if (prev?.data) setReport(prev.data as WeeklyReport);
      setLoading(false);
    })();
  }, []);

  const metrics = useMemo(() => {
    const completed = lessons.filter((l) => l.status === "completed");
    const tracksCompleted = new Set(completed.map((l) => l.track)).size; // approximation
    const totalMinutes = completed.length * 12; // average lesson length
    const withQuiz = completed.filter((l) => l.quiz_total && l.quiz_total > 0);
    const avgQuiz = withQuiz.length
      ? Math.round((withQuiz.reduce((a, l) => a + ((l.quiz_score ?? 0) / (l.quiz_total ?? 1)) * 100, 0) / withQuiz.length))
      : 0;
    return {
      lessonsCompleted: completed.length,
      tracksTouched: new Set(lessons.map((l) => l.track)).size,
      tracksCompleted,
      studyHours: Math.round((totalMinutes / 60) * 10) / 10,
      avgQuiz,
      totalLessons: lessons.length,
      completionPct: lessons.length ? Math.round((completed.length / lessons.length) * 100) : 0,
    };
  }, [lessons]);

  const weeklyChart = useMemo(() => {
    const days: { day: string; xp: number; lessons: number }[] = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date(); d.setHours(0, 0, 0, 0); d.setDate(d.getDate() - i);
      const label = d.toLocaleDateString(undefined, { weekday: "short" });
      const iso = d.toISOString().slice(0, 10);
      const dayAct = activity.filter((a) => a.created_at.slice(0, 10) === iso);
      days.push({
        day: label,
        xp: dayAct.reduce((a, x) => a + (x.xp_awarded ?? 0), 0),
        lessons: dayAct.filter((a) => a.kind === "lesson_completed").length,
      });
    }
    return days;
  }, [activity]);

  const monthlyChart = useMemo(() => {
    const buckets: Record<string, number> = {};
    for (let i = 5; i >= 0; i--) {
      const d = new Date(); d.setDate(1); d.setMonth(d.getMonth() - i);
      buckets[d.toLocaleDateString(undefined, { month: "short" })] = 0;
    }
    activity.forEach((a) => {
      const d = new Date(a.created_at);
      const key = d.toLocaleDateString(undefined, { month: "short" });
      if (key in buckets) buckets[key] += a.xp_awarded ?? 0;
    });
    return Object.entries(buckets).map(([month, xp]) => ({ month, xp }));
  }, [activity]);

  const skillsMastered = useMemo(() => {
    const byTrack: Record<string, number> = {};
    lessons.filter((l) => l.status === "completed").forEach((l) => { byTrack[l.track] = (byTrack[l.track] ?? 0) + 1; });
    return Object.entries(byTrack).sort((a, b) => b[1] - a[1]).slice(0, 8);
  }, [lessons]);

  async function runReport() {
    setReportLoading(true);
    try {
      const { report: r } = await gen();
      setReport(r as WeeklyReport);
      toast.success("Weekly report generated");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to generate report");
    } finally { setReportLoading(false); }
  }

  if (loading) return <div className="py-16 text-center text-sm text-muted-foreground"><Loader2 className="size-4 animate-spin inline mr-2" />Crunching your progress…</div>;

  return (
    <div className="space-y-8">
      <header className="flex items-center gap-3">
        <div className="size-11 rounded-2xl bg-gradient-primary grid place-items-center shadow-glow"><BarChart3 className="size-5 text-primary-foreground" /></div>
        <div>
          <h1 className="text-3xl font-display font-bold">Learning Analytics</h1>
          <p className="text-sm text-muted-foreground">All your progress, at a glance.</p>
        </div>
      </header>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <Kpi icon={TargetIcon} label="Lessons completed" value={metrics.lessonsCompleted} sub={`${metrics.completionPct}% of started`} />
        <Kpi icon={Clock} label="Study hours" value={metrics.studyHours} sub={`${metrics.tracksTouched} tracks explored`} />
        <Kpi icon={Sparkles} label="Avg quiz score" value={`${metrics.avgQuiz}%`} sub="Across all quizzes" />
        <Kpi icon={Flame} label="Current streak" value={`${stats?.current_streak ?? 0}d`} sub={`Best ${stats?.longest_streak ?? 0}d`} />
        <Kpi icon={Trophy} label="XP" value={stats?.xp ?? 0} sub={`Level ${stats?.level ?? 1}`} />
        <Kpi icon={Trophy} label="Certificates" value={certCount} sub="Earned" />
        <Kpi icon={BarChart3} label="Tracks touched" value={metrics.tracksTouched} sub={`${metrics.tracksCompleted} in progress`} />
        <Kpi icon={TargetIcon} label="Completion" value={`${metrics.completionPct}%`} sub="Of started lessons" />
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <div className="rounded-2xl border border-border bg-card/60 p-5">
          <h3 className="font-display font-semibold mb-3">This week — XP by day</h3>
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={weeklyChart}>
                <CartesianGrid stroke="var(--border)" strokeDasharray="3 3" />
                <XAxis dataKey="day" stroke="var(--muted-foreground)" fontSize={12} />
                <YAxis stroke="var(--muted-foreground)" fontSize={12} />
                <Tooltip contentStyle={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: 12, color: "var(--card-foreground)" }} />
                <Bar dataKey="xp" fill="var(--primary)" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
        <div className="rounded-2xl border border-border bg-card/60 p-5">
          <h3 className="font-display font-semibold mb-3">Last 6 months — XP</h3>
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={monthlyChart}>
                <CartesianGrid stroke="var(--border)" strokeDasharray="3 3" />
                <XAxis dataKey="month" stroke="var(--muted-foreground)" fontSize={12} />
                <YAxis stroke="var(--muted-foreground)" fontSize={12} />
                <Tooltip contentStyle={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: 12, color: "var(--card-foreground)" }} />
                <Line type="monotone" dataKey="xp" stroke="var(--primary)" strokeWidth={2} dot={{ fill: "var(--primary)" }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {skillsMastered.length > 0 && (
        <div className="rounded-2xl border border-border bg-card/60 p-5">
          <h3 className="font-display font-semibold mb-3">Top tracks by lessons completed</h3>
          <div className="space-y-2">
            {skillsMastered.map(([track, count]) => (
              <div key={track} className="flex items-center gap-3">
                <div className="text-sm font-medium w-40 truncate capitalize">{track.replace(/-/g, " ")}</div>
                <div className="flex-1 h-2 rounded-full bg-muted overflow-hidden">
                  <div className="h-full bg-gradient-primary" style={{ width: `${Math.min(100, count * 10)}%` }} />
                </div>
                <div className="text-xs text-muted-foreground w-14 text-right">{count} lessons</div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="rounded-2xl border border-primary/30 bg-primary/5 p-5">
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <div>
            <h3 className="font-display font-semibold flex items-center gap-2"><Sparkles className="size-4 text-primary" /> AI Weekly Report</h3>
            <p className="text-xs text-muted-foreground mt-0.5">A quick coach's briefing built from your last 7 days.</p>
          </div>
          <button onClick={runReport} disabled={reportLoading}
            className="inline-flex items-center gap-1 text-sm px-3 py-1.5 rounded-lg bg-gradient-primary text-primary-foreground shadow-glow disabled:opacity-50">
            {reportLoading ? <><Loader2 className="size-3 animate-spin" /> Writing…</> : <><RefreshCw className="size-3" /> {report ? "Regenerate" : "Generate"}</>}
          </button>
        </div>
        {report && (
          <div className="mt-4 space-y-3 text-sm">
            {report.summary && <p className="text-foreground/90">{report.summary}</p>}
            <div className="grid gap-3 sm:grid-cols-2">
              <ReportBlock title="Wins" items={report.wins} />
              <ReportBlock title="Focus areas" items={report.weak_areas} />
              <ReportBlock title="Recommended projects" items={report.recommended_projects} />
              <ReportBlock title="Next week's goals" items={report.next_week_goals} />
            </div>
            {report.readiness_note && <p className="text-xs text-muted-foreground italic">{report.readiness_note}</p>}
          </div>
        )}
      </div>
    </div>
  );
}

function Kpi({ icon: Icon, label, value, sub }: { icon: React.ComponentType<{ className?: string }>; label: string; value: string | number; sub?: string }) {
  return (
    <div className="rounded-2xl border border-border bg-card/60 p-4">
      <div className="flex items-center gap-2 text-xs text-muted-foreground"><Icon className="size-3.5" /> {label}</div>
      <div className="mt-1 text-2xl font-display font-bold">{value}</div>
      {sub && <div className="text-[11px] text-muted-foreground">{sub}</div>}
    </div>
  );
}

function ReportBlock({ title, items }: { title: string; items?: string[] }) {
  if (!items?.length) return null;
  return (
    <div className="rounded-xl border border-border bg-card/60 p-3">
      <div className="text-xs uppercase tracking-widest text-muted-foreground mb-1">{title}</div>
      <ul className="list-disc pl-5 text-sm space-y-1">{items.map((i, k) => <li key={k}>{i}</li>)}</ul>
    </div>
  );
}
