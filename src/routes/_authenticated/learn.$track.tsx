import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { getTrack, topicSlug } from "@/content/learn";
import type { Track } from "@/content/learn/types";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { ArrowLeft, CheckCircle2, Circle, Clock, Sparkles } from "lucide-react";

export const Route = createFileRoute("/_authenticated/learn/$track")({
  loader: ({ params }) => {
    const t = getTrack(params.track);
    if (!t) throw notFound();
    return { track: t };
  },
  head: ({ loaderData }) => ({
    meta: [
      { title: loaderData ? `${loaderData.track.language} — Learning Hub` : "Track" },
      { name: "description", content: loaderData?.track.description ?? "" },
    ],
  }),
  component: TrackPage,
  notFoundComponent: () => <div className="p-8">Track not found. <Link to="/learn" className="text-primary underline">Back</Link></div>,
});

function TrackPage() {
  const { track } = Route.useLoaderData() as { track: Track };
  const [progress, setProgress] = useState<Record<string, string>>({});

  useEffect(() => {
    (async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      const { data } = await supabase.from("lesson_progress").select("lesson_slug,status").eq("user_id", user.id).eq("track", track.slug);
      const m: Record<string, string> = {};
      (data ?? []).forEach((r: any) => { m[r.lesson_slug] = r.status; });
      setProgress(m);
    })();
  }, [track.slug]);

  const modules: { slug: string; title: string; minutes?: number; summary?: string }[] = track.seeded
    ? track.lessons.map((l) => ({ slug: l.slug, title: l.title, minutes: l.minutes, summary: l.summary }))
    : (track.syllabus ?? []).map((topic) => ({ slug: topicSlug(topic), title: topic, minutes: 12, summary: `AI-guided lesson on ${topic}.` }));

  const total = modules.length;
  const done = modules.filter((m) => progress[m.slug] === "completed").length;
  const pct = total ? Math.round((done / total) * 100) : 0;

  return (
    <div className="space-y-8">
      <Link to="/learn" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"><ArrowLeft className="size-4" /> All tracks</Link>

      <header className="flex items-start gap-4">
        <div className={`size-16 rounded-2xl bg-gradient-to-br ${track.color} grid place-items-center text-4xl shadow-lg`}>{track.icon}</div>
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <h1 className="text-3xl font-display font-bold">{track.language}</h1>
            {track.seeded ? (
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-success/15 text-success border border-success/30">Full curriculum</span>
            ) : (
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-primary/15 text-primary border border-primary/30 flex items-center gap-1"><Sparkles className="size-2.5" /> AI-guided</span>
            )}
          </div>
          <p className="text-sm text-muted-foreground mt-1">{track.description}</p>
          {total > 0 && (
            <div className="mt-3 max-w-md">
              <div className="flex justify-between text-xs text-muted-foreground"><span>Progress</span><span>{done}/{total} · {pct}%</span></div>
              <div className="mt-1 h-2 rounded-full bg-muted overflow-hidden"><div className="h-full bg-gradient-primary" style={{ width: `${pct}%` }} /></div>
            </div>
          )}
        </div>
      </header>

      {!track.seeded && (
        <div className="rounded-xl border border-primary/30 bg-primary/5 px-4 py-3 text-sm text-muted-foreground flex items-start gap-2">
          <Sparkles className="size-4 text-primary shrink-0 mt-0.5" />
          <span>Lessons in this track are generated on demand by our AI tutor when you open them. Your progress and quiz scores are saved just like hand-authored tracks.</span>
        </div>
      )}

      <ol className="space-y-2">
        {modules.map((l, i) => {
          const s = progress[l.slug];
          const isDone = s === "completed";
          const inProgress = s === "in_progress";
          return (
            <li key={l.slug}>
              <Link to="/learn/$track/$slug" params={{ track: track.slug, slug: l.slug }}
                className="flex items-center gap-4 p-4 rounded-xl border border-border bg-card/60 hover:border-primary hover:bg-card transition-all group">
                <div className={`size-8 rounded-lg grid place-items-center text-xs font-semibold ${isDone ? "bg-success/20 text-success" : inProgress ? "bg-primary/20 text-primary" : "bg-muted text-muted-foreground"}`}>{i + 1}</div>
                <div className="flex-1 min-w-0">
                  <div className="font-medium truncate">{l.title}</div>
                  <div className="text-xs text-muted-foreground truncate">{l.summary}</div>
                </div>
                {l.minutes && <div className="text-xs text-muted-foreground flex items-center gap-1"><Clock className="size-3" />{l.minutes}m</div>}
                {isDone ? <CheckCircle2 className="size-5 text-success" /> : <Circle className="size-5 text-muted-foreground/40" />}
              </Link>
            </li>
          );
        })}
      </ol>
    </div>
  );
}
