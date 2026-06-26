import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { FileText, Upload, CheckCircle2, AlertCircle, TrendingUp, Sparkles, Copy, Loader2, Download, Award } from "lucide-react";
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
  Data: ["Data Analyst", "Business Analyst", "Data Scientist", "Machine Learning Engineer", "AI Engineer", "BI Developer", "Analytics Engineer", "Data Engineer"],
  Software: ["Software Engineer", "Frontend Developer", "Backend Developer", "Full Stack Developer", "Mobile Developer", "Android Developer", "iOS Developer"],
  Cloud: ["Cloud Engineer", "DevOps Engineer", "Platform Engineer", "Site Reliability Engineer", "AWS Engineer", "Azure Engineer"],
  Security: ["Cybersecurity Analyst", "Security Engineer", "Ethical Hacker", "Network Security Engineer"],
  Other: ["Product Manager", "UI/UX Designer", "QA Engineer", "Automation Tester", "Salesforce Developer", "SAP Consultant"],
};
const ALL_ROLES = Object.values(ROLE_GROUPS).flat();

type Breakdown = {
  keywords: number; formatting: number; experience: number; education: number; projects: number; achievements: number;
};
type StarRewrite = { original: string; rewritten: string };
type Result = {
  ats_score: number;
  breakdown: Breakdown;
  summary: string;
  strengths: string[];
  weaknesses: string[];
  missing_skills: string[];
  missing_keywords: string[];
  matched_keywords: string[];
  suggestions: string[];
  action_verbs: string[];
  star_rewrites: StarRewrite[];
  industry_benchmark: string;
};

