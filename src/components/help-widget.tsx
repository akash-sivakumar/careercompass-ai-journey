import { useState } from "react";
import { HelpCircle, X, Phone, Mail, MessageCircle, ChevronDown } from "lucide-react";

const PHONE = "+91 8870193336";
const EMAIL = "akashsivakumar006@gmail.com";

const FAQS: { q: string; a: string }[] = [
  { q: "How does Resume Analyzer work?", a: "Upload your resume and our AI parses it, scores ATS readiness, and gives section-by-section suggestions to align it with your target role." },
  { q: "How does Skill Gap Analysis work?", a: "Select your current skills and a target role. The AI compares them against industry expectations and returns matched skills, missing skills, a roadmap, and a readiness score." },
  { q: "How does Career AI work?", a: "Tell us your skills, interests, and education. The AI recommends the best-fit career paths with salary ranges, required tech, certifications and next steps." },
  { q: "How does Roadmap Generation work?", a: "Pick a domain and we generate a structured learning path across Beginner, Intermediate, Advanced and Expert levels with projects, tools and timelines." },
  { q: "How does Mock Interview work?", a: "Choose a role, difficulty and interview type. The AI conducts a live interview, scores every answer, and gives a final analytics report." },
];

export function HelpWidget() {
  const [open, setOpen] = useState(false);
  const [tab, setTab] = useState<"contact" | "faq">("contact");
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  return (
    <div className="fixed bottom-6 right-6 z-[60]">
      {open && (
        <div className="mb-3 w-[340px] max-w-[calc(100vw-3rem)] rounded-2xl border border-border bg-card/80 backdrop-blur-xl shadow-2xl overflow-hidden animate-in slide-in-from-bottom-4 fade-in-0">
          <div className="bg-gradient-primary p-4 text-primary-foreground flex items-center justify-between">
            <div>
              <div className="font-semibold">Need Help?</div>
              <div className="text-xs opacity-90">We're here to support you</div>
            </div>
            <button onClick={() => setOpen(false)} className="p-1 rounded-lg hover:bg-white/10"><X className="size-4" /></button>
          </div>
          <div className="flex border-b border-border">
            {(["contact","faq"] as const).map(t => (
              <button key={t} onClick={() => setTab(t)}
                className={`flex-1 px-3 py-2 text-xs font-medium uppercase tracking-wider transition ${tab===t ? "text-primary border-b-2 border-primary" : "text-muted-foreground hover:text-foreground"}`}>
                {t === "contact" ? "Contact" : "FAQ"}
              </button>
            ))}
          </div>
          <div className="p-4 max-h-[420px] overflow-y-auto">
            {tab === "contact" ? (
              <div className="space-y-3">
                <div className="rounded-xl border border-border p-3 bg-background/40">
                  <div className="text-xs text-muted-foreground uppercase tracking-wider">Phone</div>
                  <div className="text-sm font-medium mt-0.5">{PHONE}</div>
                </div>
                <div className="rounded-xl border border-border p-3 bg-background/40">
                  <div className="text-xs text-muted-foreground uppercase tracking-wider">Email</div>
                  <div className="text-sm font-medium mt-0.5 break-all">{EMAIL}</div>
                </div>
                <div className="grid grid-cols-3 gap-2 pt-1">
                  <a href={`tel:${PHONE.replace(/\s/g,"")}`} className="flex flex-col items-center gap-1 p-3 rounded-xl bg-gradient-primary text-primary-foreground text-xs font-medium hover:opacity-95 transition">
                    <Phone className="size-4" />Call
                  </a>
                  <a href={`mailto:${EMAIL}`} className="flex flex-col items-center gap-1 p-3 rounded-xl border border-border text-xs font-medium hover:bg-muted transition">
                    <Mail className="size-4" />Email
                  </a>
                  <button onClick={() => setTab("faq")} className="flex flex-col items-center gap-1 p-3 rounded-xl border border-border text-xs font-medium hover:bg-muted transition">
                    <MessageCircle className="size-4" />FAQ
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-2">
                {FAQS.map((f, i) => (
                  <div key={i} className="rounded-xl border border-border overflow-hidden bg-background/40">
                    <button onClick={() => setOpenFaq(openFaq===i ? null : i)} className="w-full px-3 py-2.5 text-left text-sm flex items-center justify-between hover:bg-muted/50 transition">
                      <span className="font-medium pr-2">{f.q}</span>
                      <ChevronDown className={`size-4 shrink-0 text-muted-foreground transition ${openFaq===i ? "rotate-180" : ""}`} />
                    </button>
                    {openFaq===i && <div className="px-3 pb-3 text-xs text-muted-foreground">{f.a}</div>}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
      <button onClick={() => setOpen(o => !o)}
        className="size-14 rounded-full bg-gradient-primary text-primary-foreground shadow-glow flex items-center justify-center hover:scale-105 transition-transform">
        {open ? <X className="size-6" /> : <HelpCircle className="size-6" />}
      </button>
    </div>
  );
}
