import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Map as MapIcon, CheckCircle2, Circle } from "lucide-react";
import { Card, PageHeader, Btn } from "@/components/ui-kit";
import { useServerFn } from "@tanstack/react-start";
import { generateAI } from "@/lib/ai.functions";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/roadmap")({ component: Roadmap });

const CATEGORIES = ["Data Analytics", "Machine Learning", "Python", "SQL", "Power BI", "Web Development"];

type Step = { title: string; resources: string[]; project?: string };
type Level = { name: "Beginner" | "Intermediate" | "Advanced"; weeks: number; steps: Step[] };
type RoadmapData = { levels: Level[] };

function Roadmap() {
  const [cat, setCat] = useState(CATEGORIES[0]);
  const [data, setData] = useState<RoadmapData | null>(null);
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState<Record<string, boolean>>({});
  const generate = useServerFn(generateAI);

  async function build() {
    setLoading(true); setData(null);
    try {
      const { content } = await generate({ data: {
        system: "You are a learning path designer. Return strict JSON: { levels: [{ name: 'Beginner'|'Intermediate'|'Advanced', weeks: int, steps: [{title, resources: string[], project?: string }] }] } with 3 levels.",
        prompt: `Build a complete personalized learning roadmap for: ${cat}.`,
        json: true,
      }});
      setData(JSON.parse(content));
    } catch (e) { toast.error(e instanceof Error ? e.message : "Failed"); }
    finally { setLoading(false); }
  }

  const total = data?.levels.flatMap(l => l.steps).length ?? 0;
  const completed = Object.values(done).filter(Boolean).length;
  const pct = total ? Math.round((completed / total) * 100) : 0;

  return (
    <div>
      <PageHeader title="Personalized Learning Roadmap" subtitle="From beginner to advanced — structured, project-based learning." icon={MapIcon} />
      <Card className="mb-6">
        <div className="text-sm font-medium mb-2">Choose a category</div>
        <div className="flex flex-wrap gap-2">
          {CATEGORIES.map(c => (
            <button key={c} onClick={()=>setCat(c)} className={`px-3 py-1.5 rounded-full text-sm border ${cat===c ? "border-primary bg-primary/10" : "border-border text-muted-foreground hover:bg-muted"}`}>{c}</button>
          ))}
        </div>
        <Btn onClick={build} disabled={loading} className="mt-4">{loading ? "Building..." : "Generate Roadmap"}</Btn>
      </Card>

      {data && (
        <>
          <Card className="mb-6">
            <div className="flex items-center justify-between mb-2">
              <div className="text-sm text-muted-foreground">Progress</div>
              <div className="text-sm font-medium">{completed}/{total} steps · {pct}%</div>
            </div>
            <div className="h-2 bg-muted rounded-full overflow-hidden">
              <div className="h-full bg-gradient-primary transition-all" style={{ width: `${pct}%` }} />
            </div>
          </Card>

          <div className="grid lg:grid-cols-3 gap-4">
            {data.levels.map(level => (
              <Card key={level.name}>
                <div className="flex items-center justify-between mb-3">
                  <div className="font-display font-semibold">{level.name}</div>
                  <span className="text-xs text-muted-foreground">{level.weeks} weeks</span>
                </div>
                <ol className="space-y-3">
                  {level.steps.map((s, i) => {
                    const k = `${level.name}-${i}`;
                    return (
                      <li key={k}>
                        <button onClick={()=>setDone(d=>({...d,[k]:!d[k]}))} className="flex gap-2 items-start text-left w-full">
                          {done[k] ? <CheckCircle2 className="size-4 text-success mt-0.5 shrink-0" /> : <Circle className="size-4 text-muted-foreground mt-0.5 shrink-0" />}
                          <div className="flex-1">
                            <div className={`text-sm font-medium ${done[k]?"line-through text-muted-foreground":""}`}>{s.title}</div>
                            {s.resources?.length>0 && <div className="text-xs text-muted-foreground mt-1">{s.resources.join(" · ")}</div>}
                            {s.project && <div className="text-xs text-accent mt-1">🛠 Project: {s.project}</div>}
                          </div>
                        </button>
                      </li>
                    );
                  })}
                </ol>
              </Card>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
