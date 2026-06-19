import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { LayoutDashboard, FileText, BookOpen, Mic, Trophy, ArrowRight, Sparkles } from "lucide-react";
import { Card, PageHeader } from "@/components/ui-kit";
import { Link } from "@tanstack/react-router";

export const Route = createFileRoute("/_authenticated/dashboard")({ component: Dashboard });

type Profile = {
  full_name: string | null; email: string | null; college_name: string | null;
  target_role: string | null; skills: string[] | null;
  resume_score: number | null; interview_readiness: number | null; courses_completed: number | null;
};

function Dashboard() {
  const [p, setP] = useState<Profile | null>(null);
  useEffect(() => {
    supabase.auth.getUser().then(async ({ data }) => {
      if (!data.user) return;
      const { data: prof } = await supabase.from("profiles").select("*").eq("id", data.user.id).maybeSingle();
      setP(prof as Profile | null);
    });
  }, []);

  const stats = [
    { label: "Skills Added", value: p?.skills?.length ?? 0, icon: BookOpen, color: "from-violet-500 to-purple-500" },
    { label: "Resume Score", value: `${p?.resume_score ?? 0}/100`, icon: FileText, color: "from-blue-500 to-cyan-500" },
    { label: "Courses Completed", value: p?.courses_completed ?? 0, icon: Trophy, color: "from-amber-500 to-orange-500" },
    { label: "Interview Readiness", value: `${p?.interview_readiness ?? 0}%`, icon: Mic, color: "from-emerald-500 to-green-500" },
  ];

  const quick = [
    { to: "/resume", title: "Analyze your Resume", desc: "Get an instant ATS score and AI suggestions." },
    { to: "/skill-gap", title: "Run Skill Gap Analysis", desc: "Compare your skills against your target role." },
    { to: "/mock-interview", title: "Take a Mock Interview", desc: "Practice with our AI interviewer." },
    { to: "/roadmap", title: "Generate a Roadmap", desc: "Personalized learning path for your goals." },
  ] as const;

  return (
    <div>
      <PageHeader title={`Welcome back, ${p?.full_name?.split(" ")[0] || "there"} 👋`} subtitle="Here's a snapshot of your placement readiness." icon={LayoutDashboard} />

      {/* Profile card */}
      <Card className="mb-8 flex flex-wrap items-center gap-6">
        <div className="size-16 rounded-full bg-gradient-primary grid place-items-center text-2xl font-bold text-primary-foreground shadow-glow">
          {p?.full_name?.[0]?.toUpperCase() || "U"}
        </div>
        <div className="flex-1 min-w-[200px]">
          <div className="font-display font-semibold text-lg">{p?.full_name || "Complete your profile"}</div>
          <div className="text-sm text-muted-foreground">{p?.email}</div>
          <div className="text-xs text-muted-foreground mt-1">
            {p?.college_name || "No college set"} · Target: <span className="text-foreground">{p?.target_role || "Not set"}</span>
          </div>
        </div>
        <Link to="/profile" className="text-sm text-primary hover:underline inline-flex items-center gap-1">Edit profile <ArrowRight className="size-3" /></Link>
      </Card>

      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {stats.map(s => (
          <Card key={s.label} className="!p-5">
            <div className="flex items-start justify-between">
              <div>
                <div className="text-xs text-muted-foreground uppercase tracking-wider">{s.label}</div>
                <div className="text-3xl font-bold mt-1">{s.value}</div>
              </div>
              <div className={`size-10 rounded-xl bg-gradient-to-br ${s.color} grid place-items-center`}>
                <s.icon className="size-5 text-white" />
              </div>
            </div>
          </Card>
        ))}
      </div>

      <div className="flex items-center gap-2 mb-4">
        <Sparkles className="size-5 text-accent" />
        <h2 className="text-xl font-semibold">Quick actions</h2>
      </div>
      <div className="grid md:grid-cols-2 gap-4">
        {quick.map(q => (
          <Link key={q.to} to={q.to} className="group">
            <Card className="hover:shadow-glow transition-all">
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-display font-semibold">{q.title}</div>
                  <div className="text-sm text-muted-foreground mt-1">{q.desc}</div>
                </div>
                <ArrowRight className="size-5 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition" />
              </div>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
