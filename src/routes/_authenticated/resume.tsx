import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { FileText, Upload, CheckCircle2, AlertCircle, TrendingUp, Sparkles, Copy, Loader2, Download, Award, Target, Briefcase, GraduationCap, BadgeCheck, IndianRupee, Percent, Eye } from "lucide-react";
import { Card, PageHeader, Btn } from "@/components/ui-kit";
import { useServerFn } from "@tanstack/react-start";
import { generateAI } from "@/lib/ai.functions";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { SearchableSelect } from "@/components/searchable-select";
import { parseResumeFile } from "@/lib/resume-parser";
import { logActivity, unlockAchievement } from "@/lib/gamification";

export const Route = createFileRoute("/_authenticated/resume")({ component: ResumePage });

const ROLE_GROUPS: Record<string, string[]> = {
  Data: ["Data Analyst", "Business Analyst", "Data Scientist", "Machine Learning Engineer", "AI Engineer", "Power BI Developer", "BI Developer", "Analytics Engineer", "Data Engineer"],
  Software: ["Software Engineer", "Frontend Developer", "Backend Developer", "Full Stack Developer", "Mobile Developer", "Android Developer", "iOS Developer"],
  Cloud: ["Cloud Engineer", "DevOps Engineer", "Platform Engineer", "Site Reliability Engineer", "AWS Engineer", "Azure Engineer"],
  Security: ["Cybersecurity Analyst", "Security Engineer", "Ethical Hacker", "Network Security Engineer"],
  Other: ["Product Manager", "UI/UX Designer", "QA Engineer", "Automation Tester", "Salesforce Developer", "SAP Consultant"],
};
const ALL_ROLES = Object.values(ROLE_GROUPS).flat();

/** Weighted ATS rubric — weights sum to 100%. */
const WEIGHTS = [
  { key: "formatting", label: "Formatting", weight: 15 },
  { key: "keywords", label: "Keywords", weight: 20 },
  { key: "skills", label: "Skills", weight: 15 },
  { key: "projects", label: "Projects", weight: 15 },
  { key: "experience", label: "Experience", weight: 15 },
  { key: "education", label: "Education", weight: 5 },
  { key: "certifications", label: "Certifications", weight: 5 },
  { key: "star_quality", label: "STAR Bullets", weight: 5 },
  { key: "quantified", label: "Quantified Wins", weight: 5 },
] as const;

type BreakdownKey = (typeof WEIGHTS)[number]["key"];
type Breakdown = Record<BreakdownKey, number>;
type StarRewrite = { original: string; rewritten: string };
type SectionReview = { verdict: string; score: number; notes: string[] };
type Result = {
  breakdown: Breakdown;
  summary: string;
  role_match: number;
  industry_readiness: number;
  interview_readiness: number;
  interview_probability: number;
  recruiter_impression: string;
  salary_prediction: string;
  strengths: string[];
  weaknesses: string[];
  matched_skills: string[];
  missing_skills: string[];
  recommended_skills: string[];
  matched_keywords: string[];
  missing_keywords: string[];
  suggestions: string[];
  rewrite_suggestions: string[];
  action_verbs: string[];
  star_rewrites: StarRewrite[];
  sections: { projects: SectionReview; experience: SectionReview; education: SectionReview; certifications: SectionReview };
  industry_benchmark: string;
};

function clamp(n: unknown) {
  const v = typeof n === "number" && Number.isFinite(n) ? n : 0;
  return Math.round(Math.min(100, Math.max(0, v)));
}

/** Overall ATS score = weighted average of the 9 rubric categories. */
function weightedScore(b: Breakdown) {
  const total = WEIGHTS.reduce((sum, w) => sum + clamp(b[w.key]) * w.weight, 0);
  return Math.round(total / 100);
}

