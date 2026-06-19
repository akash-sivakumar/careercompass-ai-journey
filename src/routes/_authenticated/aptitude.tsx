import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Brain, Timer, Trophy } from "lucide-react";
import { Card, PageHeader, Btn } from "@/components/ui-kit";
import { useServerFn } from "@tanstack/react-start";
import { generateAI } from "@/lib/ai.functions";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/aptitude")({ component: Aptitude });

const CATS = ["Quantitative Aptitude", "Logical Reasoning", "Verbal Ability"];

type Q = { question: string; options: string[]; answer_index: number; explanation: string };

function Aptitude() {
  const [cat, setCat] = useState(CATS[0]);
  const [qs, setQs] = useState<Q[]>([]);
  const [idx, setIdx] = useState(0);
  const [picked, setPicked] = useState<Record<number, number>>({});
  const [submitted, setSubmitted] = useState(false);
  const [time, setTime] = useState(0);
  const [running, setRunning] = useState(false);
  const [loading, setLoading] = useState(false);
  const generate = useServerFn(generateAI);

  useEffect(() => {
    if (!running) return;
    const t = setInterval(() => setTime(s => s + 1), 1000);
    return () => clearInterval(t);
  }, [running]);

  async function load() {
    setLoading(true); setQs([]); setPicked({}); setIdx(0); setSubmitted(false); setTime(0);
    try {
      const { content } = await generate({ data: {
        system: "You generate aptitude test questions. Return JSON: { questions: [{question, options: string[4], answer_index: 0-3, explanation}] } with 10 questions.",
        prompt: `Category: ${cat}. Generate 10 mixed-difficulty multiple choice questions.`,
        json: true,
      }});
      setQs((JSON.parse(content) as { questions: Q[] }).questions);
      setRunning(true);
    } catch (e) { toast.error(e instanceof Error ? e.message : "Failed"); }
    finally { setLoading(false); }
  }

  function pick(i: number) { if (!submitted) setPicked(p => ({ ...p, [idx]: i })); }
  function submit() { setSubmitted(true); setRunning(false); }
  const score = qs.length ? qs.filter((q, i) => picked[i] === q.answer_index).length : 0;

  return (
    <div>
      <PageHeader title="Aptitude Practice" subtitle="Quant, logical reasoning, and verbal ability — timed practice tests." icon={Brain} />

      {qs.length === 0 ? (
        <Card>
          <div className="text-sm font-medium mb-2">Choose category</div>
          <div className="flex flex-wrap gap-2">
            {CATS.map(c => (
              <button key={c} onClick={()=>setCat(c)} className={`px-3 py-1.5 rounded-full text-sm border ${cat===c ? "border-primary bg-primary/10" : "border-border text-muted-foreground hover:bg-muted"}`}>{c}</button>
            ))}
          </div>
          <Btn onClick={load} disabled={loading} className="mt-5">{loading ? "Generating..." : "Start Test"}</Btn>
        </Card>
      ) : submitted ? (
        <Card className="text-center">
          <Trophy className="size-12 mx-auto text-warning" />
          <div className="text-4xl font-bold mt-4">{score}/{qs.length}</div>
          <div className="text-muted-foreground">Time: {Math.floor(time/60)}m {time%60}s</div>
          <div className="text-left mt-6 space-y-3">
            {qs.map((q, i) => (
              <div key={i} className={`border rounded-lg p-3 ${picked[i]===q.answer_index?"border-success/40":"border-destructive/40"}`}>
                <div className="text-sm font-medium">{i+1}. {q.question}</div>
                <div className="text-xs text-muted-foreground mt-1">Correct: {q.options[q.answer_index]}</div>
                <div className="text-xs mt-1">{q.explanation}</div>
              </div>
            ))}
          </div>
          <Btn onClick={()=>setQs([])} className="mt-6">Try Another</Btn>
        </Card>
      ) : (
        <>
          <div className="flex justify-between items-center mb-4">
            <div className="text-sm text-muted-foreground">Question {idx+1} of {qs.length}</div>
            <div className="inline-flex items-center gap-2 bg-muted px-3 py-1.5 rounded-full text-sm"><Timer className="size-4" />{Math.floor(time/60)}:{String(time%60).padStart(2,"0")}</div>
          </div>
          <Card>
            <div className="font-display font-semibold text-lg">{qs[idx].question}</div>
            <div className="grid sm:grid-cols-2 gap-2 mt-4">
              {qs[idx].options.map((o, i) => (
                <button key={i} onClick={()=>pick(i)}
                  className={`text-left px-4 py-3 rounded-lg border text-sm ${picked[idx]===i ? "border-primary bg-primary/10" : "border-border hover:bg-muted"}`}>
                  <span className="font-medium mr-2">{String.fromCharCode(65+i)}.</span>{o}
                </button>
              ))}
            </div>
            <div className="flex justify-between mt-6">
              <button onClick={()=>setIdx(Math.max(0, idx-1))} disabled={idx===0} className="text-sm text-muted-foreground disabled:opacity-30">← Prev</button>
              {idx < qs.length-1
                ? <Btn onClick={()=>setIdx(idx+1)}>Next →</Btn>
                : <Btn onClick={submit}>Submit Test</Btn>}
            </div>
          </Card>
        </>
      )}
    </div>
  );
}
