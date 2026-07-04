import { createFileRoute, Link, notFound, useRouter } from "@tanstack/react-router";
import { getLesson, getTrack, topicSlug } from "@/content/learn";
import type { Lesson, Track } from "@/content/learn/types";
import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { awardXP, logActivity, unlockAchievement } from "@/lib/gamification";
import { toast } from "sonner";
import { useServerFn } from "@tanstack/react-start";
import { generateLesson } from "@/lib/learn-ai.functions";
import { ArrowLeft, CheckCircle2, Clock, Sparkles, Loader2, Lightbulb, Target as TargetIcon, StickyNote, BookmarkPlus } from "lucide-react";

type LoaderData =
  | { kind: "seeded"; track: Track; lesson: Lesson }
  | { kind: "ai"; track: Track; topic: string; slug: string };

export const Route = createFileRoute("/_authenticated/learn/$track/$slug")({
  loader: ({ params }): LoaderData => {
    const t = getTrack(params.track);
    if (!t) throw notFound();
    if (t.seeded) {
      const l = getLesson(params.track, params.slug);
      if (!l) throw notFound();
      return { kind: "seeded", track: t, lesson: l };
    }
    // Non-seeded: resolve topic from syllabus by slug
    const topic = (t.syllabus ?? []).find((tt) => topicSlug(tt) === params.slug);
    if (!topic) throw notFound();
    return { kind: "ai", track: t, topic, slug: params.slug };
  },
  head: ({ loaderData }) => ({
    meta: [{ title: loaderData ? `${loaderData.kind === "seeded" ? loaderData.lesson.title : loaderData.topic} — ${loaderData.track.language}` : "Lesson" }],
  }),
  component: LessonPage,
  notFoundComponent: () => <div className="p-8">Lesson not found. <Link to="/learn" className="text-primary underline">Back to Learning Hub</Link></div>,
});

