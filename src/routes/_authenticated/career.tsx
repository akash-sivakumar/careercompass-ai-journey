import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Compass, Briefcase, IndianRupee, Code2 } from "lucide-react";
import { Card, PageHeader, Btn } from "@/components/ui-kit";
import { useServerFn } from "@tanstack/react-start";
import { generateAI } from "@/lib/ai.functions";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/career")({ component: CareerPage });

type Path = {
  title: string;
  fit_score: number;
  why: string;
  salary_inr_lpa: { junior: string; mid: string; senior: string };
  required_tech: string[];
  next_steps: string[];
};

function CareerPage() {
  const [skills, setSkills] = useState("");
  const [interests, setInterests] = useState("");
  const [education, setEducation] = useState("B.Tech CSE");
  const [paths, setPaths] = useState<Path[] | null>(null);
  const [loading, setLoading] = useState(false);
  const generate = useServerFn(generateAI);

  async function recommend() {
    if (!skills.trim()) { toast.error("Tell us your skills"); return; }
    setLoading(true); setPaths(null);
    try {
      const { content } = await generate({ data: {
        system: "You are an Indian tech career advisor. Return JSON: { paths: array of { title, fit_score (0-100), why, salary_inr_lpa: {junior, mid, senior}, required_tech: string[], next_steps: string[] } }. Provide 4 paths sorted by fit_score desc.",
        prompt: `Skills: ${skills}\nInterests: ${interests}\nEducation: ${education}\n\nSuggest career paths.`,
        json: true,
      }});
      setPaths((JSON.parse(content) as { paths: Path[] }).paths);
    } catch (e) { toast.error(e instanceof Error ? e.message : "Failed"); }
    finally { setLoading(false); }
  }

  return (
    <div>
      <PageHeader title="AI Career Recommendation" subtitle="Discover the best career paths matched to your profile." icon={Compass} />
      <Card className="mb-6">
        <div className="grid md:grid-cols-3 gap-4">
          <div>
            <label className="text-sm font-medium">Your skills</label>
            <textarea value={skills} onChange={e=>setSkills(e.target.value)} className="w-full mt-2 bg-input border border-border rounded-lg px-3 py-2 text-sm h-24 outline-none focus:border-ring" placeholder="Python, SQL, ML basics, Excel..." />
          </div>
          <div>
            <label className="text-sm font-medium">Interests</label>
            <textarea value={interests} onChange={e=>setInterests(e.target.value)} className="w-full mt-2 bg-input border border-border rounded-lg px-3 py-2 text-sm h-24 outline-none focus:border-ring" placeholder="AI research, building products, finance..." />
          </div>
          <div>
            <label className="text-sm font-medium">Education</label>
            <input value={education} onChange={e=>setEducation(e.target.value)} className="w-full mt-2 bg-input border border-border rounded-lg px-3 py-2 text-sm outline-none focus:border-ring" />
          </div>
        </div>
        <Btn onClick={recommend} disabled={loading} className="mt-5">{loading ? "Thinking..." : "Recommend Career Paths"}</Btn>
      </Card>

      {paths && (
        <div className="grid md:grid-cols-2 gap-4">
          {paths.map(p => (
            <Card key={p.title}>
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="size-10 rounded-xl bg-gradient-primary grid place-items-center"><Briefcase className="size-5 text-primary-foreground" /></div>
                  <div>
                    <div className="font-display font-semibold">{p.title}</div>
                    <div className="text-xs text-muted-foreground">Fit score: {p.fit_score}%</div>
                  </div>
                </div>
                <div className="text-2xl font-bold gradient-text">{p.fit_score}</div>
              </div>
              <p className="text-sm text-muted-foreground mt-3">{p.why}</p>

              <div className="mt-4 grid grid-cols-3 gap-2 text-center text-xs">
                {(["junior","mid","senior"] as const).map(k => (
                  <div key={k} className="p-2 rounded-lg bg-muted">
                    <div className="text-muted-foreground capitalize">{k}</div>
                    <div className="font-semibold inline-flex items-center"><IndianRupee className="size-3" />{p.salary_inr_lpa[k]} LPA</div>
                  </div>
                ))}
              </div>

              <div className="mt-4">
                <div className="text-xs uppercase text-muted-foreground mb-2 flex items-center gap-1"><Code2 className="size-3" /> Tech</div>
                <div className="flex flex-wrap gap-1.5">
                  {p.required_tech.map(t => <span key={t} className="px-2 py-0.5 rounded-full bg-muted text-xs">{t}</span>)}
                </div>
              </div>

              <div className="mt-4">
                <div className="text-xs uppercase text-muted-foreground mb-2">Next steps</div>
                <ul className="text-sm space-y-1">
                  {p.next_steps.map((s,i)=> <li key={i} className="text-muted-foreground">· {s}</li>)}
                </ul>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
