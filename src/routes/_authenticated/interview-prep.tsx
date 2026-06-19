import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { MessageSquare, ChevronDown } from "lucide-react";
import { Card, PageHeader, Btn } from "@/components/ui-kit";
import { useServerFn } from "@tanstack/react-start";
import { generateAI } from "@/lib/ai.functions";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/interview-prep")({ component: PrepPage });

const TOPICS = ["HR Questions", "Technical Questions", "SQL Questions", "Python Questions", "Power BI Questions"];
const DIFFS = ["Easy", "Medium", "Hard"] as const;

type QA = { question: string; answer: string };

function PrepPage() {
  const [topic, setTopic] = useState(TOPICS[0]);
  const [diff, setDiff] = useState<typeof DIFFS[number]>("Medium");
  const [qas, setQas] = useState<QA[]>([]);
  const [open, setOpen] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const generate = useServerFn(generateAI);

  async function load() {
    setLoading(true); setQas([]);
    try {
      const { content } = await generate({ data: {
        system: "You are a top interview coach. Return JSON: { items: [{question, answer}] } with 8 high-quality items.",
        prompt: `Topic: ${topic}. Difficulty: ${diff}. Provide 8 commonly asked interview questions with model answers.`,
        json: true,
      }});
      setQas((JSON.parse(content) as { items: QA[] }).items);
    } catch (e) { toast.error(e instanceof Error ? e.message : "Failed"); }
    finally { setLoading(false); }
  }

  return (
    <div>
      <PageHeader title="Interview Preparation" subtitle="Curated questions with model answers — by topic and difficulty." icon={MessageSquare} />
      <Card className="mb-6">
        <div className="flex flex-wrap gap-4">
          <div className="flex-1 min-w-[200px]">
            <div className="text-sm font-medium mb-2">Topic</div>
            <div className="flex flex-wrap gap-2">
              {TOPICS.map(t => (
                <button key={t} onClick={()=>setTopic(t)} className={`px-3 py-1.5 rounded-full text-sm border ${topic===t ? "border-primary bg-primary/10" : "border-border text-muted-foreground hover:bg-muted"}`}>{t}</button>
              ))}
            </div>
          </div>
          <div>
            <div className="text-sm font-medium mb-2">Difficulty</div>
            <div className="flex gap-2">
              {DIFFS.map(d => (
                <button key={d} onClick={()=>setDiff(d)} className={`px-3 py-1.5 rounded-full text-sm border ${diff===d ? "border-primary bg-primary/10" : "border-border text-muted-foreground hover:bg-muted"}`}>{d}</button>
              ))}
            </div>
          </div>
        </div>
        <Btn onClick={load} disabled={loading} className="mt-5">{loading ? "Loading..." : "Get Questions"}</Btn>
      </Card>

      <div className="space-y-3">
        {qas.map((q, i) => (
          <Card key={i} className="!p-0">
            <button onClick={()=>setOpen(open===i?null:i)} className="w-full flex justify-between items-center p-5 text-left">
              <div className="flex gap-3 items-start"><span className="text-xs text-muted-foreground mt-1">{String(i+1).padStart(2,"0")}</span><span className="font-medium">{q.question}</span></div>
              <ChevronDown className={`size-4 transition ${open===i?"rotate-180":""}`} />
            </button>
            {open===i && <div className="px-5 pb-5 text-sm text-muted-foreground border-t border-border pt-4 whitespace-pre-wrap">{q.answer}</div>}
          </Card>
        ))}
      </div>
    </div>
  );
}