function LessonPage() {
  const data = Route.useLoaderData() as LoaderData;
  const { track } = data;
  const router = useRouter();
  const gen = useServerFn(generateLesson);

  const [aiLesson, setAiLesson] = useState<Lesson | null>(null);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiError, setAiError] = useState<string | null>(null);

  // Resolve the lesson object (seeded or AI-generated)
  const lesson: Lesson | null = data.kind === "seeded" ? data.lesson : aiLesson;
  const lessonSlug = data.kind === "seeded" ? data.lesson.slug : data.slug;

  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [submitted, setSubmitted] = useState(false);
  const [alreadyDone, setAlreadyDone] = useState(false);

  const modules = track.seeded
    ? track.lessons.map((l) => ({ slug: l.slug, title: l.title }))
    : (track.syllabus ?? []).map((t) => ({ slug: topicSlug(t), title: t }));
  const idx = modules.findIndex((m) => m.slug === lessonSlug);
  const prev = idx > 0 ? modules[idx - 1] : null;
  const next = idx >= 0 && idx < modules.length - 1 ? modules[idx + 1] : null;

  // Load AI lesson (cached in ai_artifacts) for non-seeded tracks
  useEffect(() => {
    setAnswers({}); setSubmitted(false); setAiError(null);
    if (data.kind === "seeded") return;
    let cancelled = false;
    (async () => {
      setAiLoading(true);
      const artifactKind = `learn_lesson:${track.slug}:${data.slug}`;
      try {
        const { data: cached } = await supabase
          .from("ai_artifacts")
          .select("data")
          .eq("kind", artifactKind)
          .order("created_at", { ascending: false })
          .limit(1)
          .maybeSingle();
        if (cached?.data && !cancelled) {
          setAiLesson(normalizeLesson(cached.data as any, data.slug, data.topic));
          setAiLoading(false);
          return;
        }
        const { lesson: gl } = await gen({ data: { language: track.language, topic: data.topic } });
        const normalized = normalizeLesson(gl, data.slug, data.topic);
        if (cancelled) return;
        setAiLesson(normalized);
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          await supabase.from("ai_artifacts").insert({
            user_id: user.id,
            kind: artifactKind,
            title: `${track.language}: ${data.topic}`,
            data: normalized as any,
          });
        }
      } catch (e: any) {
        if (!cancelled) setAiError(e?.message ?? "Failed to generate lesson.");
      } finally {
        if (!cancelled) setAiLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [track.slug, data.kind === "ai" ? data.slug : ""]);

  // Progress record
  useEffect(() => {
    (async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      const { data: row } = await supabase.from("lesson_progress")
        .select("status").eq("user_id", user.id).eq("track", track.slug).eq("lesson_slug", lessonSlug).maybeSingle();
      if (row?.status === "completed") setAlreadyDone(true); else setAlreadyDone(false);
      await supabase.from("lesson_progress").upsert(
        { user_id: user.id, track: track.slug, lesson_slug: lessonSlug, status: row?.status ?? "in_progress" },
        { onConflict: "user_id,track,lesson_slug" },
      );
    })();
  }, [track.slug, lessonSlug]);

  const score = useMemo(() => {
    if (!lesson) return 0;
    let s = 0;
    lesson.quiz.forEach((q, i) => { if (answers[i] === q.answer) s++; });
    return s;
  }, [answers, lesson]);

  async function complete() {
    if (!lesson) return;
    setSubmitted(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    const pct = lesson.quiz.length ? Math.round((score / lesson.quiz.length) * 100) : 100;
    await supabase.from("lesson_progress").upsert({
      user_id: user.id, track: track.slug, lesson_slug: lessonSlug,
      status: "completed", quiz_score: score, quiz_total: lesson.quiz.length,
      completed_at: new Date().toISOString(),
    }, { onConflict: "user_id,track,lesson_slug" });
    if (!alreadyDone) {
      const xp = 20 + (pct >= 80 ? 10 : 0);
      await logActivity("lesson_completed", `${track.language}: ${lesson.title}`, { xp, meta: { track: track.slug, slug: lessonSlug, score: pct } });
      toast.success(`Lesson complete! +${xp} XP`);
      const { count } = await supabase.from("lesson_progress").select("*", { count: "exact", head: true }).eq("user_id", user.id).eq("track", track.slug).eq("status", "completed");
      const total = modules.length;
      if ((count ?? 0) >= total && total > 0) {
        await unlockAchievement(`${track.slug}_complete`, { silent: false });
      }
      setAlreadyDone(true);
    }
  }

  async function bookmark() {
    if (!lesson) return;
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { toast.error("Sign in required"); return; }
    await supabase.from("bookmarks").insert({
      user_id: user.id, kind: "lesson", ref_id: `${track.slug}/${lessonSlug}`,
      route: `/learn/${track.slug}/${lessonSlug}`, title: `${track.language}: ${lesson.title}`, meta: {},
    });
    toast.success("Bookmarked");
  }

  // Loading / error states for AI lessons
  if (data.kind === "ai" && aiLoading && !aiLesson) {
    return (
      <div className="max-w-3xl mx-auto py-16 text-center space-y-4">
        <div className="inline-flex items-center gap-3 text-primary"><Loader2 className="size-5 animate-spin" /><span>Generating your lesson on <strong>{data.topic}</strong>…</span></div>
        <p className="text-xs text-muted-foreground">Personalized for {track.language}. This takes a few seconds the first time.</p>
      </div>
    );
  }
  if (data.kind === "ai" && aiError && !aiLesson) {
    return (
      <div className="max-w-2xl mx-auto py-16 text-center space-y-3">
        <p className="text-sm text-destructive">{aiError}</p>
        <button onClick={() => router.invalidate()} className="px-4 py-2 rounded-lg bg-gradient-primary text-primary-foreground text-sm">Retry</button>
      </div>
    );
  }
  if (!lesson) return null;

  const objectives = deriveObjectives(lesson);
  const takeaways = deriveTakeaways(lesson);

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <Link to="/learn/$track" params={{ track: track.slug }} className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"><ArrowLeft className="size-4" /> {track.language} lessons</Link>

      <header>
        <div className="text-xs uppercase tracking-widest text-muted-foreground flex items-center gap-2">
          <span>Lesson {idx + 1} of {modules.length}</span>
          {data.kind === "ai" && <span className="inline-flex items-center gap-1 text-primary"><Sparkles className="size-3" /> AI-tutored</span>}
        </div>
        <h1 className="text-3xl font-display font-bold mt-1">{lesson.title}</h1>
        <p className="text-sm text-muted-foreground mt-1 flex items-center gap-3 flex-wrap">
          <span>{lesson.summary}</span>
          <span className="flex items-center gap-1"><Clock className="size-3" />{lesson.minutes}m</span>
          {alreadyDone && <span className="inline-flex items-center gap-1 text-success"><CheckCircle2 className="size-3" /> Completed</span>}
        </p>
        <div className="mt-3 flex gap-2">
          <button onClick={bookmark} className="inline-flex items-center gap-1 text-xs px-3 py-1.5 rounded-lg border border-border hover:border-primary"><BookmarkPlus className="size-3" /> Bookmark</button>
        </div>
      </header>

      {objectives.length > 0 && (
        <section className="rounded-2xl border border-border bg-card/60 p-5">
          <h2 className="font-display font-semibold text-sm flex items-center gap-2"><TargetIcon className="size-4 text-primary" /> Learning objectives</h2>
          <ul className="mt-2 text-sm text-foreground/90 list-disc pl-5 space-y-1">
            {objectives.map((o, i) => <li key={i}>{o}</li>)}
          </ul>
        </section>
      )}

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

      {takeaways.length > 0 && (
        <section className="rounded-2xl border border-primary/30 bg-primary/5 p-5">
          <h2 className="font-display font-semibold text-sm flex items-center gap-2"><Lightbulb className="size-4 text-primary" /> Key takeaways</h2>
          <ul className="mt-2 text-sm list-disc pl-5 space-y-1">
            {takeaways.map((t, i) => <li key={i}>{t}</li>)}
          </ul>
        </section>
      )}

      <section className="rounded-2xl border border-border bg-card/60 p-5 space-y-4">
        <h2 className="font-display font-semibold text-lg flex items-center gap-2"><StickyNote className="size-4 text-primary" /> Quick check</h2>
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

function normalizeLesson(raw: any, slug: string, fallbackTitle: string): Lesson {
  return {
    slug,
    title: String(raw?.title ?? fallbackTitle),
    minutes: Number.isFinite(raw?.minutes) ? Math.max(3, Math.min(60, Number(raw.minutes))) : 12,
    summary: String(raw?.summary ?? `Lesson on ${fallbackTitle}.`),
    sections: Array.isArray(raw?.sections) ? raw.sections.map((s: any) => ({
      heading: String(s?.heading ?? "Overview"),
      body: String(s?.body ?? ""),
    })) : [],
    examples: Array.isArray(raw?.examples) ? raw.examples.map((e: any) => ({
      language: String(e?.language ?? "text"),
      code: String(e?.code ?? ""),
      note: e?.note ? String(e.note) : undefined,
    })) : [],
    quiz: Array.isArray(raw?.quiz) ? raw.quiz.filter((q: any) => Array.isArray(q?.options) && q.options.length >= 2).map((q: any) => ({
      q: String(q.q ?? ""),
      options: q.options.map((o: any) => String(o)),
      answer: Math.max(0, Math.min(q.options.length - 1, Number(q.answer) || 0)),
      explain: q.explain ? String(q.explain) : undefined,
    })) : [],
  };
}

function deriveObjectives(lesson: Lesson): string[] {
  return lesson.sections.slice(0, 4).map((s) => `Understand ${s.heading.toLowerCase()}.`);
}
function deriveTakeaways(lesson: Lesson): string[] {
  return lesson.sections.slice(0, 3).map((s) => {
    const first = s.body.split(/(?<=\.)\s/)[0] ?? s.body;
    return first.length > 200 ? first.slice(0, 197) + "…" : first;
  });
}

// silence unused-import lint
void awardXP;
