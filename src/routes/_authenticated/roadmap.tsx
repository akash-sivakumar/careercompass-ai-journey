import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { Map as MapIcon, CheckCircle2, Circle, CircleDot, Wrench, FolderGit2, Award, BookOpen, Activity, Clock, Briefcase, Loader2 } from "lucide-react";
import { Card, PageHeader, Btn } from "@/components/ui-kit";
import { SearchableSelect, ROADMAP_DOMAINS } from "@/components/searchable-select";
import { useServerFn } from "@tanstack/react-start";
import { generateAI } from "@/lib/ai.functions";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { logActivity, unlockAchievement } from "@/lib/gamification";
import { useUserProfile, saveArtifact } from "@/hooks/use-profile";

export const Route = createFileRoute("/_authenticated/roadmap")({ component: Roadmap });

type Level = {
  name: "Beginner" | "Intermediate" | "Advanced" | "Expert";
  timeline: string;
  topics: string[];
  tools: string[];
  projects: string[];
  certifications: string[];
  learning_resources: string[];
  practice_platforms: string[];
  job_opportunities: string[];
};
type RoadmapData = { levels: Level[] };
type Status = "not_started" | "in_progress" | "completed";

const LEVEL_COLORS: Record<string, string> = {
  Beginner: "from-success/40 to-success/10",
  Intermediate: "from-primary/40 to-primary/10",
  Advanced: "from-accent/40 to-accent/10",
  Expert: "from-warning/40 to-warning/10",
};

const STATUS_META: Record<Status, { label: string; cls: string }> = {
  not_started: { label: "Not started", cls: "text-muted-foreground border-border" },
  in_progress: { label: "In progress", cls: "text-primary border-primary/50 bg-primary/10" },
  completed: { label: "Completed", cls: "text-success border-success/50 bg-success/10" },
};

