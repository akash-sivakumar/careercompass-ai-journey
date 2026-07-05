import { createFileRoute, Link, notFound, useRouter } from "@tanstack/react-router";
import { getLesson, getTrack, topicSlug } from "@/content/learn";
import type { Lesson, Track } from "@/content/learn/types";
import { useEffect, useMemo, useRef, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { logActivity, unlockAchievement } from "@/lib/gamification";
import { toast } from "sonner";
import { useServerFn } from "@tanstack/react-start";
import { generateLesson } from "@/lib/learn-ai.functions";
import {
  ArrowLeft, CheckCircle2, Clock, Sparkles, Loader2, Lightbulb, Target as TargetIcon,
  StickyNote, BookmarkPlus, Copy, ExternalLink, BookOpen, Code2, Dumbbell,
  ClipboardList, HelpCircle, Link as LinkIcon, Save,
} from "lucide-react";

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

type TabKey = "overview" | "theory" | "examples" | "practice" | "quiz" | "assignment" | "notes" | "resources";

const TABS: { key: TabKey; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
  { key: "overview", label: "Overview", icon: TargetIcon },
  { key: "theory", label: "Theory", icon: BookOpen },
  { key: "examples", label: "Examples", icon: Code2 },
  { key: "practice", label: "Practice", icon: Dumbbell },
  { key: "quiz", label: "Quiz", icon: HelpCircle },
  { key: "assignment", label: "Assignment", icon: ClipboardList },
  { key: "notes", label: "Notes", icon: StickyNote },
  { key: "resources", label: "Resources", icon: LinkIcon },
];

function LessonPage() {
  const data = Route.useLoaderData() as LoaderData;
  const { track } = data;
  const router = useRouter();
  const gen = useServerFn(generateLesson);

  const [aiLesson, setAiLesson] = useState<Lesson | null>(null);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiError, setAiError] = useState<string | null>(null);

  const lesson: Lesson | null = data.kind === "seeded" ? data.lesson : aiLesson;
  const lessonSlug = data.kind === "seeded" ? data.lesson.slug : data.slug;

  const [tab, setTab] = useState<TabKey>("overview");
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [submitted, setSubmitted] = useState(false);
  const [alreadyDone, setAlreadyDone] = useState(false);
  const [notes, setNotes] = useState("");
  const [notesSaving, setNotesSaving] = useState(false);
  const [notesSavedAt, setNotesSavedAt] = useState<Date | null>(null);
  const notesTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const modules = track.seeded
    ? track.lessons.map((l) => ({ slug: l.slug, title: l.title }))
    : (track.syllabus ?? []).map((t) => ({ slug: topicSlug(t), title: t }));
  const idx = modules.findIndex((m) => m.slug === lessonSlug);
  const prev = idx > 0 ? modules[idx - 1] : null;
  const next = idx >= 0 && idx < modules.length - 1 ? modules[idx + 1] : null;

  // Load AI lesson
  useEffect(() => {
    setAnswers({}); setSubmitted(false); setAiError(null); setTab("overview");
    if (data.kind === "seeded") return;
    let cancelled = false;
    (async () => {
      setAiLoading(true);
      const artifactKind = `learn_lesson:${track.slug}:${data.slug}`;
      try {
        const { data: cached } = await supabase
          .from("ai_artifacts").select("data").eq("kind", artifactKind)
          .order("created_at", { ascending: false }).limit(1).maybeSingle();
        if (cached?.data && !cancelled) {
          setAiLesson(normalizeLesson(cached.data as never, data.slug, data.topic));
          setAiLoading(false); return;
        }
        const { lesson: gl } = await gen({ data: { language: track.language, topic: data.topic } });
        const normalized = normalizeLesson(gl, data.slug, data.topic);
        if (cancelled) return;
        setAiLesson(normalized);
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          await supabase.from("ai_artifacts").insert({
            user_id: user.id, kind: artifactKind,
            title: `${track.language}: ${data.topic}`, data: normalized as never,
          });
        }
      } catch (e) {
        if (!cancelled) setAiError(e instanceof Error ? e.message : "Failed to generate lesson.");
      } finally { if (!cancelled) setAiLoading(false); }
    })();
    return () => { cancelled = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [track.slug, data.kind === "ai" ? data.slug : ""]);

  // Load progress + notes
  useEffect(() => {
    (async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      const { data: row } = await supabase.from("lesson_progress")
        .select("status,notes").eq("user_id", user.id).eq("track", track.slug).eq("lesson_slug", lessonSlug).maybeSingle();
      setAlreadyDone(row?.status === "completed");
      setNotes((row?.notes as string) ?? "");
      await supabase.from("lesson_progress").upsert(
        { user_id: user.id, track: track.slug, lesson_slug: lessonSlug, status: row?.status ?? "in_progress" },
        { onConflict: "user_id,track,lesson_slug" },
      );
    })();
  }, [track.slug, lessonSlug]);

  // Autosave notes (debounced)
  useEffect(() => {
    if (notesTimer.current) clearTimeout(notesTimer.current);
    notesTimer.current = setTimeout(async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      setNotesSaving(true);
      await supabase.from("lesson_progress").upsert(
        { user_id: user.id, track: track.slug, lesson_slug: lessonSlug, notes },
        { onConflict: "user_id,track,lesson_slug" },
      );
      setNotesSaving(false); setNotesSavedAt(new Date());
    }, 900);
    return () => { if (notesTimer.current) clearTimeout(notesTimer.current); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [notes]);

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
      if ((count ?? 0) >= modules.length && modules.length > 0) {
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
  const exercises = deriveExercises(lesson, track);
  const assignment = deriveAssignment(lesson, track);
  const resources = buildResources(track, lesson);

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <Link to="/learn/$track" params={{ track: track.slug }} className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"><ArrowLeft className="size-4" /> {track.language} lessons</Link>

      <header>
        <div className="text-xs uppercase tracking-widest text-muted-foreground flex items-center gap-2 flex-wrap">
          <span>Lesson {idx + 1} of {modules.length}</span>
          {data.kind === "ai" && <span className="inline-flex items-center gap-1 text-primary"><Sparkles className="size-3" /> AI-tutored</span>}
          {alreadyDone && <span className="inline-flex items-center gap-1 text-success"><CheckCircle2 className="size-3" /> Completed</span>}
        </div>
        <h1 className="text-2xl sm:text-3xl font-display font-bold mt-1">{lesson.title}</h1>
        <p className="text-sm text-muted-foreground mt-1 flex items-center gap-3 flex-wrap">
          <span>{lesson.summary}</span>
          <span className="flex items-center gap-1 shrink-0"><Clock className="size-3" />{lesson.minutes}m</span>
        </p>
        <div className="mt-3 flex gap-2 flex-wrap">
          <button onClick={bookmark} className="inline-flex items-center gap-1 text-xs px-3 py-1.5 rounded-lg border border-border hover:border-primary"><BookmarkPlus className="size-3" /> Bookmark</button>
          {!alreadyDone && (
            <button onClick={complete} className="inline-flex items-center gap-1 text-xs px-3 py-1.5 rounded-lg bg-gradient-primary text-primary-foreground shadow-glow">
              <CheckCircle2 className="size-3" /> Mark as complete
            </button>
          )}
        </div>
      </header>

      {/* Tabs */}
      <div className="sticky top-0 z-10 -mx-4 px-4 py-2 bg-background/85 backdrop-blur border-b border-border/70 overflow-x-auto">
        <div className="flex gap-1 min-w-max">
          {TABS.map((t) => {
            const Icon = t.icon;
            const active = tab === t.key;
            return (
              <button key={t.key} onClick={() => setTab(t.key)}
                className={`inline-flex items-center gap-1.5 text-xs sm:text-sm px-3 py-1.5 rounded-lg whitespace-nowrap transition-all ${
                  active ? "bg-primary text-primary-foreground shadow-glow" : "text-muted-foreground hover:text-foreground hover:bg-muted/40"
                }`}>
                <Icon className="size-3.5" /> {t.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Panels */}
      {tab === "overview" && (
        <section className="space-y-4">
          <Panel icon={TargetIcon} title="Learning objectives">
            <ul className="list-disc pl-5 space-y-1 text-sm">{objectives.map((o, i) => <li key={i}>{o}</li>)}</ul>
          </Panel>
          <Panel icon={Lightbulb} title="Key takeaways" tone="primary">
            <ul className="list-disc pl-5 space-y-1 text-sm">{takeaways.map((t, i) => <li key={i}>{t}</li>)}</ul>
          </Panel>
        </section>
      )}

      {tab === "theory" && (
        <div className="space-y-4">
          {lesson.sections.length === 0 && <EmptyState msg="No theory sections in this lesson." />}
          {lesson.sections.map((s, i) => (
            <Panel key={i} title={s.heading}>
              <p className="text-sm text-foreground/90 whitespace-pre-wrap leading-relaxed">{s.body}</p>
            </Panel>
          ))}
        </div>
      )}

      {tab === "examples" && (
        <div className="space-y-4">
          {(lesson.examples ?? []).length === 0 && <EmptyState msg="No code examples for this lesson." />}
          {(lesson.examples ?? []).map((ex, i) => <CodeBlock key={i} code={ex.code} language={ex.language} note={ex.note} />)}
        </div>
      )}

      {tab === "practice" && (
        <Panel icon={Dumbbell} title="Practice exercises">
          <ol className="list-decimal pl-5 space-y-3 text-sm">
            {exercises.map((e, i) => (
              <li key={i}>
                <div className="font-medium">{e.title}</div>
                <div className="text-muted-foreground text-xs mt-0.5">{e.detail}</div>
              </li>
            ))}
          </ol>
          <p className="text-xs text-muted-foreground mt-4">💡 Try each on paper or in your editor. Interactive in-browser runners land in the Practice Arena milestone.</p>
        </Panel>
      )}

      {tab === "quiz" && (
        <Panel icon={HelpCircle} title="Quick check">
          <div className="space-y-4">
            {lesson.quiz.map((q, qi) => (
              <div key={qi} className="space-y-2">
                <div className="text-sm font-medium">{qi + 1}. {q.q}</div>
                <div className="grid gap-2">
                  {q.options.map((opt, oi) => {
                    const chosen = answers[qi] === oi;
                    const correct = q.answer === oi;
                    const cls = submitted
                      ? correct ? "border-success bg-success/10"
                        : chosen ? "border-destructive bg-destructive/10"
                        : "border-border"
                      : chosen ? "border-primary bg-primary/10" : "border-border hover:border-primary/50";
                    return (
                      <button key={oi} disabled={submitted} onClick={() => setAnswers({ ...answers, [qi]: oi })}
                        className={`text-left text-sm px-3 py-2 rounded-lg border ${cls} transition-all disabled:cursor-not-allowed`}>{opt}</button>
                    );
                  })}
                </div>
                {submitted && q.explain && <div className="text-xs text-muted-foreground">💡 {q.explain}</div>}
              </div>
            ))}
            {!submitted ? (
              <button onClick={complete} disabled={Object.keys(answers).length < lesson.quiz.length}
                className="w-full py-2.5 rounded-lg bg-gradient-primary text-primary-foreground font-medium shadow-glow disabled:opacity-50">
                Submit &amp; mark complete
              </button>
            ) : (
              <div className="text-center py-2 text-sm">Score: <strong>{score}/{lesson.quiz.length}</strong></div>
            )}
          </div>
        </Panel>
      )}

      {tab === "assignment" && (
        <Panel icon={ClipboardList} title="Assignment">
          <div className="text-sm font-medium">{assignment.title}</div>
          <p className="text-sm text-muted-foreground mt-2 whitespace-pre-wrap leading-relaxed">{assignment.brief}</p>
          <div className="mt-3">
            <div className="text-xs uppercase tracking-widest text-muted-foreground mb-1">Deliverables</div>
            <ul className="list-disc pl-5 text-sm space-y-1">
              {assignment.deliverables.map((d, i) => <li key={i}>{d}</li>)}
            </ul>
          </div>
        </Panel>
      )}

      {tab === "notes" && (
        <Panel icon={StickyNote} title="My notes">
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Take notes as you learn — autosaved to your account."
            className="w-full min-h-[280px] resize-y bg-input border border-border rounded-xl px-3 py-2 text-sm outline-none focus:border-ring font-mono"
          />
          <div className="mt-2 text-xs text-muted-foreground flex items-center gap-1.5">
            {notesSaving ? <><Loader2 className="size-3 animate-spin" /> Saving…</>
              : notesSavedAt ? <><Save className="size-3" /> Saved {notesSavedAt.toLocaleTimeString()}</>
              : <>Autosaves as you type.</>}
          </div>
        </Panel>
      )}

      {tab === "resources" && (
        <Panel icon={LinkIcon} title="External resources">
          <p className="text-xs text-muted-foreground mb-3">Curated links to trusted docs and tutorials for this topic.</p>
          <div className="grid sm:grid-cols-2 gap-2">
            {resources.map((r) => (
              <a key={r.url} href={r.url} target="_blank" rel="noopener noreferrer"
                className="group flex items-start gap-2 p-3 rounded-lg border border-border hover:border-primary hover:bg-primary/5 transition-all">
                <div className="text-lg leading-none pt-0.5">{r.emoji}</div>
                <div className="min-w-0 flex-1">
                  <div className="text-sm font-medium truncate">{r.source}</div>
                  <div className="text-xs text-muted-foreground truncate">{r.title}</div>
                </div>
                <ExternalLink className="size-3.5 text-muted-foreground group-hover:text-primary shrink-0 mt-1" />
              </a>
            ))}
          </div>
        </Panel>
      )}

      {/* Prev / Next */}
      <nav className="flex flex-col sm:flex-row gap-3">
        {prev ? (
          <Link to="/learn/$track/$slug" params={{ track: track.slug, slug: prev.slug }}
            className="flex-1 px-4 py-3 rounded-xl border border-border hover:border-primary text-sm min-w-0">
            <div className="text-xs text-muted-foreground">← Previous</div>
            <div className="font-medium truncate">{prev.title}</div>
          </Link>
        ) : <div className="flex-1 hidden sm:block" />}
        {next ? (
          <Link to="/learn/$track/$slug" params={{ track: track.slug, slug: next.slug }}
            className="flex-1 px-4 py-3 rounded-xl border border-border hover:border-primary text-sm sm:text-right min-w-0">
            <div className="text-xs text-muted-foreground">Next →</div>
            <div className="font-medium truncate">{next.title}</div>
          </Link>
        ) : (
          <Link to="/learn/$track" params={{ track: track.slug }}
            className="flex-1 px-4 py-3 rounded-xl border border-border hover:border-primary text-sm sm:text-right">
            <div className="text-xs text-muted-foreground">Finish →</div>
            <div className="font-medium">Back to track</div>
          </Link>
        )}
      </nav>
    </div>
  );
}

// ---------- helpers & subcomponents ----------

function Panel({ title, icon: Icon, children, tone }: { title: string; icon?: React.ComponentType<{ className?: string }>; children: React.ReactNode; tone?: "primary" }) {
  const cls = tone === "primary" ? "border-primary/30 bg-primary/5" : "border-border bg-card/60";
  return (
    <section className={`rounded-2xl border ${cls} p-5`}>
      <h2 className="font-display font-semibold text-sm flex items-center gap-2 mb-2">
        {Icon && <Icon className="size-4 text-primary" />} {title}
      </h2>
      {children}
    </section>
  );
}

function EmptyState({ msg }: { msg: string }) {
  return <div className="rounded-xl border border-dashed border-border p-6 text-center text-sm text-muted-foreground">{msg}</div>;
}

function CodeBlock({ code, language, note }: { code: string; language: string; note?: string }) {
  const [copied, setCopied] = useState(false);
  async function copy() {
    try { await navigator.clipboard.writeText(code); setCopied(true); setTimeout(() => setCopied(false), 1200); } catch { /* ignore */ }
  }
  return (
    <div className="rounded-2xl border border-border overflow-hidden">
      <div className="px-4 py-2 text-xs uppercase tracking-widest text-muted-foreground bg-muted/40 border-b border-border flex justify-between items-center gap-2">
        <span className="truncate">Example · {language}{note ? ` — ${note}` : ""}</span>
        <button onClick={copy} className="inline-flex items-center gap-1 text-[11px] px-2 py-1 rounded-md hover:bg-muted shrink-0">
          <Copy className="size-3" /> {copied ? "Copied" : "Copy"}
        </button>
      </div>
      <pre className="p-4 overflow-x-auto text-sm bg-background"><code>{code}</code></pre>
    </div>
  );
}

function normalizeLesson(raw: unknown, slug: string, fallbackTitle: string): Lesson {
  const r = (raw ?? {}) as Record<string, unknown>;
  const sections = Array.isArray(r.sections) ? r.sections as Array<Record<string, unknown>> : [];
  const examples = Array.isArray(r.examples) ? r.examples as Array<Record<string, unknown>> : [];
  const quiz = Array.isArray(r.quiz) ? r.quiz as Array<Record<string, unknown>> : [];
  return {
    slug,
    title: String(r.title ?? fallbackTitle),
    minutes: Number.isFinite(r.minutes as number) ? Math.max(3, Math.min(60, Number(r.minutes))) : 12,
    summary: String(r.summary ?? `Lesson on ${fallbackTitle}.`),
    sections: sections.map((s) => ({ heading: String(s.heading ?? "Overview"), body: String(s.body ?? "") })),
    examples: examples.map((e) => ({
      language: String(e.language ?? "text"),
      code: String(e.code ?? ""),
      note: e.note ? String(e.note) : undefined,
    })),
    quiz: quiz
      .filter((q) => Array.isArray(q.options) && (q.options as unknown[]).length >= 2)
      .map((q) => {
        const opts = (q.options as unknown[]).map((o) => String(o));
        return {
          q: String(q.q ?? ""),
          options: opts,
          answer: Math.max(0, Math.min(opts.length - 1, Number(q.answer) || 0)),
          explain: q.explain ? String(q.explain) : undefined,
        };
      }),
  };
}

function deriveObjectives(lesson: Lesson): string[] {
  const base = lesson.sections.slice(0, 4).map((s) => `Understand ${s.heading.toLowerCase()}.`);
  if (base.length === 0) base.push(`Grasp the fundamentals of ${lesson.title}.`);
  base.push(`Apply what you learned in the practice exercises and quiz.`);
  return base;
}
function deriveTakeaways(lesson: Lesson): string[] {
  const t = lesson.sections.slice(0, 3).map((s) => {
    const first = s.body.split(/(?<=\.)\s/)[0] ?? s.body;
    return first.length > 200 ? first.slice(0, 197) + "…" : first;
  }).filter(Boolean);
  return t.length ? t : [`Review ${lesson.title} regularly to build long-term recall.`];
}

function deriveExercises(lesson: Lesson, track: Track): { title: string; detail: string }[] {
  return [
    { title: `Rewrite the first example in ${track.language} without looking.`, detail: `Focus on the syntax pattern shown for ${lesson.title}.` },
    { title: `Change one variable / condition and predict the output.`, detail: `Then run it (or trace it) to verify your prediction.` },
    { title: `Explain ${lesson.title} in your own words.`, detail: `Two–three sentences. Teaching forces understanding.` },
    { title: `Find one real-world use case for ${lesson.title}.`, detail: `Search a project on GitHub and note where the concept is applied.` },
  ];
}

function deriveAssignment(lesson: Lesson, track: Track): { title: string; brief: string; deliverables: string[] } {
  return {
    title: `Mini assignment: apply ${lesson.title}`,
    brief: `Build a small script or notebook that demonstrates ${lesson.title.toLowerCase()} in ${track.language}. Keep it under 50 lines. Focus on clarity, not cleverness.`,
    deliverables: [
      `A code file that runs end-to-end.`,
      `A short README (3–5 lines) explaining what the code does and why.`,
      `One screenshot of the output or a short note describing the result.`,
    ],
  };
}

type Resource = { source: string; title: string; url: string; emoji: string };

function buildResources(track: Track, lesson: Lesson): Resource[] {
  const q = encodeURIComponent(`${track.language} ${lesson.title}`);
  const list: Resource[] = [
    { source: "W3Schools", emoji: "📘", title: `${track.language} tutorial`, url: `https://www.w3schools.com/${w3Slug(track.language)}/` },
    { source: "GeeksforGeeks", emoji: "🟩", title: `${lesson.title} — search`, url: `https://www.geeksforgeeks.org/?s=${q}` },
    { source: "freeCodeCamp", emoji: "🟢", title: `freeCodeCamp articles`, url: `https://www.freecodecamp.org/news/search/?query=${q}` },
    { source: "MDN Web Docs", emoji: "🦊", title: `MDN reference`, url: `https://developer.mozilla.org/en-US/search?q=${q}` },
    { source: "Microsoft Learn", emoji: "🟦", title: `Microsoft Learn`, url: `https://learn.microsoft.com/en-us/search/?terms=${q}` },
    { source: "Official docs", emoji: "📚", title: officialDocsLabel(track), url: officialDocsUrl(track) },
  ];
  return list;
}

function w3Slug(lang: string): string {
  const m: Record<string, string> = {
    Python: "python", SQL: "sql", JavaScript: "js", TypeScript: "typescript",
    Java: "java", "C++": "cpp", C: "c", "R Programming": "r",
  };
  return m[lang] ?? "python";
}
function officialDocsLabel(t: Track): string { return `${t.language} official documentation`; }
function officialDocsUrl(t: Track): string {
  const m: Record<string, string> = {
    python: "https://docs.python.org/3/",
    sql: "https://www.postgresql.org/docs/current/sql.html",
    javascript: "https://developer.mozilla.org/en-US/docs/Web/JavaScript",
    typescript: "https://www.typescriptlang.org/docs/",
    java: "https://docs.oracle.com/en/java/",
    cpp: "https://en.cppreference.com/",
    c: "https://en.cppreference.com/w/c",
    r: "https://cran.r-project.org/manuals.html",
    "web-development": "https://developer.mozilla.org/en-US/docs/Learn",
    "data-analytics": "https://learn.microsoft.com/en-us/power-bi/",
    "data-science": "https://scikit-learn.org/stable/",
    "machine-learning": "https://scikit-learn.org/stable/",
    ai: "https://platform.openai.com/docs",
    "ai-engineering": "https://python.langchain.com/",
    "cloud-computing": "https://docs.aws.amazon.com/",
    "cyber-security": "https://owasp.org/www-project-top-ten/",
    devops: "https://kubernetes.io/docs/home/",
    "ui-ux-design": "https://help.figma.com/hc/en-us",
    "software-engineering": "https://roadmap.sh/computer-science",
    "mobile-development": "https://docs.flutter.dev/",
    "aptitude-placement": "https://www.indiabix.com/",
  };
  return m[t.slug] ?? "https://roadmap.sh/";
}
