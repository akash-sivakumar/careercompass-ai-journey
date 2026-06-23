import { useEffect, useRef, useState } from "react";
import { ChevronDown, Search, X, Check } from "lucide-react";

export function SearchableSelect({
  value, onChange, options, placeholder = "Select...", className = "",
}: { value: string; onChange: (v: string) => void; options: string[]; placeholder?: string; className?: string }) {
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState("");
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    function onDoc(e: MouseEvent) { if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false); }
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, []);
  const filtered = options.filter(o => o.toLowerCase().includes(q.toLowerCase()));
  return (
    <div ref={ref} className={`relative ${className}`}>
      <button type="button" onClick={() => setOpen(o => !o)}
        className="w-full bg-input border border-border rounded-lg px-3 py-2 text-sm flex items-center justify-between hover:border-ring transition">
        <span className={value ? "" : "text-muted-foreground"}>{value || placeholder}</span>
        <ChevronDown className={`size-4 text-muted-foreground transition ${open ? "rotate-180" : ""}`} />
      </button>
      {open && (
        <div className="absolute z-50 mt-1 w-full bg-popover border border-border rounded-lg shadow-lg overflow-hidden animate-in fade-in-0 zoom-in-95">
          <div className="p-2 border-b border-border flex items-center gap-2">
            <Search className="size-4 text-muted-foreground" />
            <input autoFocus value={q} onChange={e => setQ(e.target.value)} placeholder="Search..."
              className="flex-1 bg-transparent text-sm outline-none" />
          </div>
          <div className="max-h-64 overflow-y-auto">
            {filtered.length === 0 && <div className="px-3 py-4 text-xs text-muted-foreground text-center">No results</div>}
            {filtered.map(o => (
              <button key={o} type="button" onClick={() => { onChange(o); setOpen(false); setQ(""); }}
                className={`w-full text-left px-3 py-2 text-sm flex items-center justify-between hover:bg-muted transition ${value === o ? "bg-primary/10 text-foreground" : ""}`}>
                {o}{value === o && <Check className="size-4 text-primary" />}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export function MultiSkillSelect({
  values, onChange, groups, placeholder = "Search and add skills...",
}: { values: string[]; onChange: (v: string[]) => void; groups: Record<string, string[]>; placeholder?: string }) {
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState("");
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    function onDoc(e: MouseEvent) { if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false); }
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, []);
  function toggle(s: string) {
    onChange(values.includes(s) ? values.filter(x => x !== s) : [...values, s]);
  }
  return (
    <div ref={ref} className="relative">
      <div onClick={() => setOpen(true)}
        className="min-h-11 w-full bg-input border border-border rounded-lg px-3 py-2 text-sm flex flex-wrap gap-1.5 items-center cursor-text hover:border-ring transition">
        {values.length === 0 && <span className="text-muted-foreground">{placeholder}</span>}
        {values.map(v => (
          <span key={v} className="px-2 py-0.5 rounded-full bg-primary/15 text-primary text-xs flex items-center gap-1">
            {v}
            <button type="button" onClick={e => { e.stopPropagation(); toggle(v); }}><X className="size-3" /></button>
          </span>
        ))}
        <ChevronDown className={`size-4 ml-auto text-muted-foreground transition ${open ? "rotate-180" : ""}`} />
      </div>
      {open && (
        <div className="absolute z-50 mt-1 w-full bg-popover border border-border rounded-lg shadow-lg overflow-hidden animate-in fade-in-0 zoom-in-95">
          <div className="p-2 border-b border-border flex items-center gap-2">
            <Search className="size-4 text-muted-foreground" />
            <input autoFocus value={q} onChange={e => setQ(e.target.value)} placeholder="Search skills..."
              className="flex-1 bg-transparent text-sm outline-none" />
          </div>
          <div className="max-h-72 overflow-y-auto">
            {Object.entries(groups).map(([group, items]) => {
              const fi = items.filter(i => i.toLowerCase().includes(q.toLowerCase()));
              if (fi.length === 0) return null;
              return (
                <div key={group}>
                  <div className="px-3 py-1.5 text-[10px] uppercase tracking-wider text-muted-foreground bg-muted/40 sticky top-0">{group}</div>
                  <div className="flex flex-wrap gap-1.5 p-2">
                    {fi.map(s => {
                      const sel = values.includes(s);
                      return (
                        <button key={s} type="button" onClick={() => toggle(s)}
                          className={`px-2.5 py-1 rounded-full text-xs border transition ${sel ? "border-primary bg-primary/15 text-primary" : "border-border text-muted-foreground hover:bg-muted"}`}>
                          {s}{sel && <Check className="size-3 inline ml-1" />}
                        </button>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

export const SKILL_GROUPS: Record<string, string[]> = {
  Programming: ["Python","Java","C","C++","C#","JavaScript","TypeScript","Go","Rust","PHP","Kotlin","Swift"],
  "Data Analytics": ["Excel","SQL","Power BI","Tableau","Statistics","Data Visualization","Business Analytics"],
  "Data Science": ["Pandas","NumPy","Matplotlib","Seaborn","Scikit-learn","Machine Learning","Deep Learning","NLP","Computer Vision"],
  "AI & Generative AI": ["Prompt Engineering","LLMs","OpenAI API","LangChain","RAG","Vector Databases","Agentic AI","Generative AI","AI Engineering"],
  "Cloud & DevOps": ["AWS","Azure","Google Cloud","Docker","Kubernetes","CI/CD","Terraform","Linux"],
  "Web Development": ["HTML","CSS","React","Angular","Vue","Node.js","Express.js","Next.js"],
  "Cyber Security": ["Network Security","Penetration Testing","Ethical Hacking","Digital Forensics","SIEM"],
  Database: ["MySQL","PostgreSQL","MongoDB","Oracle","Firebase","Supabase"],
};

export const TARGET_ROLES = [
  "Data Analyst","Business Analyst","Data Scientist","Machine Learning Engineer","AI Engineer",
  "Generative AI Engineer","Prompt Engineer","Data Engineer","Cloud Engineer","AWS Engineer",
  "Azure Engineer","DevOps Engineer","Cyber Security Analyst","Ethical Hacker","Network Engineer",
  "Backend Developer","Frontend Developer","Full Stack Developer","Software Engineer","Python Developer",
  "Java Developer","React Developer","Node.js Developer","Mobile App Developer","Android Developer",
  "iOS Developer","UI/UX Designer","Product Manager","Project Manager","QA Engineer","Automation Tester",
  "Salesforce Developer","SAP Consultant","Business Intelligence Analyst","Power BI Developer","Tableau Developer",
];

export const DOMAINS = [
  "Artificial Intelligence","Machine Learning","Data Science","Data Analytics","Cloud Computing",
  "Cyber Security","Software Engineering","Web Development","Mobile Development","Product Management",
  "UI/UX Design","DevOps","Blockchain","IoT","AR/VR","Game Development","Business Intelligence",
  "Digital Marketing","FinTech","HealthTech","EdTech",
];

export const EDUCATION_OPTIONS = [
  "B.Sc Computer Science","B.Sc Data Analytics","B.Sc Information Technology","BCA","MCA",
  "B.Tech CSE","B.Tech AI & DS","B.Tech IT","B.Tech ECE","B.Com","M.Com","BA","MA","MBA","Diploma","Other",
];

export const ROADMAP_DOMAINS = [
  "Data Analytics","Business Analytics","Data Science","Machine Learning","Deep Learning",
  "Artificial Intelligence","Generative AI","Prompt Engineering","Agentic AI","AI Engineering","MLOps",
  "Data Engineering","Cloud Computing","AWS Cloud","Azure Cloud","Google Cloud","DevOps",
  "Site Reliability Engineering","Cyber Security","Ethical Hacking","Network Security","Digital Forensics",
  "Software Engineering","Backend Development","Frontend Development","Full Stack Development",
  "Mobile App Development","Android Development","iOS Development","UI/UX Design","Product Management",
  "Project Management","Blockchain Development","Web3 Development","Game Development","AR/VR Development",
  "IoT","Embedded Systems","Database Administration","System Administration","Networking",
  "QA Testing","Automation Testing","Salesforce Development","SAP Consultant","Business Intelligence",
  "Power BI Specialist","Tableau Specialist","Python Development","Java Development","React Development","Node.js Development",
];

export const INTERVIEW_ROLES = [
  "Data Analyst","Business Analyst","Data Scientist","Machine Learning Engineer","AI Engineer",
  "Generative AI Engineer","Prompt Engineer","Data Engineer","Cloud Engineer","DevOps Engineer",
  "Cyber Security Analyst","Ethical Hacker","Network Engineer","Backend Developer","Frontend Developer",
  "Full Stack Developer","Python Developer","Java Developer","React Developer","Node.js Developer",
  "Software Engineer","QA Engineer","Automation Tester","UI/UX Designer","Product Manager",
  "Project Manager","Mobile App Developer","Android Developer","iOS Developer","Technical Support Engineer",
];
