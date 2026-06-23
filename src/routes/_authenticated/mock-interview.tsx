import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Mic, Send, RotateCcw, Trophy, Sparkles, Target, Brain, MessageSquare, BarChart3 } from "lucide-react";
import { Card, PageHeader, Btn } from "@/components/ui-kit";
import { SearchableSelect, INTERVIEW_ROLES } from "@/components/searchable-select";
import { useServerFn } from "@tanstack/react-start";
import { generateAI } from "@/lib/ai.functions";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/_authenticated/mock-interview")({ component: MockInterview });

type Eval = {
  score: number;
  technical_accuracy: number;
  communication_score: number;
  confidence_score: number;
  problem_solving_score: number;
  areas_of_improvement: string[];
  better_sample_answer: string;
};
type Round = { question: string; answer?: string; evaluation?: Eval };

type FinalReport = {
  overall_score: number;
  percentage: number;
  interview_readiness_score: number;
  strengths: string[];
  weaknesses: string[];
  skill_gaps: string[];
  learning_recommendations: string[];
  improvement_plan: string[];
};

const DIFFICULTIES = ["Beginner","Intermediate","Advanced","Expert"];
const TYPES = ["Technical Interview","HR Interview","Behavioral Interview","System Design Interview","Case Study Interview","Aptitude Round","Mixed Interview"];
const COUNTS = ["5","10","15","20"];

