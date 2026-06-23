import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Target, TrendingUp, Clock, Award, BookOpen, Sparkles } from "lucide-react";
import { Card, PageHeader, Btn } from "@/components/ui-kit";
import { MultiSkillSelect, SearchableSelect, SKILL_GROUPS, TARGET_ROLES } from "@/components/searchable-select";
import { useServerFn } from "@tanstack/react-start";
import { generateAI } from "@/lib/ai.functions";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/skill-gap")({ component: SkillGap });

type Result = {
  skill_match_percentage: number;
  matched_skills: string[];
  missing_skills: { name: string; priority: "high" | "medium" | "low"; why: string }[];
  recommended_learning_path: { step: string; weeks: number; resources?: string[] }[];
  industry_demand_level: "Low" | "Medium" | "High" | "Very High";
  estimated_learning_time: string;
  career_readiness_score: number;
};

function SkillGap() {
  const [skills, setSkills] = useState<string[]>([]);
  const [role, setRole] = useState(TARGET_ROLES[0]);
  const [result, setResult] = useState<Result | null>(null);
  const [loading, setLoading] = useState(false);
  const generate = useServerFn(generateAI);

  async function analyze() {
    if (skills.length === 0) { toast.error("Select at least one skill"); return; }
    setLoading(true); setResult(null);
    try {
      const { content } = await generate({ data: {
        system: "You are a senior tech career coach. Return strict JSON: { skill_match_percentage (0-100 int), matched_skills (string[]), missing_skills (array of {name, priority: 'high'|'medium'|'low', why}), recommended_learning_path (array of {step, weeks: int, resources: string[]}), industry_demand_level ('Low'|'Medium'|'High'|'Very High'), estimated_learning_time (e.g. '3-6 months'), career_readiness_score (0-100 int) }.",
        prompt: `Current skills: ${skills.join(", ")}\nTarget role: ${role}\n\nAnalyse the skill gap.`,
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
          <div className="mt-2">
            <MultiSkillSelect values={skills} onChange={setSkills} groups={SKILL_GROUPS} />
          </div>

          <label className="text-sm font-medium mt-6 block">Target role</label>
          <div className="mt-2">
            <SearchableSelect value={role} onChange={setRole} options={TARGET_ROLES} placeholder="Search target role..." />
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
              <div className="grid grid-cols-2 gap-3 mb-4">
                <div className="rounded-xl border border-border p-3">
                  <div className="text-[10px] uppercase text-muted-foreground tracking-wider">Skill Match</div>
                  <div className="text-2xl font-bold gradient-text">{result.skill_match_percentage}%</div>
                  <div className="h-1.5 mt-2 bg-muted rounded-full overflow-hidden"><div className="h-full bg-gradient-primary" style={{width:`${result.skill_match_percentage}%`}}/></div>
                </div>
                <div className="rounded-xl border border-border p-3">
                  <div className="text-[10px] uppercase text-muted-foreground tracking-wider">Readiness</div>
                  <div className="text-2xl font-bold gradient-text">{result.career_readiness_score}%</div>
                  <div className="h-1.5 mt-2 bg-muted rounded-full overflow-hidden"><div className="h-full bg-gradient-primary" style={{width:`${result.career_readiness_score}%`}}/></div>
                </div>
                <div className="rounded-xl border border-border p-3 flex items-center gap-2">
                  <TrendingUp className="size-4 text-primary" />
                  <div>
                    <div className="text-[10px] uppercase text-muted-foreground tracking-wider">Demand</div>
                    <div className="text-sm font-semibold">{result.industry_demand_level}</div>
                  </div>
                </div>
                <div className="rounded-xl border border-border p-3 flex items-center gap-2">
                  <Clock className="size-4 text-accent" />
                  <div>
                    <div className="text-[10px] uppercase text-muted-foreground tracking-wider">Learning Time</div>
                    <div className="text-sm font-semibold">{result.estimated_learning_time}</div>
                  </div>
                </div>
              </div>

              <h3 className="font-semibold mt-2 mb-2 text-success flex items-center gap-1"><Award className="size-4" />Matched ({result.matched_skills.length})</h3>
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

              <h3 className="font-semibold mt-6 mb-2 text-primary flex items-center gap-1"><BookOpen className="size-4" />Recommended Learning Path</h3>
              <ol className="space-y-2">
                {result.recommended_learning_path.map((s, i) => (
                  <li key={i} className="flex gap-3 items-start">
                    <span className="size-6 rounded-full bg-gradient-primary text-primary-foreground text-xs grid place-items-center shrink-0">{i+1}</span>
                    <div className="flex-1">
                      <div className="text-sm"><span>{s.step}</span> <span className="text-xs text-muted-foreground">· {s.weeks}w</span></div>
                      {s.resources && s.resources.length > 0 && <div className="text-xs text-muted-foreground mt-0.5 flex items-center gap-1"><Sparkles className="size-3" />{s.resources.join(" · ")}</div>}
                    </div>
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
