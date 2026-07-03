import { createFileRoute, Link, notFound, useRouter } from "@tanstack/react-router";
import { getLesson, getTrack } from "@/content/learn";
import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { awardXP, logActivity, unlockAchievement } from "@/lib/gamification";
import { toast } from "sonner";
import { ArrowLeft, ArrowRight, CheckCircle2, Clock } from "lucide-react";

export const Route = createFileRoute("/_authenticated/learn/$track/$slug")({
  loader: ({ params }) => {
    const t = getTrack(params.track);
    const l = getLesson(params.track, params.slug);
    if (!t || !l) throw notFound();
    return { track: t, lesson: l };
  },
  head: ({ loaderData }) => ({
    meta: [{ title: loaderData ? `${loaderData.lesson.title} — ${loaderData.track.language}` : "Lesson" }],
  }),
  component: LessonPage,
  notFoundComponent: () => <div className="p-8">Lesson not found.</div>,
});

function LessonPage() {
  const { track, lesson } = Route.useLoaderData();
  const router = useRouter();
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [submitted, setSubmitted] = useState(false);
  const [alreadyDone, setAlreadyDone] = useState(false);

  const idx = track.lessons.findIndex((l) => l.slug === lesson.slug);
  const prev = idx > 0 ? track.lessons[idx - 1] : null;
  const next = idx < track.lessons.length - 1 ? track.lessons[idx + 1] : null;

  useEffect(() => {
    (async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      const { data } = await supabase.from("lesson_progress").select("status").eq("user_id", user.id).eq("track", track.slug).eq("lesson_slug", lesson.slug).maybeSingle();
      if (data?.status === "completed") setAlreadyDone(true);
      await supabase.from("lesson_progress").upsert({ user_id: user.id, track: track.slug, lesson_slug: lesson.slug, status: data?.status ?? "in_progress" }, { onConflict: "user_id,track,lesson_slug" });
    })();
    setAnswers({}); setSubmitted(false);
  }, [track.slug, lesson.slug]);

  const score = useMemo(() => {
    let s = 0;
    lesson.quiz.forEach((q, i) => { if (answers[i] === q.answer) s++; });
    return s;
  }, [answers, lesson]);

  async function complete() {
    setSubmitted(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    const pct = Math.round((score / lesson.quiz.length) * 100);
    await supabase.from("lesson_progress").upsert({
      user_id: user.id, track: track.slug, lesson_slug: lesson.slug,
      status: "completed", quiz_score: score, quiz_total: lesson.quiz.length,
      completed_at: new Date().toISOString(),
    }, { onConflict: "user_id,track,lesson_slug" });
    if (!alreadyDone) {
      const xp = 20 + (pct >= 80 ? 10 : 0);
      await logActivity("lesson_completed", `${track.language}: ${lesson.title}`, { xp, meta: { track: track.slug, slug: lesson.slug, score: pct } });
      toast.success(`Lesson complete! +${xp} XP`);
      // check track completion
      const { count } = await supabase.from("lesson_progress").select("*", { count: "exact", head: true }).eq("user_id", user.id).eq("track", track.slug).eq("status", "completed");
      if ((count ?? 0) >= track.lessons.length) {
        await unlockAchievement(`${track.slug}_complete`, { silent: false });
      }
      setAlreadyDone(true);
    }
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <Link to="/learn/$track" params={{ track: track.slug }} className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"><ArrowLeft className="size-4" /> {track.language} lessons</Link>

      <header>
        <div className="text-xs uppercase tracking-widest text-muted-foreground">Lesson {idx + 1} of {track.lessons.length}</div>
        <h1 className="text-3xl font-display font-bold mt-1">{lesson.title}</h1>
        <p className="text-sm text-muted-foreground mt-1 flex items-center gap-3">
          <span>{lesson.summary}</span><span className="flex items-center gap-1"><Clock className="size-3" />{lesson.minutes}m</span>
          {alreadyDone && <span className="inline-flex items-center gap-1 text-success"><CheckCircle2 className="size-3" /> Completed</span>}
        </p>
      </header>

      <article className="space-y-6">
        {lesson.sections.map((s, i) => (
          <section key={i} className="rounded-2xl border border-border bg-card/60 p-5">
            <h2 className="font-display font-semibold text-lg">{s.heading}</h2>
            <p className="text-sm text-foreground/90 mt-2 whitespace-pre-wrap leading-relaxed">{s.body}</p>
          </section>
        ))}
        {(lesson.examples ?? []).map((ex, i) => (
          <div key={i} className="rounded-2xl border border-border overflow-hidden">
            <div className="px-4 py-2 text-xs uppercase tracking-widest text-muted-foreground bg-muted/40 border-b border-border flex justify-between">
              <span>Example · {ex.language}</span>{ex.note && <span>{ex.note}</span>}
            </div>
            <pre className="p-4 overflow-x-auto text-sm bg-background"><code>{ex.code}</code></pre>
          </div>
        ))}
      </article>

      <section className="rounded-2xl border border-border bg-card/60 p-5 space-y-4">
        <h2 className="font-display font-semibold text-lg">Quick check</h2>
        {lesson.quiz.map((q, qi) => (
          <div key={qi} className="space-y-2">
            <div className="text-sm font-medium">{qi + 1}. {q.q}</div>
            <div className="grid gap-2">
              {q.options.map((opt, oi) => {
                const chosen = answers[qi] === oi;
                const correct = q.answer === oi;
                const showState = submitted;
                const cls = showState
                  ? correct ? "border-success bg-success/10"
                    : chosen ? "border-destructive bg-destructive/10"
                    : "border-border"
                  : chosen ? "border-primary bg-primary/10" : "border-border hover:border-primary/50";
                return (
                  <button key={oi} disabled={submitted}
                    onClick={() => setAnswers({ ...answers, [qi]: oi })}
                    className={`text-left text-sm px-3 py-2 rounded-lg border ${cls} transition-all disabled:cursor-not-allowed`}>
                    {opt}
                  </button>
                );
              })}
            </div>
            {submitted && q.explain && <div className="text-xs text-muted-foreground">💡 {q.explain}</div>}
          </div>
        ))}
        {!submitted ? (
          <button onClick={complete} disabled={Object.keys(answers).length < lesson.quiz.length}
            className="w-full py-2.5 rounded-lg bg-gradient-primary text-primary-foreground font-medium shadow-glow disabled:opacity-50">
            Submit & mark complete
          </button>
        ) : (
          <div className="text-center py-2 text-sm">Score: <strong>{score}/{lesson.quiz.length}</strong> · {alreadyDone ? "Saved" : ""}</div>
        )}
      </section>

      <nav className="flex justify-between gap-3">
        {prev ? (
          <Link to="/learn/$track/$slug" params={{ track: track.slug, slug: prev.slug }}
            className="flex-1 px-4 py-3 rounded-xl border border-border hover:border-primary text-sm">
            <div className="text-xs text-muted-foreground">← Previous</div>
            <div className="font-medium truncate">{prev.title}</div>
          </Link>
        ) : <div className="flex-1" />}
        {next ? (
          <Link to="/learn/$track/$slug" params={{ track: track.slug, slug: next.slug }}
            className="flex-1 px-4 py-3 rounded-xl border border-border hover:border-primary text-sm text-right">
            <div className="text-xs text-muted-foreground">Next →</div>
            <div className="font-medium truncate">{next.title}</div>
          </Link>
        ) : (
          <Link to="/learn/$track" params={{ track: track.slug }}
            className="flex-1 px-4 py-3 rounded-xl border border-border hover:border-primary text-sm text-right">
            <div className="text-xs text-muted-foreground">Finish →</div>
            <div className="font-medium">Back to track</div>
          </Link>
        )}
      </nav>
    </div>
  );
}
