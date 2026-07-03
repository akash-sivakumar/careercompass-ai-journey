import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { getTrack } from "@/content/learn";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { ArrowLeft, CheckCircle2, Circle, Clock, Sparkles } from "lucide-react";
import { useServerFn } from "@tanstack/react-start";
import { generateLesson } from "@/lib/learn-ai.functions";
import { toast } from "sonner";

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
  const { track } = Route.useLoaderData();
  const [progress, setProgress] = useState<Record<string, string>>({});
  const [aiTopic, setAiTopic] = useState("");
  const [aiLoading, setAiLoading] = useState(false);
  const [aiLesson, setAiLesson] = useState<any>(null);
  const gen = useServerFn(generateLesson);

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

  async function expand() {
    if (!aiTopic.trim()) return;
    setAiLoading(true); setAiLesson(null);
    try {
      const { lesson } = await gen({ data: { language: track.language, topic: aiTopic.trim() } });
      setAiLesson(lesson);
    } catch (e: any) { toast.error(e.message ?? "Failed"); }
    finally { setAiLoading(false); }
  }

  const done = track.lessons.filter((l) => progress[l.slug] === "completed").length;
  const pct = track.lessons.length ? Math.round((done / track.lessons.length) * 100) : 0;

  return (
    <div className="space-y-8">
      <Link to="/learn" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"><ArrowLeft className="size-4" /> All tracks</Link>

      <header className="flex items-start gap-4">
        <div className={`size-16 rounded-2xl bg-gradient-to-br ${track.color} grid place-items-center text-4xl shadow-lg`}>{track.icon}</div>
        <div className="flex-1">
          <h1 className="text-3xl font-display font-bold">{track.language}</h1>
          <p className="text-sm text-muted-foreground">{track.description}</p>
          {track.seeded && (
            <div className="mt-3 max-w-md">
              <div className="flex justify-between text-xs text-muted-foreground"><span>Progress</span><span>{done}/{track.lessons.length} · {pct}%</span></div>
              <div className="mt-1 h-2 rounded-full bg-muted overflow-hidden"><div className="h-full bg-gradient-primary" style={{ width: `${pct}%` }} /></div>
            </div>
          )}
        </div>
      </header>

      {track.seeded ? (
        <ol className="space-y-2">
          {track.lessons.map((l, i) => {
            const s = progress[l.slug];
            const isDone = s === "completed";
            return (
              <li key={l.slug}>
                <Link to="/learn/$track/$slug" params={{ track: track.slug, slug: l.slug }}
                  className="flex items-center gap-4 p-4 rounded-xl border border-border bg-card/60 hover:border-primary hover:bg-card transition-all group">
                  <div className="size-8 rounded-lg bg-muted grid place-items-center text-xs font-semibold text-muted-foreground">{i + 1}</div>
                  <div className="flex-1 min-w-0">
                    <div className="font-medium truncate">{l.title}</div>
                    <div className="text-xs text-muted-foreground truncate">{l.summary}</div>
                  </div>
                  <div className="text-xs text-muted-foreground flex items-center gap-1"><Clock className="size-3" />{l.minutes}m</div>
                  {isDone ? <CheckCircle2 className="size-5 text-success" /> : <Circle className="size-5 text-muted-foreground/40" />}
                </Link>
              </li>
            );
          })}
        </ol>
      ) : (
        <div className="rounded-2xl border border-primary/30 bg-primary/5 p-6">
          <div className="flex items-center gap-2 text-primary font-semibold"><Sparkles className="size-4" /> AI-expandable track</div>
          <p className="text-sm text-muted-foreground mt-1">This track doesn't have a hand-authored curriculum yet. Generate any topic on demand.</p>
          <div className="mt-4 flex gap-2">
            <input value={aiTopic} onChange={(e) => setAiTopic(e.target.value)}
              placeholder={`e.g. "async/await in ${track.language}"`}
              className="flex-1 bg-input border border-border rounded-lg px-3 py-2 text-sm outline-none focus:border-ring" />
            <button onClick={expand} disabled={aiLoading || !aiTopic.trim()}
              className="px-4 py-2 rounded-lg bg-gradient-primary text-primary-foreground text-sm font-medium shadow-glow disabled:opacity-50">
              {aiLoading ? "Generating…" : "Generate lesson"}
            </button>
          </div>
          {aiLesson && (
            <article className="mt-6 space-y-4">
              <h2 className="text-2xl font-display font-bold">{aiLesson.title}</h2>
              <p className="text-sm text-muted-foreground">{aiLesson.summary}</p>
              {(aiLesson.sections ?? []).map((s: any, i: number) => (
                <div key={i}><h3 className="font-semibold">{s.heading}</h3><p className="text-sm mt-1 whitespace-pre-wrap">{s.body}</p></div>
              ))}
              {(aiLesson.examples ?? []).map((ex: any, i: number) => (
                <pre key={i} className="bg-background border border-border rounded-lg p-3 text-xs overflow-x-auto"><code>{ex.code}</code></pre>
              ))}
            </article>
          )}
        </div>
      )}
    </div>
  );
}
