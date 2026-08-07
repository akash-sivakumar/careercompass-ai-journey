import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { User as UserIcon, Save, KeyRound, LogOut, Link2, Target } from "lucide-react";
import { Card, PageHeader, Btn, GhostBtn } from "@/components/ui-kit";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/profile")({ component: Profile });

type ProfileRow = {
  id: string; full_name: string | null; email: string | null;
  college_name: string | null; degree: string | null; branch: string | null;
  graduation_year: number | null; target_role: string | null; skills: string[] | null;
  experience: string | null; career_goals: string | null; preferred_industry: string | null;
  portfolio_url: string | null; github_url: string | null; linkedin_url: string | null;
  preferred_domains: string[] | null;
  resume_score: number | null; resume_role_match: number | null; resume_salary_prediction: string | null;
  interview_readiness: number | null; career_readiness: number | null;
};

const INDUSTRIES = ["Product / Tech", "IT Services", "Startups", "Finance / Fintech", "Healthcare", "E-commerce", "Consulting", "Government / PSU", "Education", "Manufacturing"];
const DOMAINS = ["Data Analytics", "Data Science", "Machine Learning", "AI Engineering", "Web Development", "Mobile Development", "Cloud / DevOps", "Cyber Security", "UI/UX Design", "Software Engineering"];

