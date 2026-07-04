import { createFileRoute, Link } from "@tanstack/react-router";
import { tracks } from "@/content/learn";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { BookOpen, Sparkles, Code2, GraduationCap } from "lucide-react";

export const Route = createFileRoute("/_authenticated/learn/")({
  head: () => ({ meta: [
    { title: "Learning Hub — CareerCompass AI" },
    { name: "description", content: "Structured programming and domain-knowledge courses with hands-on lessons, examples, and quizzes." },
  ] }),
  component: LearnIndex,
});

function LearnIndex() {
  const [progressByTrack, setProgress] = useState<Record<string, { done: number; total: number }>>({});

  useEffect(() => {
    (async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      const { data } = await supabase.from("lesson_progress").select("track,status").eq("user_id", user.id);
      const map: Record<string, { done: number; total: number }> = {};
      for (const t of tracks) {
        const total = t.seeded ? t.lessons.length : (t.syllabus?.length ?? 0);
        map[t.slug] = { done: 0, total };
      }
      (data ?? []).forEach((r: any) => {
        if (!map[r.track]) return;
        if (r.status === "completed") map[r.track].done += 1;
      });
      setProgress(map);
    })();
  }, []);

  const programming = tracks.filter((t) => t.category === "programming");
  const domain = tracks.filter((t) => t.category === "domain");
  const domainGroups = Array.from(new Set(domain.map((t) => t.domain)));

  return (
    <div className="space-y-10">
      <header>
        <div className="flex items-center gap-3">
          <div className="size-11 rounded-2xl bg-gradient-primary grid place-items-center shadow-glow"><BookOpen className="size-5 text-primary-foreground" /></div>
          <div>
            <h1 className="text-3xl font-display font-bold">Learning Hub</h1>
            <p className="text-sm text-muted-foreground">Programming languages and domain-knowledge tracks — hand-authored where marked, AI-expanded on demand elsewhere.</p>
          </div>
        </div>
      </header>

      {/* Programming Languages */}
      <section className="space-y-4">
        <div className="flex items-center gap-2">
          <Code2 className="size-4 text-primary" />
          <h2 className="text-lg font-display font-semibold">Programming Languages</h2>
          <span className="text-xs text-muted-foreground">· {programming.length} tracks</span>
        </div>
        <TrackGrid list={programming} progress={progressByTrack} />
      </section>

      {/* Domain Knowledge */}
      <section className="space-y-6">
        <div className="flex items-center gap-2">
          <GraduationCap className="size-4 text-primary" />
          <h2 className="text-lg font-display font-semibold">Domain Knowledge</h2>
          <span className="text-xs text-muted-foreground">· {domain.length} tracks</span>
        </div>
        {domainGroups.map((g) => (
          <div key={g} className="space-y-3">
            <h3 className="text-xs uppercase tracking-widest text-muted-foreground">{g}</h3>
            <TrackGrid list={domain.filter((t) => t.domain === g)} progress={progressByTrack} />
          </div>
        ))}
      </section>
    </div>
  );
}

function TrackGrid({
  list,
  progress,
}: {
  list: typeof tracks;
  progress: Record<string, { done: number; total: number }>;
}) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {list.map((t) => {
        const p = progress[t.slug];
        const total = t.seeded ? t.lessons.length : (t.syllabus?.length ?? 0);
        const pct = p && p.total ? Math.round((p.done / p.total) * 100) : 0;
        return (
          <Link key={t.slug} to="/learn/$track" params={{ track: t.slug }}
            className="group rounded-2xl border border-border bg-card/60 backdrop-blur p-5 hover:border-primary hover:shadow-glow transition-all">
            <div className="flex items-start justify-between">
              <div className={`size-12 rounded-xl bg-gradient-to-br ${t.color} grid place-items-center text-2xl shadow-lg`}>{t.icon}</div>
              {t.seeded ? (
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-success/15 text-success border border-success/30">Full curriculum</span>
              ) : (
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-primary/15 text-primary border border-primary/30 flex items-center gap-1"><Sparkles className="size-2.5" />AI-guided</span>
              )}
            </div>
            <div className="mt-4">
              <div className="font-semibold text-lg">{t.language}</div>
              <div className="text-xs text-muted-foreground">{t.tagline}</div>
              <p className="mt-2 text-sm text-muted-foreground line-clamp-2">{t.description}</p>
            </div>
            <div className="mt-4">
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <span>{p?.done ?? 0} / {total} lessons</span><span>{pct}%</span>
              </div>
              <div className="mt-1 h-1.5 rounded-full bg-muted overflow-hidden">
                <div className="h-full bg-gradient-primary transition-all" style={{ width: `${pct}%` }} />
              </div>
            </div>
          </Link>
        );
      })}
    </div>
  );
}
