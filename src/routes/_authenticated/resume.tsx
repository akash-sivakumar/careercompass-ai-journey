import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { FileText, Upload, CheckCircle2, AlertCircle, TrendingUp } from "lucide-react";
import { Card, PageHeader, Btn } from "@/components/ui-kit";
import { useServerFn } from "@tanstack/react-start";
import { generateAI } from "@/lib/ai.functions";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/_authenticated/resume")({ component: ResumePage });

type Result = {
  ats_score: number;
  strengths: string[];
  weaknesses: string[];
  missing_skills: string[];
  suggestions: string[];
  summary: string;
};

function ResumePage() {
  const [text, setText] = useState("");
  const [targetRole, setTargetRole] = useState("Software Engineer");
  const [result, setResult] = useState<Result | null>(null);
  const [loading, setLoading] = useState(false);
  const generate = useServerFn(generateAI);

  async function handleFile(f: File) {
    if (f.type !== "text/plain" && !f.name.endsWith(".txt")) {
      toast.info("Tip: Paste resume text directly for best results, or upload a .txt file.");
    }
    const t = await f.text();
    setText(t.slice(0, 18000));
  }

  async function analyze() {
    if (text.trim().length < 100) { toast.error("Paste your full resume text (min 100 chars)"); return; }
    setLoading(true); setResult(null);
    try {
      const { content } = await generate({ data: {
        system: "You are an expert ATS resume reviewer. Output strictly JSON with fields: ats_score (0-100 integer), strengths (string[]), weaknesses (string[]), missing_skills (string[]), suggestions (string[] with concrete improvements), summary (string).",
        prompt: `Analyze this resume for the target role "${targetRole}". Resume:\n\n${text}`,
        json: true,
      }});
      const parsed = JSON.parse(content) as Result;
      setResult(parsed);
      const { data: u } = await supabase.auth.getUser();
      if (u.user) {
        await supabase.from("profiles").update({ resume_score: parsed.ats_score }).eq("id", u.user.id);
        await supabase.from("ai_artifacts").insert({ user_id: u.user.id, kind: "resume", title: targetRole, data: parsed });
      }
      toast.success("Analysis complete");
    } catch (e) { toast.error(e instanceof Error ? e.message : "Analysis failed"); }
    finally { setLoading(false); }
  }

  return (
    <div>
      <PageHeader title="AI Resume Analyzer" subtitle="ATS score, missing skills, and tailored suggestions in seconds." icon={FileText} />

      <div className="grid lg:grid-cols-2 gap-6">
        <Card>
          <label className="text-sm font-medium">Target role</label>
          <input value={targetRole} onChange={e=>setTargetRole(e.target.value)}
            className="w-full mt-2 bg-input border border-border rounded-lg px-3 py-2 text-sm outline-none focus:border-ring" />

          <label className="text-sm font-medium mt-5 block">Resume text</label>
          <div className="mt-2 border-2 border-dashed border-border rounded-xl p-4">
            <label className="cursor-pointer flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground">
              <Upload className="size-4" /> Upload .txt file
              <input type="file" accept=".txt,text/plain" className="hidden" onChange={e => e.target.files?.[0] && handleFile(e.target.files[0])} />
            </label>
          </div>
          <textarea value={text} onChange={e=>setText(e.target.value)}
            placeholder="Paste your resume here..."
            className="w-full mt-3 bg-input border border-border rounded-lg px-3 py-2 text-sm outline-none focus:border-ring h-72 font-mono" />
          <Btn onClick={analyze} disabled={loading} className="mt-4">{loading ? "Analyzing..." : "Analyze Resume"}</Btn>
        </Card>

        <Card>
          {!result ? (
            <div className="text-center text-muted-foreground py-20">
              <FileText className="size-10 mx-auto mb-3 opacity-40" />
              Your AI analysis will appear here.
            </div>
          ) : (
            <div>
              <div className="flex items-center gap-4 mb-6">
                <div className="relative size-24">
                  <svg viewBox="0 0 100 100" className="size-24 -rotate-90">
                    <circle cx="50" cy="50" r="42" stroke="currentColor" strokeWidth="8" fill="none" className="text-muted opacity-30" />
                    <circle cx="50" cy="50" r="42" stroke="url(#g)" strokeWidth="8" fill="none"
                      strokeDasharray={`${result.ats_score * 2.64} 999`} strokeLinecap="round" />
                    <defs><linearGradient id="g" x1="0" x2="1"><stop offset="0%" stopColor="oklch(0.68 0.20 285)"/><stop offset="100%" stopColor="oklch(0.62 0.18 230)"/></linearGradient></defs>
                  </svg>
                  <div className="absolute inset-0 grid place-items-center font-bold text-2xl">{result.ats_score}</div>
                </div>
                <div>
                  <div className="text-xs text-muted-foreground uppercase tracking-wider">ATS Score</div>
                  <div className="text-lg font-semibold">{result.ats_score >= 80 ? "Excellent" : result.ats_score >= 60 ? "Good" : "Needs work"}</div>
                  <div className="text-sm text-muted-foreground mt-1 max-w-md">{result.summary}</div>
                </div>
              </div>

              <Section title="Strengths" icon={CheckCircle2} items={result.strengths} color="text-success" />
              <Section title="Weaknesses" icon={AlertCircle} items={result.weaknesses} color="text-warning" />
              <Section title="Missing Skills" icon={TrendingUp} items={result.missing_skills} color="text-accent" pills />
              <Section title="Suggestions" icon={CheckCircle2} items={result.suggestions} color="text-primary" />
            </div>
          )}
        </Card>
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