function Profile() {
  const navigate = useNavigate();
  const [p, setP] = useState<ProfileRow | null>(null);
  const [skillInput, setSkillInput] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    supabase.auth.getUser().then(async ({ data }) => {
      if (!data.user) return;
      const { data: prof } = await supabase.from("profiles").select("*").eq("id", data.user.id).maybeSingle();
      setP(prof as ProfileRow);
    });
  }, []);

  if (!p) return <div className="text-muted-foreground">Loading...</div>;

  function set<K extends keyof ProfileRow>(k: K, v: ProfileRow[K]) { setP(prev => prev ? { ...prev, [k]: v } : prev); }

  async function save() {
    if (!p) return;
    setSaving(true);
    const { error } = await supabase.from("profiles").update({
      full_name: p.full_name, college_name: p.college_name, degree: p.degree,
      branch: p.branch, graduation_year: p.graduation_year, target_role: p.target_role, skills: p.skills,
      experience: p.experience, career_goals: p.career_goals, preferred_industry: p.preferred_industry,
      portfolio_url: p.portfolio_url, github_url: p.github_url, linkedin_url: p.linkedin_url,
      preferred_domains: p.preferred_domains,
    }).eq("id", p.id);
    setSaving(false);
    if (error) toast.error(error.message); else toast.success("Profile saved");
  }

  async function changePassword() {
    const email = p?.email; if (!email) return;
    const { error } = await supabase.auth.resetPasswordForEmail(email, { redirectTo: `${window.location.origin}/reset-password` });
    if (error) toast.error(error.message); else toast.success("Password reset link sent to your email");
  }

  async function logout() {
    await supabase.auth.signOut();
    navigate({ to: "/auth", replace: true });
  }

  function addSkill() {
    if (!p) return;
    const t = skillInput.trim(); if (!t) return;
    const next = Array.from(new Set([...(p.skills||[]), t]));
    set("skills", next); setSkillInput("");
  }

  function toggleDomain(d: string) {
    if (!p) return;
    const cur = p.preferred_domains || [];
    set("preferred_domains", cur.includes(d) ? cur.filter(x => x !== d) : [...cur, d]);
  }

  return (
    <div>
      <PageHeader title="My Profile" subtitle="Keep your details up to date for better recommendations." icon={UserIcon} />
      <Card className="mb-6 flex flex-wrap items-center gap-5">
        <div className="size-20 rounded-full bg-gradient-primary grid place-items-center text-3xl font-bold text-primary-foreground shadow-glow">
          {p.full_name?.[0]?.toUpperCase() || "U"}
        </div>
        <div className="flex-1 min-w-[180px]">
          <div className="text-2xl font-display font-semibold">{p.full_name || "Unnamed"}</div>
          <div className="text-sm text-muted-foreground">{p.email}</div>
          {p.target_role && <div className="text-xs text-muted-foreground mt-1">Target: {p.target_role}</div>}
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          <Stat label="ATS score" value={p.resume_score != null ? `${p.resume_score}` : "—"} />
          <Stat label="Role match" value={p.resume_role_match != null ? `${p.resume_role_match}%` : "—"} />
          <Stat label="Interview" value={p.interview_readiness != null ? `${p.interview_readiness}%` : "—"} />
          <Stat label="Salary est." value={p.resume_salary_prediction || "—"} small />
        </div>
      </Card>

      <div className="grid md:grid-cols-2 gap-4">
        <Card>
          <div className="font-display font-semibold mb-4">Personal info</div>
          <Field label="Full name"><input className="input-base" value={p.full_name||""} onChange={e=>set("full_name", e.target.value)} /></Field>
          <Field label="College name"><input className="input-base" value={p.college_name||""} onChange={e=>set("college_name", e.target.value)} /></Field>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Degree"><input className="input-base" value={p.degree||""} onChange={e=>set("degree", e.target.value)} placeholder="B.Tech" /></Field>
            <Field label="Branch"><input className="input-base" value={p.branch||""} onChange={e=>set("branch", e.target.value)} placeholder="CSE" /></Field>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Graduation year"><input type="number" className="input-base" value={p.graduation_year||""} onChange={e=>set("graduation_year", e.target.value? Number(e.target.value): null)} /></Field>
            <Field label="Target role"><input className="input-base" value={p.target_role||""} onChange={e=>set("target_role", e.target.value)} /></Field>
          </div>
          <Field label="Work experience">
            <textarea className="input-base h-20" value={p.experience||""} onChange={e=>set("experience", e.target.value)} placeholder="Internships, jobs, freelance work..." />
          </Field>
        </Card>

        <Card>
          <div className="font-display font-semibold mb-4">Skills</div>
          <div className="flex gap-2">
            <input className="input-base flex-1" value={skillInput} onChange={e=>setSkillInput(e.target.value)} onKeyDown={e=>e.key==="Enter" && (e.preventDefault(), addSkill())} placeholder="Add a skill..." />
            <Btn onClick={addSkill} type="button">Add</Btn>
          </div>
          <div className="flex flex-wrap gap-2 mt-3">
            {(p.skills||[]).map(s => (
              <span key={s} className="px-3 py-1 rounded-full bg-muted text-xs flex items-center gap-1">
                {s}<button onClick={()=>set("skills", (p.skills||[]).filter(x=>x!==s))} aria-label={`Remove ${s}`}>×</button>
              </span>
            ))}
          </div>

          <div className="font-display font-semibold mt-6 mb-3 flex items-center gap-2"><Target className="size-4 text-primary" />Learning domains of interest</div>
          <div className="flex flex-wrap gap-2">
            {DOMAINS.map(d => {
              const on = (p.preferred_domains||[]).includes(d);
              return (
                <button key={d} type="button" onClick={()=>toggleDomain(d)}
                  className={`px-3 py-1 rounded-full text-xs border transition-colors ${on ? "bg-gradient-primary text-primary-foreground border-transparent" : "bg-muted border-border hover:border-primary/50"}`}>
                  {d}
                </button>
              );
            })}
          </div>
        </Card>

        <Card>
          <div className="font-display font-semibold mb-4">Career preferences</div>
          <Field label="Career goals">
            <textarea className="input-base h-20" value={p.career_goals||""} onChange={e=>set("career_goals", e.target.value)} placeholder="Where do you want to be in 2 years?" />
          </Field>
          <Field label="Preferred industry">
            <select className="input-base" value={p.preferred_industry||""} onChange={e=>set("preferred_industry", e.target.value || null)}>
              <option value="">Select an industry…</option>
              {INDUSTRIES.map(i => <option key={i} value={i}>{i}</option>)}
            </select>
          </Field>
        </Card>

        <Card>
          <div className="font-display font-semibold mb-4 flex items-center gap-2"><Link2 className="size-4 text-primary" />Portfolio links</div>
          <Field label="Portfolio / website"><input className="input-base" value={p.portfolio_url||""} onChange={e=>set("portfolio_url", e.target.value)} placeholder="https://…" /></Field>
          <Field label="GitHub"><input className="input-base" value={p.github_url||""} onChange={e=>set("github_url", e.target.value)} placeholder="https://github.com/username" /></Field>
          <Field label="LinkedIn"><input className="input-base" value={p.linkedin_url||""} onChange={e=>set("linkedin_url", e.target.value)} placeholder="https://linkedin.com/in/username" /></Field>

          <div className="mt-6 flex flex-wrap gap-2">
            <Btn onClick={save} disabled={saving}><Save className="size-4 inline mr-1" />{saving?"Saving...":"Save Profile"}</Btn>
            <GhostBtn onClick={changePassword}><KeyRound className="size-4 inline mr-1" /> Change Password</GhostBtn>
            <GhostBtn onClick={logout} className="text-destructive"><LogOut className="size-4 inline mr-1" /> Logout</GhostBtn>
          </div>
        </Card>
      </div>
      <style>{`.input-base{width:100%;background:var(--color-input);border:1px solid var(--color-border);border-radius:0.625rem;padding:0.5rem 0.75rem;color:var(--color-foreground);font-size:0.875rem;outline:none}.input-base:focus{border-color:var(--color-ring);box-shadow:0 0 0 3px oklch(0.68 0.20 285 / 0.18)}`}</style>
    </div>
  );
}

function Stat({ label, value, small }: { label: string; value: string; small?: boolean }) {
  return (
    <div className="rounded-xl border border-border bg-background/40 px-3 py-2 min-w-[86px]">
      <div className="text-[10px] uppercase tracking-wider text-muted-foreground">{label}</div>
      <div className={small ? "text-xs mt-0.5" : "text-lg font-bold"}>{value}</div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return <label className="block mb-3"><span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">{label}</span><div className="mt-1.5">{children}</div></label>;
}
