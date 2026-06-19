import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Mic, Send, RotateCcw } from "lucide-react";
import { Card, PageHeader, Btn } from "@/components/ui-kit";
import { useServerFn } from "@tanstack/react-start";
import { generateAI } from "@/lib/ai.functions";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/_authenticated/mock-interview")({ component: MockInterview });

type Round = { question: string; answer?: string; score?: number; feedback?: string; suggestions?: string[] };

function MockInterview() {
  const [role, setRole] = useState("Software Engineer");
  const [rounds, setRounds] = useState<Round[]>([]);
  const [answer, setAnswer] = useState("");
  const [loading, setLoading] = useState(false);
  const generate = useServerFn(generateAI);

  async function nextQuestion() {
    setLoading(true);
    try {
      const prior = rounds.map(r => `Q: ${r.question}\nA: ${r.answer ?? ""}`).join("\n\n");
      const { content } = await generate({ data: {
        system: "You are an AI interviewer. Return JSON: { question: string }. Ask challenging but fair questions for the role; build on previous answers.",
        prompt: `Role: ${role}\nPrevious rounds:\n${prior || "(none)"}\n\nGenerate the next interview question.`,
        json: true,
      }});
      const { question } = JSON.parse(content);
      setRounds(rs => [...rs, { question }]);
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
        system: "You are a strict but fair interview evaluator. Return JSON: {score: 0-10 integer, feedback: string, suggestions: string[]}.",
        prompt: `Role: ${role}\nQuestion: ${cur.question}\nAnswer: ${answer}\n\nEvaluate.`,
        json: true,
      }});
      const ev = JSON.parse(content);
      setRounds(rs => rs.map((r, i) => i === idx ? { ...r, answer, ...ev } : r));
      setAnswer("");
      const { data: u } = await supabase.auth.getUser();
      if (u.user) {
        const allScores = [...rounds.slice(0, idx).map(r=>r.score||0), ev.score];
        const readiness = Math.round((allScores.reduce((a,b)=>a+b,0) / allScores.length) * 10);
        await supabase.from("profiles").update({ interview_readiness: readiness }).eq("id", u.user.id);
      }
    } catch (e) { toast.error(e instanceof Error ? e.message : "Failed"); }
    finally { setLoading(false); }
  }

  function reset() { setRounds([]); setAnswer(""); }

  const current = rounds[rounds.length - 1];
  const awaitingAnswer = current && !current.answer;

  return (
    <div>
      <PageHeader title="AI Mock Interview" subtitle="Practice with our AI interviewer — get scored feedback after every answer." icon={Mic} />
      <Card className="mb-6 flex flex-wrap items-center gap-3">
        <label className="text-sm">Role:</label>
        <input value={role} onChange={e=>setRole(e.target.value)} className="bg-input border border-border rounded-lg px-3 py-2 text-sm outline-none focus:border-ring" />
        {rounds.length === 0 ? (
          <Btn onClick={nextQuestion} disabled={loading}>{loading ? "Starting..." : "Start Interview"}</Btn>
        ) : (
          <>
            <button onClick={reset} className="text-sm text-muted-foreground hover:text-foreground inline-flex items-center gap-1"><RotateCcw className="size-3" /> Reset</button>
          </>
        )}
      </Card>

      <div className="space-y-4">
        {rounds.map((r, i) => (
          <Card key={i}>
            <div className="text-xs uppercase text-muted-foreground tracking-wider">Question {i+1}</div>
            <div className="font-display font-semibold mt-1 text-lg">{r.question}</div>
            {r.answer && (
              <>
                <div className="mt-4 text-xs uppercase text-muted-foreground">Your answer</div>
                <div className="mt-1 text-sm text-muted-foreground whitespace-pre-wrap">{r.answer}</div>
                <div className="mt-4 flex items-center gap-3">
                  <div className="text-3xl font-bold gradient-text">{r.score}/10</div>
                  <div className="flex-1">
                    <div className="text-sm">{r.feedback}</div>
                    {r.suggestions && (
                      <ul className="mt-2 text-xs text-muted-foreground list-disc list-inside space-y-0.5">
                        {r.suggestions.map((s,si)=><li key={si}>{s}</li>)}
                      </ul>
                    )}
                  </div>
                </div>
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

        {rounds.length > 0 && !awaitingAnswer && (
          <div className="text-center">
            <Btn onClick={nextQuestion} disabled={loading}>{loading ? "Loading..." : "Next Question →"}</Btn>
          </div>
        )}
      </div>
    </div>
  );
}