function MockInterview() {
  const [role, setRole] = useState(INTERVIEW_ROLES[0]);
  const [difficulty, setDifficulty] = useState("Intermediate");
  const [type, setType] = useState(TYPES[0]);
  const [count, setCount] = useState("5");
  const [started, setStarted] = useState(false);
  const [rounds, setRounds] = useState<Round[]>([]);
  const [answer, setAnswer] = useState("");
  const [loading, setLoading] = useState(false);
  const [report, setReport] = useState<FinalReport | null>(null);
  const generate = useServerFn(generateAI);

  const total = parseInt(count, 10);

  async function nextQuestion() {
    setLoading(true);
    try {
      const prior = rounds.map(r => `Q: ${r.question}\nA: ${r.answer ?? ""}`).join("\n\n");
      const { content } = await generate({ data: {
        system: "You are an AI interviewer. Return JSON: { question: string }. Generate one challenging but fair interview question matching the role, difficulty and interview type. Build on previous answers when possible.",
        prompt: `Role: ${role}\nDifficulty: ${difficulty}\nType: ${type}\nQuestion ${rounds.length+1} of ${total}\nPrevious:\n${prior || "(none)"}`,
        json: true,
      }});
      const { question } = JSON.parse(content);
      setRounds(rs => [...rs, { question }]);
      setStarted(true);
    } catch (e) { toast.error(e instanceof Error ? e.message : "Failed"); }
    finally { setLoading(false); }
  }

  async function submitAnswer() {
    if (!answer.trim()) { toast.error("Type your answer"); return; }
    const idx = rounds.length - 1;
    setLoading(true);
    try {
      const cur = rounds[idx];
      const { content } = await generate({ data: {
        system: "You are a strict but fair interview evaluator. Return JSON: { score (0-10 int), technical_accuracy (0-10 int), communication_score (0-10 int), confidence_score (0-10 int), problem_solving_score (0-10 int), areas_of_improvement (string[]), better_sample_answer (string) }.",
        prompt: `Role: ${role}\nDifficulty: ${difficulty}\nType: ${type}\nQuestion: ${cur.question}\nAnswer: ${answer}\n\nEvaluate.`,
        json: true,
      }});
      const ev: Eval = JSON.parse(content);
      const updated = rounds.map((r, i) => i === idx ? { ...r, answer, evaluation: ev } : r);
      setRounds(updated);
      setAnswer("");

      const { data: u } = await supabase.auth.getUser();
      if (u.user) {
        const scores = updated.map(r => r.evaluation?.score ?? 0).filter(Boolean);
        const readiness = Math.round((scores.reduce((a,b)=>a+b,0) / scores.length) * 10);
        await supabase.from("profiles").update({ interview_readiness: readiness }).eq("id", u.user.id);
      }

      if (updated.length >= total) {
        await generateFinalReport(updated);
      }
    } catch (e) { toast.error(e instanceof Error ? e.message : "Failed"); }
    finally { setLoading(false); }
  }

  async function generateFinalReport(all: Round[]) {
    try {
      const summary = all.map((r,i)=>`Q${i+1}: ${r.question}\nA: ${r.answer}\nScore: ${r.evaluation?.score}/10`).join("\n\n");
      const { content } = await generate({ data: {
        system: "You are an interview analytics engine. Return JSON: { overall_score (0-100 int), percentage (0-100 int), interview_readiness_score (0-100 int), strengths (string[]), weaknesses (string[]), skill_gaps (string[]), learning_recommendations (string[]), improvement_plan (string[]) }.",
        prompt: `Role: ${role}\nDifficulty: ${difficulty}\nType: ${type}\n\nFull interview:\n${summary}\n\nProduce the final analytics report.`,
        json: true,
      }});
      setReport(JSON.parse(content));
    } catch (e) { toast.error(e instanceof Error ? e.message : "Failed to generate report"); }
  }

  function reset() { setRounds([]); setAnswer(""); setStarted(false); setReport(null); }

  const current = rounds[rounds.length - 1];
  const awaitingAnswer = current && !current.evaluation;
  const isComplete = rounds.length >= total && !awaitingAnswer;

  return (
    <div>
      <PageHeader title="AI Mock Interview" subtitle="Practice with our AI interviewer — get scored feedback after every answer." icon={Mic} />

      {!started && (
        <Card className="mb-6">
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label className="text-sm font-medium">Role</label>
              <div className="mt-2"><SearchableSelect value={role} onChange={setRole} options={INTERVIEW_ROLES} /></div>
            </div>
            <div>
              <label className="text-sm font-medium">Difficulty</label>
              <div className="mt-2"><SearchableSelect value={difficulty} onChange={setDifficulty} options={DIFFICULTIES} /></div>
            </div>
            <div>
              <label className="text-sm font-medium">Interview Type</label>
              <div className="mt-2"><SearchableSelect value={type} onChange={setType} options={TYPES} /></div>
            </div>
            <div>
              <label className="text-sm font-medium">Questions</label>
              <div className="mt-2"><SearchableSelect value={count} onChange={setCount} options={COUNTS} /></div>
            </div>
          </div>
          <Btn onClick={nextQuestion} disabled={loading} className="mt-5">{loading ? "Starting..." : "Start Interview"}</Btn>
        </Card>
      )}

      {started && (
        <Card className="mb-6 flex flex-wrap items-center gap-3 text-sm">
          <span className="text-muted-foreground">Role:</span><span className="font-medium">{role}</span>
          <span className="text-muted-foreground">·</span>
          <span className="text-muted-foreground">Difficulty:</span><span className="font-medium">{difficulty}</span>
          <span className="text-muted-foreground">·</span>
          <span className="text-muted-foreground">Type:</span><span className="font-medium">{type}</span>
          <span className="text-muted-foreground">·</span>
          <span className="text-muted-foreground">Progress:</span><span className="font-medium">{rounds.length}/{total}</span>
          <button onClick={reset} className="ml-auto text-muted-foreground hover:text-foreground inline-flex items-center gap-1"><RotateCcw className="size-3" /> Reset</button>
        </Card>
      )}

      <div className="space-y-4">
        {rounds.map((r, i) => (
          <Card key={i}>
            <div className="text-xs uppercase text-muted-foreground tracking-wider">Question {i+1}</div>
            <div className="font-display font-semibold mt-1 text-lg">{r.question}</div>
            {r.answer && (
              <>
                <div className="mt-4 text-xs uppercase text-muted-foreground">Your answer</div>
                <div className="mt-1 text-sm text-muted-foreground whitespace-pre-wrap">{r.answer}</div>
                {r.evaluation && (
                  <>
                    <div className="mt-4 flex items-center gap-3">
                      <div className="text-3xl font-bold gradient-text">{r.evaluation.score}/10</div>
                    </div>
                    <div className="mt-3 grid grid-cols-2 md:grid-cols-4 gap-2">
                      <MiniScore icon={Brain} label="Technical" value={r.evaluation.technical_accuracy} />
                      <MiniScore icon={MessageSquare} label="Communication" value={r.evaluation.communication_score} />
                      <MiniScore icon={Sparkles} label="Confidence" value={r.evaluation.confidence_score} />
                      <MiniScore icon={Target} label="Problem Solving" value={r.evaluation.problem_solving_score} />
                    </div>
                    {r.evaluation.areas_of_improvement?.length > 0 && (
                      <div className="mt-4">
                        <div className="text-xs uppercase text-muted-foreground mb-1">Areas of Improvement</div>
                        <ul className="text-xs text-muted-foreground list-disc list-inside space-y-0.5">
                          {r.evaluation.areas_of_improvement.map((s,si)=><li key={si}>{s}</li>)}
                        </ul>
                      </div>
                    )}
                    {r.evaluation.better_sample_answer && (
                      <div className="mt-4 rounded-lg border border-border p-3 bg-background/40">
                        <div className="text-xs uppercase text-muted-foreground mb-1 flex items-center gap-1"><Sparkles className="size-3" /> Better Sample Answer</div>
                        <div className="text-sm">{r.evaluation.better_sample_answer}</div>
                      </div>
                    )}
                  </>
                )}
              </>
            )}
          </Card>
        ))}

        {awaitingAnswer && (
          <Card>
            <textarea value={answer} onChange={e=>setAnswer(e.target.value)} placeholder="Type your answer..."
              className="w-full bg-input border border-border rounded-lg px-3 py-2 text-sm h-32 outline-none focus:border-ring" />
            <div className="flex gap-2 mt-3">
              <Btn onClick={submitAnswer} disabled={loading}><Send className="size-4 inline mr-1" />{loading ? "Evaluating..." : "Submit Answer"}</Btn>
            </div>
          </Card>
        )}

        {started && !awaitingAnswer && !isComplete && (
          <div className="text-center">
            <Btn onClick={nextQuestion} disabled={loading}>{loading ? "Loading..." : `Next Question (${rounds.length+1}/${total}) →`}</Btn>
          </div>
        )}

        {isComplete && (
          <Card>
            {!report ? (
              <div className="text-center py-8 text-muted-foreground">{loading ? "Generating analytics report..." : "Report will appear here."}</div>
            ) : (
              <div>
                <div className="flex items-center gap-3 mb-4">
                  <div className="size-12 rounded-2xl bg-gradient-primary grid place-items-center shadow-glow"><Trophy className="size-6 text-primary-foreground" /></div>
                  <div>
                    <div className="text-xs uppercase tracking-wider text-muted-foreground">Final Report</div>
                    <div className="font-display font-semibold text-lg">Interview Performance</div>
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-3">
                  <BigScore label="Overall Score" value={report.overall_score} />
                  <BigScore label="Percentage" value={report.percentage} suffix="%" />
                  <BigScore label="Readiness" value={report.interview_readiness_score} suffix="%" />
                </div>
                <div className="grid md:grid-cols-2 gap-3 mt-4">
                  <ListBlock title="Strengths" items={report.strengths} tone="success" />
                  <ListBlock title="Weaknesses" items={report.weaknesses} tone="warning" />
                  <ListBlock title="Skill Gaps" items={report.skill_gaps} tone="destructive" />
                  <ListBlock title="Learning Recommendations" items={report.learning_recommendations} tone="primary" />
                </div>
                {report.improvement_plan?.length > 0 && (
                  <div className="mt-4 rounded-lg border border-border p-3">
                    <div className="text-xs uppercase text-muted-foreground mb-2 flex items-center gap-1"><BarChart3 className="size-3" /> Improvement Plan</div>
                    <ol className="space-y-1.5">
                      {report.improvement_plan.map((s,i)=>(
                        <li key={i} className="flex gap-2 text-sm"><span className="size-5 rounded-full bg-gradient-primary text-primary-foreground text-[10px] grid place-items-center shrink-0">{i+1}</span><span>{s}</span></li>
                      ))}
                    </ol>
                  </div>
                )}
                <Btn onClick={reset} className="mt-5">Start New Interview</Btn>
              </div>
            )}
          </Card>
        )}
      </div>
    </div>
  );
}