function ResumePage() {
  const [text, setText] = useState("");
  const [targetRole, setTargetRole] = useState("Software Engineer");
  const [result, setResult] = useState<Result | null>(null);
  const [loading, setLoading] = useState(false);
  const [parsing, setParsing] = useState(false);
  const [fileName, setFileName] = useState<string | null>(null);
  const generate = useServerFn(generateAI);

  async function handleFile(f: File) {
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
      const system = `You are a senior ATS resume reviewer + recruiter. Output STRICT JSON with this exact shape:
{
  "ats_score": 0-100 integer,
  "breakdown": { "keywords": int, "formatting": int, "experience": int, "education": int, "projects": int, "achievements": int },
  "summary": "1-2 sentence headline assessment",
  "strengths": [string],
  "weaknesses": [string],
  "missing_skills": [string],
  "matched_keywords": [string],
  "missing_keywords": [string],
  "suggestions": [string with concrete fixes],
  "action_verbs": [string suggested strong action verbs],
  "star_rewrites": [{ "original": "weak bullet from resume", "rewritten": "STAR-format rewrite with metrics" }],
  "industry_benchmark": "How this compares to top resumes for the target role"
}
Be specific, role-aware, and reference actual content from the resume. Include 3-5 star_rewrites.`;
      const { content } = await generate({ data: {
        system,
        prompt: `TARGET ROLE: ${targetRole}\n\nRESUME:\n${text}`,
        json: true,
      }});
      const parsed = JSON.parse(content) as Result;
      setResult(parsed);
      const { data: u } = await supabase.auth.getUser();
      if (u.user) {
        await supabase.from("profiles").update({ resume_score: parsed.ats_score, target_role: targetRole }).eq("id", u.user.id);
        await supabase.from("ai_artifacts").insert({ user_id: u.user.id, kind: "resume", title: targetRole, data: parsed as never });
      }
      await logActivity("resume_analyze", `Resume analyzed for ${targetRole}`, { xp: 50, meta: { score: parsed.ats_score } });
      if (parsed.ats_score >= 80) await unlockAchievement("resume_pro");
      toast.success("Analysis complete");
    } catch (e) { toast.error(e instanceof Error ? e.message : "Analysis failed"); }
    finally { setLoading(false); }
  }

  function downloadReport() {
    if (!result) return;
    const lines = [
      `CareerCompass AI — Resume Report`,
      `Target role: ${targetRole}`,
      `Date: ${new Date().toLocaleString()}`,
      ``,
      `OVERALL ATS SCORE: ${result.ats_score}/100`,
      ``,
      `BREAKDOWN`,
      ...Object.entries(result.breakdown).map(([k, v]) => `  • ${k.padEnd(14)} ${v}/100`),
      ``,
      `SUMMARY`, result.summary, ``,
      `STRENGTHS`, ...result.strengths.map(s => `  • ${s}`), ``,
      `WEAKNESSES`, ...result.weaknesses.map(s => `  • ${s}`), ``,
      `MISSING SKILLS`, ...result.missing_skills.map(s => `  • ${s}`), ``,
      `MISSING KEYWORDS`, ...result.missing_keywords.map(s => `  • ${s}`), ``,
      `SUGGESTIONS`, ...result.suggestions.map(s => `  • ${s}`), ``,
      `STAR REWRITES`,
      ...result.star_rewrites.flatMap(r => [`  - Original: ${r.original}`, `    Rewrite : ${r.rewritten}`, ``]),
      `INDUSTRY BENCHMARK`, result.industry_benchmark,
    ];
    const blob = new Blob([lines.join("\n")], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = `resume-report-${targetRole.toLowerCase().replace(/\s+/g, "-")}.txt`;
    a.click(); URL.revokeObjectURL(url);
  }

  return (
    <div>
      <PageHeader title="AI Resume Analyzer" subtitle="Premium ATS optimization — role-aware scoring, keyword analysis, and STAR rewrites." icon={FileText} />

      <div className="grid lg:grid-cols-2 gap-6">
        <Card>
          <label className="text-sm font-medium">Target role</label>
          <div className="mt-2">
            <RoleSelect value={targetRole} onChange={setTargetRole} />
          </div>

          <label className="text-sm font-medium mt-5 block">Resume</label>
          <div className="mt-2 border-2 border-dashed border-border rounded-xl p-4 hover:border-primary/50 transition">
            <label className="cursor-pointer flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground">
              {parsing ? <Loader2 className="size-4 animate-spin" /> : <Upload className="size-4" />}
              <span>{parsing ? "Parsing..." : fileName ? `Replace file (${fileName})` : "Upload PDF, DOCX, or TXT"}</span>
              <input type="file" accept=".pdf,.docx,.txt,application/pdf,text/plain" className="hidden"
                onChange={e => e.target.files?.[0] && handleFile(e.target.files[0])} />
            </label>
            <p className="text-[11px] text-muted-foreground mt-2">Or paste your resume below. Max ~20k characters.</p>
          </div>
          <textarea value={text} onChange={e=>setText(e.target.value)}
            placeholder="Paste your resume here, or upload a file above..."
            className="w-full mt-3 bg-input border border-border rounded-lg px-3 py-2 text-xs outline-none focus:border-ring h-64 font-mono" />
          <div className="flex items-center justify-between mt-1">
            <span className="text-[11px] text-muted-foreground">{text.length.toLocaleString()} chars</span>
            <Btn onClick={analyze} disabled={loading || parsing}>
              {loading ? <><Loader2 className="size-4 animate-spin" /> Analyzing…</> : <><Sparkles className="size-4" /> Analyze Resume</>}
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
            <ResultView result={result} role={targetRole} onDownload={downloadReport} />
          )}
        </Card>
      </div>
    </div>
  );
}