function ResumePage() {
  const [text, setText] = useState("");
  const [targetRole, setTargetRole] = useState("Software Engineer");
  const [result, setResult] = useState<Result | null>(null);
  const [score, setScore] = useState(0);
  const [loading, setLoading] = useState(false);
  const [parsing, setParsing] = useState(false);
  const [fileName, setFileName] = useState<string | null>(null);
  const generate = useServerFn(generateAI);

  async function handleFile(f: File) {
    if (f.size > 10 * 1024 * 1024) { toast.error("File too large (max 10MB)"); return; }
    setParsing(true);
    setFileName(f.name);
    try {
      const t = await parseResumeFile(f);
      if (t.trim().length < 50) {
        toast.error("Could not extract enough text. Try another file or paste manually.");
      } else {
        setText(t);
        toast.success(`Parsed ${f.name}`);
      }
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to parse file");
    } finally {
      setParsing(false);
    }
  }

  async function analyze() {
    if (text.trim().length < 100) { toast.error("Upload or paste your full resume (min 100 chars)"); return; }
    setLoading(true); setResult(null);
    try {
      const system = `You are a senior ATS engine + technical recruiter who hires for the exact target role given.
Score each rubric category independently 0-100 using ROLE-SPECIFIC expectations (a Data Analyst is judged on SQL/BI/statistics; a DevOps Engineer on CI/CD, IaC, Kubernetes; a UI/UX Designer on portfolio, research, design systems). Never just count keywords — judge depth, seniority signals, impact and evidence.

Output STRICT JSON with this exact shape:
{
  "breakdown": { "formatting": int, "keywords": int, "skills": int, "projects": int, "experience": int, "education": int, "certifications": int, "star_quality": int, "quantified": int },
  "summary": "2 sentence headline assessment",
  "role_match": 0-100 int,
  "industry_readiness": 0-100 int,
  "interview_readiness": 0-100 int,
  "interview_probability": 0-100 int (chance of getting a first-round call from a typical company for this role),
  "recruiter_impression": "what a recruiter thinks in the 7-second skim",
  "salary_prediction": "realistic expected range in INR LPA for India based on the evidence in this resume, e.g. '6-9 LPA'",
  "strengths": [string],
  "weaknesses": [string],
  "matched_skills": [string],
  "missing_skills": [string],
  "recommended_skills": [string skills that would most raise the score next],
  "matched_keywords": [string],
  "missing_keywords": [string ATS keywords for this role],
  "suggestions": [string concrete fixes],
  "rewrite_suggestions": [string full rewritten lines for summary/headline/sections],
  "action_verbs": [string],
  "star_rewrites": [{ "original": "weak bullet quoted from the resume", "rewritten": "STAR rewrite with metrics" }],
  "sections": {
    "projects": { "verdict": string, "score": 0-100 int, "notes": [string] },
    "experience": { "verdict": string, "score": 0-100 int, "notes": [string] },
    "education": { "verdict": string, "score": 0-100 int, "notes": [string] },
    "certifications": { "verdict": string, "score": 0-100 int, "notes": [string] }
  },
  "industry_benchmark": "How this compares to top resumes for the target role"
}
Reference actual content from the resume. Include 3-5 star_rewrites. Return JSON only.`;
      const { content } = await generate({ data: {
        system,
        prompt: `TARGET ROLE: ${targetRole}\n\nRESUME:\n${text}`,
        json: true,
      }});
      const parsed = JSON.parse(content) as Result;
      const breakdown = WEIGHTS.reduce((acc, w) => { acc[w.key] = clamp(parsed.breakdown?.[w.key]); return acc; }, {} as Breakdown);
      const normalized: Result = { ...parsed, breakdown };
      const ats = weightedScore(breakdown);
      setResult(normalized); setScore(ats);
      const { data: u } = await supabase.auth.getUser();
      if (u.user) {
        await supabase.from("profiles").update({
          resume_score: ats,
          target_role: targetRole,
          interview_readiness: clamp(parsed.interview_readiness),
          resume_role_match: clamp(parsed.role_match),
          resume_salary_prediction: parsed.salary_prediction ?? null,
        }).eq("id", u.user.id);
        await supabase.from("ai_artifacts").insert({ user_id: u.user.id, kind: "resume", title: targetRole, data: { ...normalized, ats_score: ats } as never });
      }
      await logActivity("resume_analyze", `Resume analyzed for ${targetRole}`, { xp: 50, meta: { score: ats } });
      if (ats >= 80) await unlockAchievement("resume_pro");
      toast.success(`Analysis complete — ATS ${ats}/100`);
    } catch (e) { toast.error(e instanceof Error ? e.message : "Analysis failed"); }
    finally { setLoading(false); }
  }

  function downloadReport() {
    if (!result) return;
    const sec = (name: string, s: SectionReview | undefined) => s ? [`${name.toUpperCase()} (${s.score}/100) — ${s.verdict}`, ...(s.notes ?? []).map(n => `  • ${n}`), ``] : [];
    const lines = [
      `CareerCompass AI — ATS Resume Report`,
      `Target role: ${targetRole}`,
      `Date: ${new Date().toLocaleString()}`,
      ``,
      `OVERALL ATS SCORE (weighted): ${score}/100`,
      `Role match: ${result.role_match}%   Industry readiness: ${result.industry_readiness}%`,
      `Interview readiness: ${result.interview_readiness}%   Interview probability: ${result.interview_probability}%`,
      `Salary prediction: ${result.salary_prediction}`,
      `Recruiter impression: ${result.recruiter_impression}`,
      ``,
      `WEIGHTED BREAKDOWN`,
      ...WEIGHTS.map(w => `  • ${w.label.padEnd(16)} ${clamp(result.breakdown[w.key])}/100  (weight ${w.weight}%)`),
      ``,
      `SUMMARY`, result.summary, ``,
      `STRENGTHS`, ...(result.strengths ?? []).map(s => `  • ${s}`), ``,
      `WEAKNESSES`, ...(result.weaknesses ?? []).map(s => `  • ${s}`), ``,
      `MATCHED SKILLS`, ...(result.matched_skills ?? []).map(s => `  • ${s}`), ``,
      `MISSING SKILLS`, ...(result.missing_skills ?? []).map(s => `  • ${s}`), ``,
      `RECOMMENDED SKILLS`, ...(result.recommended_skills ?? []).map(s => `  • ${s}`), ``,
      `MISSING KEYWORDS`, ...(result.missing_keywords ?? []).map(s => `  • ${s}`), ``,
      `SUGGESTIONS`, ...(result.suggestions ?? []).map(s => `  • ${s}`), ``,
      `REWRITE SUGGESTIONS`, ...(result.rewrite_suggestions ?? []).map(s => `  • ${s}`), ``,
      `SECTION-BY-SECTION`,
      ...sec("projects", result.sections?.projects),
      ...sec("experience", result.sections?.experience),
      ...sec("education", result.sections?.education),
      ...sec("certifications", result.sections?.certifications),
      `STAR REWRITES`,
      ...(result.star_rewrites ?? []).flatMap(r => [`  - Original: ${r.original}`, `    Rewrite : ${r.rewritten}`, ``]),
      `INDUSTRY BENCHMARK`, result.industry_benchmark ?? "",
    ];
    const blob = new Blob([lines.join("\n")], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = `ats-report-${targetRole.toLowerCase().replace(/\s+/g, "-")}.txt`;
    a.click(); URL.revokeObjectURL(url);
  }

  return (
    <div>
      <PageHeader title="AI Resume Analyzer" subtitle="Premium ATS engine — weighted role-aware scoring, salary prediction, and section-by-section review." icon={FileText} />

      <div className="grid lg:grid-cols-2 gap-6">
        <Card>
          <label className="text-sm font-medium" htmlFor="target-role">Target role</label>
          <div className="mt-2">
            <RoleSelect value={targetRole} onChange={setTargetRole} />
          </div>

          <label className="text-sm font-medium mt-5 block">Resume</label>
          <div className="mt-2 border-2 border-dashed border-border rounded-xl p-4 hover:border-primary/50 transition-colors">
            <label className="cursor-pointer flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors">
              {parsing ? <Loader2 className="size-4 animate-spin" /> : <Upload className="size-4" />}
              <span>{parsing ? "Parsing..." : fileName ? `Replace file (${fileName})` : "Upload PDF, DOCX, or TXT"}</span>
              <input type="file" accept=".pdf,.docx,.txt,application/pdf,text/plain" className="hidden"
                onChange={e => e.target.files?.[0] && handleFile(e.target.files[0])} />
            </label>
            <p className="text-[11px] text-muted-foreground mt-2">Or paste your resume below. Max ~20k characters, 10MB file.</p>
          </div>
          <textarea value={text} onChange={e=>setText(e.target.value)} aria-label="Resume text"
            placeholder="Paste your resume here, or upload a file above..."
            className="w-full mt-3 bg-input border border-border rounded-lg px-3 py-2 text-xs outline-none focus:border-ring h-64 font-mono" />
          <div className="flex items-center justify-between gap-3 mt-1 flex-wrap">
            <span className="text-[11px] text-muted-foreground">{text.length.toLocaleString()} chars</span>
            <Btn onClick={analyze} disabled={loading || parsing}>
              {loading ? <><Loader2 className="size-4 animate-spin inline mr-1" /> Analyzing…</> : <><Sparkles className="size-4 inline mr-1" /> Analyze Resume</>}
            </Btn>
          </div>
        </Card>

        <Card>
          {loading && !result ? (
            <SkeletonResult />
          ) : !result ? (
            <div className="text-center text-muted-foreground py-20">
              <FileText className="size-10 mx-auto mb-3 opacity-40" />
              Your AI analysis will appear here.
            </div>
          ) : (
            <ResultView result={result} score={score} role={targetRole} onDownload={downloadReport} />
          )}
        </Card>
      </div>
    </div>
  );
}

function RoleSelect({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  const flat = useMemo(() => ALL_ROLES, []);
  return <SearchableSelect value={value} onChange={onChange} options={flat} placeholder="Select target role..." />;
}

function ResultView({ result, score, role, onDownload }: { result: Result; score: number; role: string; onDownload: () => void }) {
  const tone = score >= 80 ? "Excellent" : score >= 65 ? "Good" : score >= 50 ? "Fair" : "Needs work";
  return (
    <div>
      <div className="flex items-center gap-4 mb-5">
        <div className="relative size-24 shrink-0">
          <svg viewBox="0 0 100 100" className="size-24 -rotate-90" aria-hidden>
            <circle cx="50" cy="50" r="42" stroke="currentColor" strokeWidth="8" fill="none" className="text-muted opacity-30" />
            <circle cx="50" cy="50" r="42" stroke="url(#rg)" strokeWidth="8" fill="none"
              strokeDasharray={`${score * 2.64} 999`} strokeLinecap="round" className="transition-all duration-700" />
            <defs><linearGradient id="rg" x1="0" x2="1"><stop offset="0%" stopColor="oklch(0.68 0.20 285)"/><stop offset="100%" stopColor="oklch(0.62 0.18 230)"/></linearGradient></defs>
          </svg>
          <div className="absolute inset-0 grid place-items-center font-bold text-2xl">{score}</div>
        </div>
        <div className="flex-1 min-w-0">
          <div className="text-xs text-muted-foreground uppercase tracking-wider">Weighted ATS Score · {role}</div>
          <div className="text-lg font-semibold flex items-center gap-2">
            {tone} {score >= 80 && <Award className="size-4 text-warning" />}
          </div>
          <div className="text-sm text-muted-foreground mt-1">{result.summary}</div>
        </div>
        <button onClick={onDownload} title="Download ATS report" aria-label="Download ATS report"
          className="p-2 rounded-lg border border-border hover:bg-muted transition-colors"><Download className="size-4" /></button>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mb-5">
        <Metric icon={Target} label="Role match" value={`${result.role_match ?? 0}%`} />
        <Metric icon={Briefcase} label="Industry ready" value={`${result.industry_readiness ?? 0}%`} />
        <Metric icon={BadgeCheck} label="Interview ready" value={`${result.interview_readiness ?? 0}%`} />
        <Metric icon={Percent} label="Interview odds" value={`${result.interview_probability ?? 0}%`} />
        <Metric icon={IndianRupee} label="Salary est." value={result.salary_prediction ?? "—"} />
        <Metric icon={Eye} label="Recruiter skim" value={result.recruiter_impression ?? "—"} small />
      </div>

      <div className="text-xs uppercase tracking-wider text-muted-foreground mb-2">Weighted breakdown</div>
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mb-5">
        {WEIGHTS.map(w => {
          const v = clamp(result.breakdown[w.key]);
          return (
            <div key={w.key} className="rounded-xl border border-border bg-background/40 p-3 hover:border-primary/40 transition-colors">
              <div className="text-[10px] uppercase tracking-wider text-muted-foreground flex items-center justify-between gap-1">
                <span className="truncate">{w.label}</span><span className="opacity-60">{w.weight}%</span>
              </div>
              <div className="flex items-end gap-1.5 mt-1">
                <div className="text-xl font-bold">{v}</div>
                <div className="text-[10px] text-muted-foreground pb-1">/100</div>
              </div>
              <div className="mt-1.5 h-1 rounded-full bg-muted overflow-hidden">
                <div className="h-full bg-gradient-primary transition-all duration-700" style={{ width: `${v}%` }} />
              </div>
            </div>
          );
        })}
      </div>

      <Section title="Strengths" icon={CheckCircle2} items={result.strengths} color="text-success" />
      <Section title="Weaknesses" icon={AlertCircle} items={result.weaknesses} color="text-warning" />
      <Section title="Matched Skills" icon={CheckCircle2} items={result.matched_skills} color="text-success" pills />
      <Section title="Missing Skills" icon={TrendingUp} items={result.missing_skills} color="text-accent" pills />
      <Section title="Recommended Skills" icon={Sparkles} items={result.recommended_skills} color="text-primary" pills />
      <Section title="Matched Keywords" icon={CheckCircle2} items={result.matched_keywords} color="text-success" pills />
      <Section title="Missing Keywords" icon={TrendingUp} items={result.missing_keywords} color="text-accent" pills />
      <Section title="Suggestions" icon={CheckCircle2} items={result.suggestions} color="text-primary" />
      <Section title="Resume Rewrite Suggestions" icon={Sparkles} items={result.rewrite_suggestions} color="text-primary" />
      <Section title="Stronger Action Verbs" icon={Sparkles} items={result.action_verbs} color="text-primary" pills />

      {result.sections && (
        <div className="mt-5">
          <div className="flex items-center gap-2 font-semibold mb-2 text-primary"><GraduationCap className="size-4" />Section-by-Section Analysis</div>
          <div className="grid sm:grid-cols-2 gap-2">
            <SectionCard label="Projects" data={result.sections.projects} />
            <SectionCard label="Experience" data={result.sections.experience} />
            <SectionCard label="Education" data={result.sections.education} />
            <SectionCard label="Certifications" data={result.sections.certifications} />
          </div>
        </div>
      )}

      {result.star_rewrites?.length > 0 && (
        <div className="mt-5">
          <div className="flex items-center gap-2 font-semibold mb-2 text-primary"><Sparkles className="size-4" />AI-Rewritten Bullets (STAR)</div>
          <div className="space-y-2">
            {result.star_rewrites.map((r, i) => (
              <div key={i} className="rounded-xl border border-border bg-background/40 p-3 text-sm hover:border-primary/40 transition-colors">
                <div className="text-xs text-muted-foreground line-through">{r.original}</div>
                <div className="mt-1.5 flex items-start gap-2">
                  <div className="flex-1">{r.rewritten}</div>
                  <button onClick={() => { navigator.clipboard.writeText(r.rewritten); toast.success("Copied"); }}
                    aria-label="Copy rewritten bullet"
                    className="p-1.5 rounded-lg border border-border hover:bg-muted shrink-0 transition-colors"><Copy className="size-3.5" /></button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {result.industry_benchmark && (
        <div className="mt-5 rounded-xl border border-border bg-gradient-card p-4">
          <div className="text-xs uppercase tracking-wider text-muted-foreground mb-1">Industry Benchmark</div>
          <div className="text-sm">{result.industry_benchmark}</div>
        </div>
      )}
    </div>
  );
}

function Metric({ icon: Icon, label, value, small }: { icon: React.ComponentType<{className?:string}>; label: string; value: string; small?: boolean }) {
  return (
    <div className="rounded-xl border border-border bg-gradient-card p-3 hover:border-primary/40 transition-colors">
      <div className="text-[10px] uppercase tracking-wider text-muted-foreground flex items-center gap-1"><Icon className="size-3" />{label}</div>
      <div className={`${small ? "text-xs leading-snug mt-1" : "text-lg font-bold mt-0.5"}`}>{value}</div>
    </div>
  );
}

function SectionCard({ label, data }: { label: string; data?: SectionReview }) {
  if (!data) return null;
  return (
    <div className="rounded-xl border border-border bg-background/40 p-3">
      <div className="flex items-center justify-between gap-2">
        <div className="text-sm font-medium">{label}</div>
        <div className="text-xs text-muted-foreground">{clamp(data.score)}/100</div>
      </div>
      <div className="mt-1 h-1 rounded-full bg-muted overflow-hidden">
        <div className="h-full bg-gradient-primary transition-all duration-700" style={{ width: `${clamp(data.score)}%` }} />
      </div>
      <div className="text-xs text-muted-foreground mt-2">{data.verdict}</div>
      {data.notes?.length > 0 && (
        <ul className="mt-2 space-y-1 text-xs text-muted-foreground">
          {data.notes.map((n, i) => <li key={i} className="flex gap-1.5"><span className="text-foreground">·</span>{n}</li>)}
        </ul>
      )}
    </div>
  );
}

function SkeletonResult() {
  return (
    <div className="animate-pulse">
      <div className="flex items-center gap-4 mb-5">
        <div className="size-24 rounded-full bg-muted" />
        <div className="flex-1 space-y-2">
          <div className="h-3 w-24 bg-muted rounded" />
          <div className="h-5 w-40 bg-muted rounded" />
          <div className="h-3 w-full bg-muted rounded" />
        </div>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mb-4">
        {Array.from({ length: 6 }).map((_, i) => <div key={i} className="h-16 bg-muted rounded-xl" />)}
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
        {Array.from({ length: 9 }).map((_, i) => <div key={i} className="h-20 bg-muted rounded-xl" />)}
      </div>
    </div>
  );
}

function Section({ title, icon: Icon, items, color, pills }: { title: string; icon: React.ComponentType<{className?:string}>; items?: string[]; color: string; pills?: boolean }) {
  if (!items?.length) return null;
  return (
    <div className="mt-5">
      <div className={`flex items-center gap-2 font-semibold mb-2 ${color}`}><Icon className="size-4" />{title}</div>
      {pills ? (
        <div className="flex flex-wrap gap-2">
          {items.map(i => <span key={i} className="px-3 py-1 rounded-full bg-muted text-xs">{i}</span>)}
        </div>
      ) : (
        <ul className="space-y-1.5 text-sm text-muted-foreground">
          {items.map((i, idx) => <li key={idx} className="flex gap-2"><span className="text-foreground">·</span>{i}</li>)}
        </ul>
      )}
    </div>
  );
}