function MiniScore({ icon: Icon, label, value }: { icon: React.ComponentType<{className?:string}>; label: string; value: number }) {
  return (
    <div className="rounded-lg border border-border p-2.5">
      <div className="flex items-center gap-1 text-[10px] uppercase tracking-wider text-muted-foreground"><Icon className="size-3" />{label}</div>
      <div className="text-base font-semibold mt-1">{value}/10</div>
      <div className="h-1 mt-1 bg-muted rounded-full overflow-hidden"><div className="h-full bg-gradient-primary" style={{width:`${(value/10)*100}%`}}/></div>
    </div>
  );
}

function BigScore({ label, value, suffix = "" }: { label: string; value: number; suffix?: string }) {
  return (
    <div className="rounded-xl border border-border p-3 text-center">
      <div className="text-[10px] uppercase tracking-wider text-muted-foreground">{label}</div>
      <div className="text-3xl font-bold gradient-text mt-1">{value}{suffix}</div>
    </div>
  );
}

function ListBlock({ title, items, tone }: { title: string; items: string[]; tone: "success"|"warning"|"destructive"|"primary" }) {
  if (!items || items.length === 0) return null;
  const toneClass = { success: "text-success", warning: "text-warning", destructive: "text-destructive", primary: "text-primary" }[tone];
  return (
    <div className="rounded-lg border border-border p-3">
      <div className={`text-xs uppercase tracking-wider mb-2 ${toneClass}`}>{title}</div>
      <ul className="text-sm space-y-1">
        {items.map((s,i)=><li key={i} className="text-muted-foreground">· {s}</li>)}
      </ul>
    </div>
  );
}
