import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Map as MapIcon, CheckCircle2, Circle, Wrench, FolderGit2, Award, BookOpen, Activity, Clock, Briefcase } from "lucide-react";
import { Card, PageHeader, Btn } from "@/components/ui-kit";
import { SearchableSelect, ROADMAP_DOMAINS } from "@/components/searchable-select";
import { useServerFn } from "@tanstack/react-start";
import { generateAI } from "@/lib/ai.functions";
import { toast } from "sonner";

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

const LEVEL_COLORS: Record<string, string> = {
  Beginner: "from-success/40 to-success/10",
  Intermediate: "from-primary/40 to-primary/10",
  Advanced: "from-accent/40 to-accent/10",
  Expert: "from-warning/40 to-warning/10",
};

function Roadmap() {
  const [cat, setCat] = useState(ROADMAP_DOMAINS[0]);
  const [data, setData] = useState<RoadmapData | null>(null);
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState<Record<string, boolean>>({});
  const generate = useServerFn(generateAI);

  async function build() {
    setLoading(true); setData(null);
    try {
      const { content } = await generate({ data: {
        system: "You are a learning path designer. Return strict JSON: { levels: [{ name: 'Beginner'|'Intermediate'|'Advanced'|'Expert', timeline: string (e.g. '4-6 weeks'), topics: string[], tools: string[], projects: string[], certifications: string[], learning_resources: string[], practice_platforms: string[], job_opportunities: string[] }] } with all 4 levels in order.",
        prompt: `Build a complete professional learning roadmap for: ${cat}.`,
        json: true,
      }});
      setData(JSON.parse(content));
      setDone({});
    } catch (e) { toast.error(e instanceof Error ? e.message : "Failed"); }
    finally { setLoading(false); }
  }

  const total = data?.levels.length ?? 0;
  const completed = Object.values(done).filter(Boolean).length;
  const pct = total ? Math.round((completed / total) * 100) : 0;

  return (
    <div>
      <PageHeader title="Personalized Learning Roadmap" subtitle="From beginner to expert — structured, project-based learning." icon={MapIcon} />
      <Card className="mb-6">
        <label className="text-sm font-medium mb-2 block">Choose a domain</label>
        <div className="max-w-md"><SearchableSelect value={cat} onChange={setCat} options={ROADMAP_DOMAINS} placeholder="Search domains..." /></div>
        <Btn onClick={build} disabled={loading} className="mt-4">{loading ? "Building..." : "Generate Roadmap"}</Btn>
      </Card>

      {data && (
        <>
          <Card className="mb-6">
            <div className="flex items-center justify-between mb-2">
              <div className="text-sm text-muted-foreground">Progress</div>
              <div className="text-sm font-medium">{completed}/{total} levels · {pct}%</div>
            </div>
            <div className="h-2 bg-muted rounded-full overflow-hidden">
              <div className="h-full bg-gradient-primary transition-all" style={{ width: `${pct}%` }} />
            </div>
          </Card>

          <div className="relative">
            <div className="absolute left-4 md:left-6 top-0 bottom-0 w-px bg-gradient-to-b from-primary/60 via-accent/40 to-transparent" />
            <div className="space-y-5">
              {data.levels.map((level, idx) => {
                const k = `level-${idx}`;
                const isDone = !!done[k];
                return (
                  <div key={level.name} className="relative pl-12 md:pl-16">
                    <button onClick={()=>setDone(d=>({...d,[k]:!d[k]}))}
                      className={`absolute left-0 md:left-2 top-3 size-8 rounded-full grid place-items-center bg-gradient-to-br ${LEVEL_COLORS[level.name]} border border-border shadow-glow`}>
                      {isDone ? <CheckCircle2 className="size-4 text-success" /> : <Circle className="size-4 text-muted-foreground" />}
                    </button>
                    <Card>
                      <div className="flex items-center justify-between flex-wrap gap-2 mb-4">
                        <div>
                          <div className="text-[10px] uppercase tracking-wider text-muted-foreground">Level {idx+1}</div>
                          <div className="font-display font-semibold text-lg">{level.name}</div>
                        </div>
                        <span className="text-xs px-3 py-1 rounded-full bg-muted text-muted-foreground inline-flex items-center gap-1"><Clock className="size-3" />{level.timeline}</span>
                      </div>

                      <div className="grid md:grid-cols-2 gap-4">
                        <Section icon={BookOpen} label="Topics" items={level.topics} />
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
                            {level.job_opportunities.map(j => <span key={j} className="px-2 py-0.5 rounded-full bg-primary/10 text-primary text-xs">{j}</span>)}
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