function Roadmap() {
  const { profile } = useUserProfile();
  const [cat, setCat] = useState(ROADMAP_DOMAINS[0]);
  const [data, setData] = useState<RoadmapData | null>(null);
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState<Record<string, Status>>({});
  const [savingKey, setSavingKey] = useState<string | null>(null);
  const [prefilled, setPrefilled] = useState(false);
  const generate = useServerFn(generateAI);

  // Prefill domain from selected career / target role
  useEffect(() => {
    if (prefilled || !profile) return;
    const cand = profile.selected_career || profile.target_role || profile.domain_interest;
    if (cand) {
      const match = ROADMAP_DOMAINS.find((d) => d.toLowerCase() === cand.toLowerCase())
        || ROADMAP_DOMAINS.find((d) => cand.toLowerCase().includes(d.toLowerCase()) || d.toLowerCase().includes(cand.toLowerCase()));
      if (match) setCat(match);
    }
    setPrefilled(true);
  }, [profile, prefilled]);

  // Load persisted progress whenever the domain changes
  useEffect(() => {
    (async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      const { data: rows } = await supabase.from("roadmap_progress")
        .select("level_index,topic,status").eq("user_id", user.id).eq("domain", cat);
      const map: Record<string, Status> = {};
      (rows ?? []).forEach((r) => { map[keyOf(r.level_index, r.topic)] = r.status as Status; });
      setProgress(map);
    })();
  }, [cat]);

  async function build() {
    setLoading(true); setData(null);
    try {
      const { content } = await generate({ data: {
        system: "You are a learning path designer. Return strict JSON: { levels: [{ name: 'Beginner'|'Intermediate'|'Advanced'|'Expert', timeline: string (e.g. '4-6 weeks'), topics: string[], tools: string[], projects: string[], certifications: string[], learning_resources: string[], practice_platforms: string[], job_opportunities: string[] }] } with all 4 levels in order.",
        prompt: `Build a complete professional learning roadmap for: ${cat}.`,
        json: true,
      }});
      const parsed = JSON.parse(content) as RoadmapData;
      setData(parsed);
      await saveArtifact("roadmap", cat, parsed);
      await logActivity("roadmap_generate", `Roadmap generated: ${cat}`, { xp: 50, meta: { domain: cat } });
      await unlockAchievement("first_roadmap", { silent: true });
      await unlockAchievement("roadmap_started", { silent: true });
      toast.success("+50 XP · Roadmap saved");
    } catch (e) { toast.error(e instanceof Error ? e.message : "Failed"); }
    finally { setLoading(false); }
  }

  async function setTopicStatus(levelIndex: number, topic: string, status: Status) {
    const k = keyOf(levelIndex, topic);
    const prev = progress[k] ?? "not_started";
    setSavingKey(k);
    setProgress((p) => ({ ...p, [k]: status }));
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { toast.error("Sign in required"); setProgress((p) => ({ ...p, [k]: prev })); return; }
      await supabase.from("roadmap_progress").upsert({
        user_id: user.id, domain: cat, level_index: levelIndex, topic, status,
        completed_at: status === "completed" ? new Date().toISOString() : null,
      }, { onConflict: "user_id,domain,level_index,topic" });
      if (status === "completed" && prev !== "completed") {
        await logActivity("roadmap_topic", `${cat}: ${topic}`, { xp: 15, meta: { domain: cat, topic, level: levelIndex } });
        toast.success(`+15 XP · ${topic}`);
        // Check level completion
        if (data) {
          const levelTopics = data.levels[levelIndex]?.topics ?? [];
          const done = levelTopics.every((t) => (t === topic ? true : (progress[keyOf(levelIndex, t)] === "completed")));
          if (done && levelTopics.length > 0) {
            const levelName = data.levels[levelIndex].name;
            await logActivity("roadmap_level", `${cat}: ${levelName} complete`, { xp: 50, meta: { domain: cat, level: levelIndex } });
            toast.success(`Level complete: ${levelName}! +50 XP`);
            await unlockAchievement(`roadmap_${cat.toLowerCase().replace(/\s+/g, "_")}_${levelName.toLowerCase()}`, { silent: true });
          }
        }
      }
    } catch (e) {
      setProgress((p) => ({ ...p, [k]: prev }));
      toast.error(e instanceof Error ? e.message : "Failed to save");
    } finally { setSavingKey(null); }
  }

  const totals = useMemo(() => {
    if (!data) return { total: 0, done: 0, inProg: 0 };
    let total = 0, done = 0, inProg = 0;
    data.levels.forEach((lv, i) => {
      lv.topics.forEach((t) => {
        total++;
        const s = progress[keyOf(i, t)];
        if (s === "completed") done++;
        else if (s === "in_progress") inProg++;
      });
    });
    return { total, done, inProg };
  }, [data, progress]);
  const pct = totals.total ? Math.round((totals.done / totals.total) * 100) : 0;

  return (
    <div>
      <PageHeader title="Personalized Learning Roadmap" subtitle="From beginner to expert — track each topic as you go." icon={MapIcon} />
      <Card className="mb-6">
        <label className="text-sm font-medium mb-2 block">Choose a domain</label>
        <div className="max-w-md"><SearchableSelect value={cat} onChange={setCat} options={ROADMAP_DOMAINS} placeholder="Search domains..." /></div>
        <Btn onClick={build} disabled={loading} className="mt-4">{loading ? "Building..." : "Generate Roadmap"}</Btn>
      </Card>

      {data && (
        <>
          <Card className="mb-6">
            <div className="flex items-center justify-between mb-2 flex-wrap gap-2">
              <div className="text-sm text-muted-foreground">Progress across all levels</div>
              <div className="text-sm font-medium">
                {totals.done}/{totals.total} completed
                {totals.inProg > 0 && <span className="text-primary"> · {totals.inProg} in progress</span>}
                <span> · {pct}%</span>
              </div>
            </div>
            <div className="h-2 bg-muted rounded-full overflow-hidden">
              <div className="h-full bg-gradient-primary transition-all duration-500" style={{ width: `${pct}%` }} />
            </div>
          </Card>

          <div className="relative">
            <div className="absolute left-4 md:left-6 top-0 bottom-0 w-px bg-gradient-to-b from-primary/60 via-accent/40 to-transparent" />
            <div className="space-y-5">
              {data.levels.map((level, idx) => {
                const lvlDone = level.topics.filter((t) => progress[keyOf(idx, t)] === "completed").length;
                const lvlPct = level.topics.length ? Math.round((lvlDone / level.topics.length) * 100) : 0;
                return (
                  <div key={level.name} className="relative pl-12 md:pl-16">
                    <div className={`absolute left-0 md:left-2 top-3 size-8 rounded-full grid place-items-center bg-gradient-to-br ${LEVEL_COLORS[level.name]} border border-border shadow-glow`}>
                      {lvlPct === 100 ? <CheckCircle2 className="size-4 text-success" /> : <CircleDot className="size-4 text-muted-foreground" />}
                    </div>
                    <Card>
                      <div className="flex items-center justify-between flex-wrap gap-2 mb-4">
                        <div className="min-w-0">
                          <div className="text-[10px] uppercase tracking-wider text-muted-foreground">Level {idx+1}</div>
                          <div className="font-display font-semibold text-lg">{level.name}</div>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-muted-foreground">{lvlDone}/{level.topics.length} · {lvlPct}%</span>
                          <span className="text-xs px-3 py-1 rounded-full bg-muted text-muted-foreground inline-flex items-center gap-1"><Clock className="size-3" />{level.timeline}</span>
                        </div>
                      </div>

                      {/* Topics with per-topic status */}
                      <div className="rounded-xl border border-border p-3 mb-4 bg-background/30">
                        <div className="text-xs uppercase text-muted-foreground mb-2 flex items-center gap-1"><BookOpen className="size-3" /> Topics</div>
                        <ul className="space-y-1.5">
                          {level.topics.map((topic) => {
                            const k = keyOf(idx, topic);
                            const s = progress[k] ?? "not_started";
                            const meta = STATUS_META[s];
                            const saving = savingKey === k;
                            const nextStatus: Status = s === "not_started" ? "in_progress" : s === "in_progress" ? "completed" : "not_started";
                            return (
                              <li key={topic} className="flex items-center gap-2">
                                <button
                                  onClick={() => setTopicStatus(idx, topic, nextStatus)}
                                  disabled={saving}
                                  className="size-6 shrink-0 grid place-items-center rounded-full border border-border hover:border-primary transition"
                                  title={`Click to mark as ${STATUS_META[nextStatus].label.toLowerCase()}`}>
                                  {saving ? <Loader2 className="size-3 animate-spin" />
                                    : s === "completed" ? <CheckCircle2 className="size-3.5 text-success" />
                                    : s === "in_progress" ? <CircleDot className="size-3.5 text-primary" />
                                    : <Circle className="size-3.5 text-muted-foreground" />}
                                </button>
                                <span className={`text-sm flex-1 min-w-0 truncate ${s === "completed" ? "line-through text-muted-foreground" : ""}`}>{topic}</span>
                                <span className={`text-[10px] px-2 py-0.5 rounded-full border ${meta.cls} shrink-0`}>{meta.label}</span>
                              </li>
                            );
                          })}
                        </ul>
                      </div>

                      <div className="grid md:grid-cols-2 gap-4">
                        <Section icon={Wrench} label="Tools" items={level.tools} />
                        <Section icon={FolderGit2} label="Projects" items={level.projects} accent />
                        <Section icon={Award} label="Certifications" items={level.certifications} />
                        <Section icon={BookOpen} label="Learning Resources" items={level.learning_resources} />
                        <Section icon={Activity} label="Practice Platforms" items={level.practice_platforms} />
                      </div>

                      {level.job_opportunities?.length > 0 && (
                        <div className="mt-4 rounded-lg border border-border p-3">
                          <div className="text-xs uppercase text-muted-foreground mb-2 flex items-center gap-1"><Briefcase className="size-3" /> Job Opportunities</div>
                          <div className="flex flex-wrap gap-1.5">
                            {level.job_opportunities.map((j) => <span key={j} className="px-2 py-0.5 rounded-full bg-primary/10 text-primary text-xs">{j}</span>)}
                          </div>
                        </div>
                      )}
                    </Card>
                  </div>
                );
              })}
            </div>
          </div>
        </>
      )}
    </div>
  );
}

function keyOf(levelIndex: number, topic: string): string { return `${levelIndex}::${topic}`; }

function Section({ icon: Icon, label, items, accent }: { icon: React.ComponentType<{className?:string}>; label: string; items: string[]; accent?: boolean }) {
  if (!items || items.length === 0) return null;
  return (
    <div className="rounded-lg border border-border p-3 bg-background/30">
      <div className="text-xs uppercase text-muted-foreground mb-2 flex items-center gap-1"><Icon className="size-3" /> {label}</div>
      <ul className="space-y-1">
        {items.map((s,i)=> <li key={i} className={`text-sm ${accent ? "text-accent" : "text-muted-foreground"}`}>· {s}</li>)}
      </ul>
    </div>
  );
}
