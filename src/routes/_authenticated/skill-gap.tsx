import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Target, X } from "lucide-react";
import { Card, PageHeader, Btn } from "@/components/ui-kit";
import { useServerFn } from "@tanstack/react-start";
import { generateAI } from "@/lib/ai.functions";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/skill-gap")({ component: SkillGap });

const ROLES = ["Data Analyst", "Data Scientist", "Software Engineer", "AI Engineer", "Full Stack Developer"];

type Result = {
  matched_skills: string[];
  missing_skills: { name: string; priority: "high" | "medium" | "low"; why: string }[];
  roadmap_steps: { step: string; weeks: number }[];
  readiness_score: number;
};

function SkillGap() {
  const [input, setInput] = useState("");
  const [skills, setSkills] = useState<string[]>([]);
  const [role, setRole] = useState(ROLES[0]);
  const [result, setResult] = useState<Result | null>(null);
  const [loading, setLoading] = useState(false);
  const generate = useServerFn(generateAI);

  function addSkill() {
    const t = input.trim();
    if (!t) return;
    if (!skills.includes(t)) setSkills([...skills, t]);
    setInput("");
  }

  async function analyze() {
    if (skills.length === 0) { toast.error("Add at least one skill"); return; }
    setLoading(true); setResult(null);
    try {
      const { content } = await generate({ data: {
        system: "You are a senior tech career coach. Return strict JSON with fields: matched_skills (string[]), missing_skills (array of {name, priority: 'high'|'medium'|'low', why}), roadmap_steps (array of {step, weeks: integer}), readiness_score (0-100 integer).",
        prompt: `Current skills: ${skills.join(", ")}\nTarget role: ${role}\n\nProduce a skill gap analysis with prioritised missing skills, a step-wise roadmap, and an overall readiness score.`,
        json: true,
      }});
      setResult(JSON.parse(content));
    } catch (e) { toast.error(e instanceof Error ? e.message : "Failed"); }
    finally { setLoading(false); }
  }

  return (
    <div>
      <PageHeader title="Skill Gap Analysis" subtitle="See exactly what you need to learn to land your target role." icon={Target} />
      <div className="grid lg:grid-cols-2 gap-6">
        <Card>
          <label className="text-sm font-medium">Your current skills</label>
          <div className="flex gap-2 mt-2">
            <input value={input} onChange={e=>setInput(e.target.value)} onKeyDown={e=>e.key==="Enter" && (e.preventDefault(), addSkill())}
              placeholder="e.g. Python, SQL, React"
              className="flex-1 bg-input border border-border rounded-lg px-3 py-2 text-sm outline-none focus:border-ring" />
            <Btn onClick={addSkill} type="button">Add</Btn>
          </div>
          <div className="flex flex-wrap gap-2 mt-3 min-h-10">
            {skills.map(s => (
              <span key={s} className="px-3 py-1 rounded-full bg-muted text-xs flex items-center gap-1">
                {s}<button onClick={()=>setSkills(skills.filter(x=>x!==s))}><X className="size-3" /></button>
              </span>
            ))}
          </div>

          <label className="text-sm font-medium mt-6 block">Target role</label>
          <div className="grid grid-cols-2 gap-2 mt-2">
            {ROLES.map(r => (
              <button key={r} onClick={()=>setRole(r)}
                className={`text-sm px-3 py-2 rounded-lg border ${role===r ? "border-primary bg-primary/10 text-foreground" : "border-border text-muted-foreground hover:bg-muted"}`}>
                {r}
              </button>
            ))}
          </div>
          <Btn onClick={analyze} disabled={loading} className="mt-6">{loading ? "Analyzing..." : "Run Analysis"}</Btn>
        </Card>

        <Card>
          {!result ? (
            <div className="text-muted-foreground text-center py-20">
              <Target className="size-10 mx-auto mb-3 opacity-40" />
              Your gap analysis will appear here.
            </div>
          ) : (
            <div>
              <div className="flex items-center justify-between mb-4">
                <div>
                  <div className="text-xs text-muted-foreground uppercase">Readiness</div>
                  <div className="text-3xl font-bold gradient-text">{result.readiness_score}%</div>
                </div>
              </div>
              <div className="h-2 bg-muted rounded-full overflow-hidden">
                <div className="h-full bg-gradient-primary" style={{ width: `${result.readiness_score}%` }} />
              </div>

              <h3 className="font-semibold mt-6 mb-2 text-success">Matched ({result.matched_skills.length})</h3>
              <div className="flex flex-wrap gap-2">
                {result.matched_skills.map(s => <span key={s} className="px-3 py-1 rounded-full bg-success/15 text-success text-xs">{s}</span>)}
              </div>

              <h3 className="font-semibold mt-6 mb-2 text-warning">Missing skills</h3>
              <div className="space-y-2">
                {result.missing_skills.map(m => (
                  <div key={m.name} className="border border-border rounded-lg p-3">
                    <div className="flex justify-between items-center">
                      <span className="font-medium">{m.name}</span>
                      <span className={`text-xs px-2 py-0.5 rounded-full ${m.priority==="high"?"bg-destructive/20 text-destructive":m.priority==="medium"?"bg-warning/20 text-warning":"bg-muted text-muted-foreground"}`}>{m.priority}</span>
                    </div>
                    <div className="text-xs text-muted-foreground mt-1">{m.why}</div>
                  </div>
                ))}
              </div>

              <h3 className="font-semibold mt-6 mb-2 text-primary">Recommended roadmap</h3>
              <ol className="space-y-2">
                {result.roadmap_steps.map((s, i) => (
                  <li key={i} className="flex gap-3 items-start">
                    <span className="size-6 rounded-full bg-gradient-primary text-primary-foreground text-xs grid place-items-center shrink-0">{i+1}</span>
                    <div className="flex-1"><span>{s.step}</span> <span className="text-xs text-muted-foreground">· {s.weeks}w</span></div>
                  </li>
                ))}
              </ol>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}
