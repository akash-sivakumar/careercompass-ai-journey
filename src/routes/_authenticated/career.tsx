import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Compass, Briefcase, IndianRupee, Code2, TrendingUp, Award, BookOpen, Building2, Check, Map as MapIcon } from "lucide-react";
import { Card, PageHeader, Btn } from "@/components/ui-kit";
import { MultiSkillSelect, SearchableSelect, SKILL_GROUPS, DOMAINS, EDUCATION_OPTIONS } from "@/components/searchable-select";
import { useServerFn } from "@tanstack/react-start";
import { generateAI } from "@/lib/ai.functions";
import { toast } from "sonner";
import { useUserProfile, saveArtifact, updateProfile } from "@/hooks/use-profile";
import { logActivity, unlockAchievement } from "@/lib/gamification";

export const Route = createFileRoute("/_authenticated/career")({ component: CareerPage });

type Path = {
  title: string;
  match_percentage: number;
  why: string;
  salary_inr_lpa: { junior: string; mid: string; senior: string };
  future_growth_score: number;
  required_skills: string[];
  certifications: string[];
  learning_resources: string[];
  job_market_insights: string;
};

function CareerPage() {
  const { profile, artifacts, refresh } = useUserProfile();
  const [skills, setSkills] = useState<string[]>([]);
  const [interests, setInterests] = useState<string[]>([]);
  const [education, setEducation] = useState("B.Tech CSE");
  const [paths, setPaths] = useState<Path[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [prefilled, setPrefilled] = useState(false);
  const [savingCareer, setSavingCareer] = useState<string | null>(null);
  const generate = useServerFn(generateAI);
  const navigate = useNavigate();

  useEffect(() => {
    if (prefilled || !profile) return;
    if (profile.skills?.length && skills.length === 0) setSkills(profile.skills.slice(0, 25));
    if (profile.interests?.length && interests.length === 0) setInterests(profile.interests);
    else if (profile.domain_interest && interests.length === 0) setInterests([profile.domain_interest]);
    if (profile.education) setEducation(profile.education);
    setPrefilled(true);
  }, [profile, prefilled, skills.length, interests.length]);

  async function recommend() {
    if (skills.length === 0) { toast.error("Select your skills"); return; }
    setLoading(true); setPaths(null);
    try {
      const resume = artifacts.resume?.data as { ats_score?: number; missing_skills?: string[] } | undefined;
      const gap = artifacts.skill_gap?.data as { missing_skills?: unknown[]; career_readiness_score?: number } | undefined;
      const ctx = `${resume ? `Resume score: ${resume.ats_score}. ` : ""}${gap ? `Prior readiness: ${gap.career_readiness_score}. ` : ""}`;
      const { content } = await generate({ data: {
        system: "You are an Indian tech career advisor. Return JSON: { paths: array of { title, match_percentage (0-100 int), why, salary_inr_lpa: {junior, mid, senior}, future_growth_score (0-100 int), required_skills: string[], certifications: string[], learning_resources: string[], job_market_insights: string } }. Provide 4 paths sorted by match_percentage desc.",
        prompt: `Skills: ${skills.join(", ")}\nInterests/Domains: ${interests.join(", ")}\nEducation: ${education}\n${ctx}\n\nSuggest best-fit career paths.`,
        json: true,
      }});
      const parsed = (JSON.parse(content) as { paths: Path[] }).paths;
      setPaths(parsed);
      await updateProfile({ skills, interests, education, domain_interest: interests[0] ?? null });
      await saveArtifact("career", `${skills.length} skills · ${education}`, parsed);
      await logActivity("career_recommend", `Career recommendations for ${education}`, { xp: 30, meta: { top: parsed[0]?.title } });
      toast.success("+30 XP · Recommendations saved");
    } catch (e) { toast.error(e instanceof Error ? e.message : "Failed"); }
    finally { setLoading(false); }
  }

  async function selectCareer(p: Path) {
    setSavingCareer(p.title);
    try {
      await updateProfile({ selected_career: p.title, target_role: p.title });
      await logActivity("career_selected", `Selected: ${p.title}`, { xp: 30, meta: { title: p.title } });
      await unlockAchievement("career_selected", { silent: true });
      await refresh();
      toast.success(`Career goal set: ${p.title}. Opening roadmap…`);
      setTimeout(() => navigate({ to: "/roadmap" }), 400);
    } catch (e) { toast.error(e instanceof Error ? e.message : "Failed"); }
    finally { setSavingCareer(null); }
  }

  const domainGroups = { Domains: DOMAINS };

  return (
    <div>
      <PageHeader title="AI Career Recommendation" subtitle="Discover the best career paths matched to your profile." icon={Compass} />
      <Card className="mb-6">
        <div className="grid md:grid-cols-3 gap-4">
          <div>
            <label className="text-sm font-medium">Your skills</label>
            <div className="mt-2"><MultiSkillSelect values={skills} onChange={setSkills} groups={SKILL_GROUPS} /></div>
          </div>
          <div>
            <label className="text-sm font-medium">Domains of interest</label>
            <div className="mt-2"><MultiSkillSelect values={interests} onChange={setInterests} groups={domainGroups} placeholder="Search domains..." /></div>
          </div>
          <div>
            <label className="text-sm font-medium">Education</label>
            <div className="mt-2"><SearchableSelect value={education} onChange={setEducation} options={EDUCATION_OPTIONS} /></div>
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
                    <div className="text-xs text-muted-foreground">Match: {p.match_percentage}%</div>
                  </div>
                </div>
                <div className="text-2xl font-bold gradient-text">{p.match_percentage}</div>
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

              <div className="mt-3 rounded-lg border border-border p-2.5 flex items-center gap-2">
                <TrendingUp className="size-4 text-success" />
                <div className="flex-1">
                  <div className="text-[10px] uppercase text-muted-foreground tracking-wider">Future Growth</div>
                  <div className="h-1.5 mt-1 bg-muted rounded-full overflow-hidden"><div className="h-full bg-gradient-primary" style={{width:`${p.future_growth_score}%`}}/></div>
                </div>
                <div className="text-sm font-semibold">{p.future_growth_score}%</div>
              </div>

              <div className="mt-4">
                <div className="text-xs uppercase text-muted-foreground mb-2 flex items-center gap-1"><Code2 className="size-3" /> Required Skills</div>
                <div className="flex flex-wrap gap-1.5">
                  {p.required_skills.map(t => <span key={t} className="px-2 py-0.5 rounded-full bg-muted text-xs">{t}</span>)}
                </div>
              </div>

              {p.certifications?.length > 0 && (
                <div className="mt-4">
                  <div className="text-xs uppercase text-muted-foreground mb-2 flex items-center gap-1"><Award className="size-3" /> Certifications</div>
                  <ul className="text-sm space-y-1">
                    {p.certifications.map((s,i)=> <li key={i} className="text-muted-foreground">· {s}</li>)}
                  </ul>
                </div>
              )}

              {p.learning_resources?.length > 0 && (
                <div className="mt-4">
                  <div className="text-xs uppercase text-muted-foreground mb-2 flex items-center gap-1"><BookOpen className="size-3" /> Learning Resources</div>
                  <ul className="text-sm space-y-1">
                    {p.learning_resources.map((s,i)=> <li key={i} className="text-muted-foreground">· {s}</li>)}
                  </ul>
                </div>
              )}

              {p.job_market_insights && (
                <div className="mt-4 rounded-lg bg-muted/40 p-3 flex gap-2">
                  <Building2 className="size-4 text-accent shrink-0 mt-0.5" />
                  <div className="text-xs text-muted-foreground">{p.job_market_insights}</div>
                </div>
              )}

              <div className="mt-4 flex items-center gap-2">
                <Btn onClick={() => selectCareer(p)} disabled={savingCareer === p.title}>
                  {profile?.selected_career === p.title
                    ? <><Check className="size-4" /> Current Goal</>
                    : savingCareer === p.title ? "Saving…" : <><MapIcon className="size-4" /> Set as Career Goal</>}
                </Btn>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