function RoleSelect({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  // wrap SearchableSelect with grouped headers visually — but reuse component for simplicity using flat list
  const flat = useMemo(() => ALL_ROLES, []);
  return <SearchableSelect value={value} onChange={onChange} options={flat} placeholder="Select target role..." />;
}

function ResultView({ result, role, onDownload }: { result: Result; role: string; onDownload: () => void }) {
  const tone = result.ats_score >= 80 ? "Excellent" : result.ats_score >= 65 ? "Good" : result.ats_score >= 50 ? "Fair" : "Needs work";
  return (
    <div>
      <div className="flex items-center gap-4 mb-5">
        <div className="relative size-24 shrink-0">
          <svg viewBox="0 0 100 100" className="size-24 -rotate-90">
            <circle cx="50" cy="50" r="42" stroke="currentColor" strokeWidth="8" fill="none" className="text-muted opacity-30" />
            <circle cx="50" cy="50" r="42" stroke="url(#rg)" strokeWidth="8" fill="none"
              strokeDasharray={`${result.ats_score * 2.64} 999`} strokeLinecap="round" />
            <defs><linearGradient id="rg" x1="0" x2="1"><stop offset="0%" stopColor="oklch(0.68 0.20 285)"/><stop offset="100%" stopColor="oklch(0.62 0.18 230)"/></linearGradient></defs>
          </svg>
          <div className="absolute inset-0 grid place-items-center font-bold text-2xl">{result.ats_score}</div>
        </div>
        <div className="flex-1 min-w-0">
          <div className="text-xs text-muted-foreground uppercase tracking-wider">ATS Score · {role}</div>
          <div className="text-lg font-semibold flex items-center gap-2">
            {tone} {result.ats_score >= 80 && <Award className="size-4 text-warning" />}
          </div>
          <div className="text-sm text-muted-foreground mt-1">{result.summary}</div>
        </div>
        <button onClick={onDownload} title="Download report"
          className="p-2 rounded-lg border border-border hover:bg-muted transition"><Download className="size-4" /></button>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mb-5">
        {Object.entries(result.breakdown).map(([k, v]) => (
          <div key={k} className="rounded-xl border border-border bg-background/40 p-3">
            <div className="text-[10px] uppercase tracking-wider text-muted-foreground">{k}</div>
            <div className="flex items-end gap-1.5 mt-1">
              <div className="text-xl font-bold">{v}</div>
              <div className="text-[10px] text-muted-foreground pb-1">/100</div>
            </div>
            <div className="mt-1.5 h-1 rounded-full bg-muted overflow-hidden">
              <div className="h-full bg-gradient-primary" style={{ width: `${Math.min(100, Math.max(0, v))}%` }} />
            </div>
          </div>
        ))}
      </div>

      <Section title="Strengths" icon={CheckCircle2} items={result.strengths} color="text-success" />
      <Section title="Weaknesses" icon={AlertCircle} items={result.weaknesses} color="text-warning" />
      {result.matched_keywords?.length > 0 && <Section title="Matched Keywords" icon={CheckCircle2} items={result.matched_keywords} color="text-success" pills />}
      <Section title="Missing Keywords" icon={TrendingUp} items={result.missing_keywords} color="text-accent" pills />
      <Section title="Missing Skills" icon={TrendingUp} items={result.missing_skills} color="text-accent" pills />
      <Section title="Suggestions" icon={CheckCircle2} items={result.suggestions} color="text-primary" />
      {result.action_verbs?.length > 0 && <Section title="Stronger Action Verbs" icon={Sparkles} items={result.action_verbs} color="text-primary" pills />}

      {result.star_rewrites?.length > 0 && (
        <div className="mt-5">
          <div className="flex items-center gap-2 font-semibold mb-2 text-primary"><Sparkles className="size-4" />AI-Rewritten Bullets (STAR)</div>
          <div className="space-y-2">
            {result.star_rewrites.map((r, i) => (
              <div key={i} className="rounded-xl border border-border bg-background/40 p-3 text-sm">
                <div className="text-xs text-muted-foreground line-through">{r.original}</div>
                <div className="mt-1.5 flex items-start gap-2">
                  <div className="flex-1">{r.rewritten}</div>
                  <button onClick={() => { navigator.clipboard.writeText(r.rewritten); toast.success("Copied"); }}
                    className="p-1.5 rounded-lg border border-border hover:bg-muted shrink-0"><Copy className="size-3.5" /></button>
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
      <div className="grid grid-cols-3 gap-2">
        {Array.from({ length: 6 }).map((_, i) => <div key={i} className="h-20 bg-muted rounded-xl" />)}
      </div>
    </div>
  );
}

function Section({ title, icon: Icon, items, color, pills }: { title: string; icon: React.ComponentType<{className?:string}>; items: string[]; color: string; pills?: boolean }) {
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
