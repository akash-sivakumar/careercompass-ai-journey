import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { tracks } from "@/content/learn";
import { PROJECTS_BY_TRACK, type ProjectIdea } from "@/content/projects";
import { supabase } from "@/integrations/supabase/client";
import { Rocket, Star, Clock, ExternalLink, Filter } from "lucide-react";

export const Route = createFileRoute("/_authenticated/projects")({
  head: () => ({ meta: [
    { title: "Projects — CareerCompass AI" },
    { name: "description", content: "Portfolio project ideas tailored to the tracks you're learning." },
  ] }),
  component: ProjectsPage,
});

function ProjectsPage() {
  const [difficulty, setDifficulty] = useState<string>("All");
  const [selectedTrack, setSelectedTrack] = useState<string>("all");
  const [completedTracks, setCompletedTracks] = useState<Set<string>>(new Set());

  useEffect(() => {
    (async () => {
      const { data: u } = await supabase.auth.getUser();
      if (!u.user) return;
      const { data } = await supabase.from("lesson_progress").select("track,status").eq("user_id", u.user.id).eq("status", "completed");
      const counts: Record<string, number> = {};
      (data ?? []).forEach((r) => { counts[r.track] = (counts[r.track] ?? 0) + 1; });
      const done = new Set<string>();
      tracks.forEach((t) => {
        const total = t.seeded ? t.lessons.length : (t.syllabus?.length ?? 0);
        if (total && counts[t.slug] && counts[t.slug] >= Math.ceil(total * 0.5)) done.add(t.slug);
      });
      setCompletedTracks(done);
    })();
  }, []);

  const list = useMemo(() => {
    const entries: { trackSlug: string; trackName: string; icon: string; color: string; project: ProjectIdea }[] = [];
    for (const t of tracks) {
      if (selectedTrack !== "all" && selectedTrack !== t.slug) continue;
      for (const p of PROJECTS_BY_TRACK[t.slug] ?? []) {
        if (difficulty !== "All" && p.difficulty !== difficulty) continue;
        entries.push({ trackSlug: t.slug, trackName: t.language, icon: t.icon, color: t.color, project: p });
      }
    }
    // Prioritize tracks user has progressed on
    entries.sort((a, b) => Number(completedTracks.has(b.trackSlug)) - Number(completedTracks.has(a.trackSlug)));
    return entries;
  }, [difficulty, selectedTrack, completedTracks]);

  return (
    <div className="space-y-6">
      <header className="flex items-center gap-3">
        <div className="size-11 rounded-2xl bg-gradient-primary grid place-items-center shadow-glow"><Rocket className="size-5 text-primary-foreground" /></div>
        <div>
          <h1 className="text-3xl font-display font-bold">Project Ideas</h1>
          <p className="text-sm text-muted-foreground">Ship these to build a portfolio recruiters take seriously.</p>
        </div>
      </header>

      <div className="flex items-center gap-3 flex-wrap">
        <div className="flex items-center gap-1 text-xs text-muted-foreground"><Filter className="size-3.5" /> Filters:</div>
        <select value={selectedTrack} onChange={(e) => setSelectedTrack(e.target.value)}
          className="bg-input border border-border rounded-lg px-3 py-1.5 text-sm">
          <option value="all">All tracks</option>
          {tracks.filter((t) => (PROJECTS_BY_TRACK[t.slug] ?? []).length > 0).map((t) => (
            <option key={t.slug} value={t.slug}>{t.language}</option>
          ))}
        </select>
        <div className="flex gap-1">
          {["All", "Beginner", "Intermediate", "Advanced"].map((d) => (
            <button key={d} onClick={() => setDifficulty(d)}
              className={`text-xs px-3 py-1.5 rounded-lg border transition-all ${
                difficulty === d ? "border-primary bg-primary/10 text-primary" : "border-border hover:border-primary/50"
              }`}>{d}</button>
          ))}
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {list.map(({ trackSlug, trackName, icon, color, project }, i) => (
          <div key={`${trackSlug}-${i}`} className="rounded-2xl border border-border bg-card/60 backdrop-blur p-5 hover:border-primary hover:shadow-glow transition-all flex flex-col">
            <div className="flex items-start justify-between gap-3">
              <div className={`size-10 rounded-xl bg-gradient-to-br ${color} grid place-items-center text-xl shadow-lg`}>{icon}</div>
              <span className={`text-[10px] px-2 py-0.5 rounded-full border ${
                project.difficulty === "Beginner" ? "border-success/40 text-success bg-success/10"
                : project.difficulty === "Intermediate" ? "border-primary/40 text-primary bg-primary/10"
                : "border-destructive/40 text-destructive bg-destructive/10"
              }`}>{project.difficulty}</span>
            </div>
            <div className="mt-3">
              <Link to="/learn/$track" params={{ track: trackSlug }} className="text-[10px] uppercase tracking-widest text-muted-foreground hover:text-primary">{trackName}</Link>
              <h3 className="font-semibold text-base mt-0.5">{project.title}</h3>
              <p className="text-sm text-muted-foreground mt-1">{project.brief}</p>
            </div>
            <div className="mt-3 flex flex-wrap gap-1">
              {project.skills.map((s) => (
                <span key={s} className="text-[10px] px-2 py-0.5 rounded-full bg-muted text-muted-foreground">{s}</span>
              ))}
            </div>
            <div className="mt-4 flex items-center justify-between text-xs text-muted-foreground">
              <span className="inline-flex items-center gap-1"><Clock className="size-3" />{project.hours}h</span>
              <span className="inline-flex items-center gap-1"><Star className="size-3" />{project.portfolio} portfolio value</span>
            </div>
            <a href={project.githubQuery} target="_blank" rel="noreferrer"
              className="mt-3 inline-flex items-center justify-center gap-1 text-xs px-3 py-1.5 rounded-lg border border-border hover:border-primary hover:bg-primary/5 transition-all">
              Explore on GitHub <ExternalLink className="size-3" />
            </a>
          </div>
        ))}
        {list.length === 0 && (
          <div className="col-span-full text-center py-12 text-sm text-muted-foreground">No projects match these filters yet.</div>
        )}
      </div>
    </div>
  );
}
