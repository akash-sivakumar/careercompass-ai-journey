import { createFileRoute } from "@tanstack/react-router";
import { useCallback, useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Award, Plus, ExternalLink, Trash2, Upload, Loader2, FileText } from "lucide-react";
import { toast } from "sonner";
import { logActivity, unlockAchievement } from "@/lib/gamification";

export const Route = createFileRoute("/_authenticated/certificates")({
  head: () => ({ meta: [
    { title: "Certificates — CareerCompass AI" },
    { name: "description", content: "Track, upload, and showcase every certificate you earn." },
  ] }),
  component: CertificatesPage,
});

type Cert = {
  id: string;
  title: string;
  issuer: string | null;
  platform: string | null;
  skills: string[] | null;
  issue_date: string | null;
  credential_url: string | null;
  file_path: string | null;
  created_at: string;
};

const PLATFORMS = ["Coursera", "Udemy", "edX", "Google", "Microsoft", "AWS", "Meta", "LinkedIn Learning", "HackerRank", "Kaggle", "Other"];

function CertificatesPage() {
  const [items, setItems] = useState<Cert[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [platformFilter, setPlatformFilter] = useState("All");
  const [skillFilter, setSkillFilter] = useState("");
  const [form, setForm] = useState<{ title: string; issuer: string; platform: string; skills: string; issue_date: string; credential_url: string; file?: File }>({
    title: "", issuer: "", platform: "Coursera", skills: "", issue_date: "", credential_url: "",
  });
  const [showForm, setShowForm] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    const { data: u } = await supabase.auth.getUser();
    if (!u.user) { setLoading(false); return; }
    const { data } = await supabase.from("certificates").select("*").eq("user_id", u.user.id).order("created_at", { ascending: false });
    setItems((data as Cert[]) ?? []);
    setLoading(false);
  }, []);

  useEffect(() => { void load(); }, [load]);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.title.trim()) { toast.error("Title required"); return; }
    setUploading(true);
    try {
      const { data: u } = await supabase.auth.getUser();
      if (!u.user) throw new Error("Not signed in");
      let file_path: string | null = null;
      if (form.file) {
        const ext = form.file.name.split(".").pop() ?? "pdf";
        const path = `${u.user.id}/${Date.now()}.${ext}`;
        const { error: upErr } = await supabase.storage.from("certificates").upload(path, form.file, { upsert: false });
        if (upErr) throw upErr;
        file_path = path;
      }
      const skills = form.skills.split(",").map((s) => s.trim()).filter(Boolean);
      const { error } = await supabase.from("certificates").insert({
        user_id: u.user.id,
        title: form.title.trim(),
        issuer: form.issuer.trim() || null,
        platform: form.platform,
        skills,
        issue_date: form.issue_date || null,
        credential_url: form.credential_url.trim() || null,
        file_path,
      });
      if (error) throw error;
      await logActivity("certificate_added", form.title.trim(), { xp: 40, meta: { platform: form.platform } });
      const { count } = await supabase.from("certificates").select("*", { count: "exact", head: true }).eq("user_id", u.user.id);
      if ((count ?? 0) >= 1) await unlockAchievement("first_certificate", { silent: false });
      if ((count ?? 0) >= 5) await unlockAchievement("certified_pro", { silent: false });
      toast.success("Certificate added");
      setForm({ title: "", issuer: "", platform: "Coursera", skills: "", issue_date: "", credential_url: "" });
      setShowForm(false);
      await load();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to save");
    } finally { setUploading(false); }
  }

  async function remove(c: Cert) {
    if (!confirm(`Delete "${c.title}"?`)) return;
    if (c.file_path) await supabase.storage.from("certificates").remove([c.file_path]);
    await supabase.from("certificates").delete().eq("id", c.id);
    toast.success("Removed");
    await load();
  }

  async function openFile(path: string) {
    const { data, error } = await supabase.storage.from("certificates").createSignedUrl(path, 60);
    if (error || !data) { toast.error("Could not open file"); return; }
    window.open(data.signedUrl, "_blank");
  }

  const allSkills = Array.from(new Set(items.flatMap((c) => c.skills ?? []))).sort();
  const filtered = items.filter((c) =>
    (platformFilter === "All" || c.platform === platformFilter) &&
    (!skillFilter || (c.skills ?? []).includes(skillFilter))
  );

  return (
    <div className="space-y-6">
      <header className="flex items-center justify-between gap-3 flex-wrap">
        <div className="flex items-center gap-3">
          <div className="size-11 rounded-2xl bg-gradient-primary grid place-items-center shadow-glow"><Award className="size-5 text-primary-foreground" /></div>
          <div>
            <h1 className="text-3xl font-display font-bold">Certificates</h1>
            <p className="text-sm text-muted-foreground">{items.length} earned · showcase them on your resume and LinkedIn.</p>
          </div>
        </div>
        <button onClick={() => setShowForm((v) => !v)}
          className="inline-flex items-center gap-1 text-sm px-4 py-2 rounded-lg bg-gradient-primary text-primary-foreground shadow-glow">
          <Plus className="size-4" /> Add certificate
        </button>
      </header>

      {showForm && (
        <form onSubmit={submit} className="rounded-2xl border border-border bg-card/60 p-5 space-y-3">
          <div className="grid gap-3 sm:grid-cols-2">
            <Field label="Title *"><input required value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} className="input" placeholder="e.g. Google Data Analytics" /></Field>
            <Field label="Issuer"><input value={form.issuer} onChange={(e) => setForm({ ...form, issuer: e.target.value })} className="input" placeholder="e.g. Google" /></Field>
            <Field label="Platform">
              <select value={form.platform} onChange={(e) => setForm({ ...form, platform: e.target.value })} className="input">
                {PLATFORMS.map((p) => <option key={p} value={p}>{p}</option>)}
              </select>
            </Field>
            <Field label="Issue date"><input type="date" value={form.issue_date} onChange={(e) => setForm({ ...form, issue_date: e.target.value })} className="input" /></Field>
            <Field label="Skills (comma separated)"><input value={form.skills} onChange={(e) => setForm({ ...form, skills: e.target.value })} className="input" placeholder="SQL, Python, Excel" /></Field>
            <Field label="Credential URL"><input value={form.credential_url} onChange={(e) => setForm({ ...form, credential_url: e.target.value })} className="input" placeholder="https://…" /></Field>
            <Field label="File (PDF/PNG, optional)">
              <input type="file" accept=".pdf,image/*"
                onChange={(e) => setForm({ ...form, file: e.target.files?.[0] })} className="text-xs" />
            </Field>
          </div>
          <div className="flex gap-2 justify-end">
            <button type="button" onClick={() => setShowForm(false)} className="text-sm px-3 py-1.5 rounded-lg border border-border">Cancel</button>
            <button disabled={uploading} className="inline-flex items-center gap-1 text-sm px-4 py-1.5 rounded-lg bg-gradient-primary text-primary-foreground shadow-glow disabled:opacity-50">
              {uploading ? <><Loader2 className="size-3 animate-spin" /> Saving…</> : <><Upload className="size-3" /> Save certificate</>}
            </button>
          </div>
        </form>
      )}

      <div className="flex items-center gap-3 flex-wrap text-xs">
        <span className="text-muted-foreground">Platform:</span>
        <select value={platformFilter} onChange={(e) => setPlatformFilter(e.target.value)} className="bg-input border border-border rounded-lg px-2 py-1">
          <option value="All">All</option>
          {PLATFORMS.map((p) => <option key={p} value={p}>{p}</option>)}
        </select>
        {allSkills.length > 0 && (
          <>
            <span className="text-muted-foreground ml-2">Skill:</span>
            <select value={skillFilter} onChange={(e) => setSkillFilter(e.target.value)} className="bg-input border border-border rounded-lg px-2 py-1">
              <option value="">All</option>
              {allSkills.map((s) => <option key={s} value={s}>{s}</option>)}
            </select>
          </>
        )}
      </div>

      {loading ? (
        <div className="text-center py-12 text-sm text-muted-foreground"><Loader2 className="size-4 animate-spin inline mr-2" />Loading…</div>
      ) : filtered.length === 0 ? (
        <div className="rounded-xl border border-dashed border-border p-10 text-center text-sm text-muted-foreground">
          No certificates yet. Add your first one to earn XP and start your credential wall.
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((c) => (
            <div key={c.id} className="rounded-2xl border border-border bg-card/60 p-5 hover:border-primary transition-all">
              <div className="flex items-start justify-between gap-2">
                <div className="size-10 rounded-xl bg-gradient-primary grid place-items-center shadow-glow shrink-0"><Award className="size-5 text-primary-foreground" /></div>
                <button onClick={() => remove(c)} className="text-muted-foreground hover:text-destructive" title="Delete"><Trash2 className="size-4" /></button>
              </div>
              <h3 className="mt-3 font-semibold truncate">{c.title}</h3>
              <div className="text-xs text-muted-foreground mt-0.5 truncate">{c.issuer || c.platform || "Certificate"}</div>
              {c.issue_date && <div className="text-xs text-muted-foreground mt-1">Issued {new Date(c.issue_date).toLocaleDateString()}</div>}
              {(c.skills ?? []).length > 0 && (
                <div className="mt-2 flex flex-wrap gap-1">
                  {(c.skills ?? []).slice(0, 4).map((s) => <span key={s} className="text-[10px] px-2 py-0.5 rounded-full bg-muted text-muted-foreground">{s}</span>)}
                </div>
              )}
              <div className="mt-3 flex gap-2">
                {c.credential_url && (
                  <a href={c.credential_url} target="_blank" rel="noreferrer" className="flex-1 inline-flex items-center justify-center gap-1 text-xs px-3 py-1.5 rounded-lg border border-border hover:border-primary">
                    Verify <ExternalLink className="size-3" />
                  </a>
                )}
                {c.file_path && (
                  <button onClick={() => openFile(c.file_path!)} className="flex-1 inline-flex items-center justify-center gap-1 text-xs px-3 py-1.5 rounded-lg border border-border hover:border-primary">
                    <FileText className="size-3" /> File
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <div className="text-xs text-muted-foreground mb-1">{label}</div>
      {children}
      <style>{`.input{width:100%;background:hsl(var(--input,var(--muted)));border:1px solid var(--border);border-radius:8px;padding:6px 10px;font-size:13px;outline:none}.input:focus{border-color:var(--ring)}`}</style>
    </label>
  );
}
