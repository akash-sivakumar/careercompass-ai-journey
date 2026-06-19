import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { User as UserIcon, Save, KeyRound, LogOut } from "lucide-react";
import { Card, PageHeader, Btn, GhostBtn } from "@/components/ui-kit";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/profile")({ component: Profile });

type ProfileRow = {
  id: string; full_name: string | null; email: string | null;
  college_name: string | null; degree: string | null; branch: string | null;
  graduation_year: number | null; target_role: string | null; skills: string[] | null;
};

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

  return (
    <div>
      <PageHeader title="My Profile" subtitle="Keep your details up to date for better recommendations." icon={UserIcon} />
      <Card className="mb-6 flex items-center gap-5">
        <div className="size-20 rounded-full bg-gradient-primary grid place-items-center text-3xl font-bold text-primary-foreground shadow-glow">
          {p.full_name?.[0]?.toUpperCase() || "U"}
        </div>
        <div>
          <div className="text-2xl font-display font-semibold">{p.full_name || "Unnamed"}</div>
          <div className="text-sm text-muted-foreground">{p.email}</div>
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
                {s}<button onClick={()=>set("skills", (p.skills||[]).filter(x=>x!==s))}>×</button>
              </span>
            ))}
          </div>

          <div className="mt-8 flex flex-wrap gap-2">
            <Btn onClick={save} disabled={saving}><Save className="size-4 inline mr-1" />{saving?"Saving...":"Edit Profile"}</Btn>
            <GhostBtn onClick={changePassword}><KeyRound className="size-4 inline mr-1" /> Change Password</GhostBtn>
            <GhostBtn onClick={logout} className="text-destructive"><LogOut className="size-4 inline mr-1" /> Logout</GhostBtn>
          </div>
        </Card>
      </div>
      <style>{`.input-base{width:100%;background:var(--color-input);border:1px solid var(--color-border);border-radius:0.625rem;padding:0.5rem 0.75rem;color:var(--color-foreground);font-size:0.875rem;outline:none}.input-base:focus{border-color:var(--color-ring);box-shadow:0 0 0 3px oklch(0.68 0.20 285 / 0.18)}`}</style>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return <label className="block mb-3"><span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">{label}</span><div className="mt-1.5">{children}</div></label>;
}
