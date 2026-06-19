import { Link, useRouter, useRouterState } from "@tanstack/react-router";
import {
  LayoutDashboard, FileText, Target, Compass, Map, MessageSquare, Mic, Brain,
  User as UserIcon, Settings, LogOut, Sparkles
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

const items = [
  { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { to: "/resume", label: "Resume Analyzer", icon: FileText },
  { to: "/skill-gap", label: "Skill Gap", icon: Target },
  { to: "/career", label: "Career AI", icon: Compass },
  { to: "/roadmap", label: "Roadmap", icon: Map },
  { to: "/interview-prep", label: "Interview Prep", icon: MessageSquare },
  { to: "/mock-interview", label: "Mock Interview", icon: Mic },
  { to: "/aptitude", label: "Aptitude", icon: Brain },
  { to: "/profile", label: "Profile", icon: UserIcon },
  { to: "/settings", label: "Settings", icon: Settings },
] as const;

export function Sidebar() {
  const router = useRouter();
  const qc = useQueryClient();
  const pathname = useRouterState({ select: s => s.location.pathname });

  async function signOut() {
    await qc.cancelQueries();
    qc.clear();
    await supabase.auth.signOut();
    toast.success("Signed out");
    router.navigate({ to: "/auth", replace: true });
  }

  return (
    <aside className="hidden md:flex w-64 shrink-0 flex-col border-r border-border glass sticky top-0 h-screen">
      <div className="p-6 flex items-center gap-2">
        <div className="size-9 rounded-xl bg-gradient-primary grid place-items-center shadow-glow">
          <Sparkles className="size-5 text-primary-foreground" />
        </div>
        <div className="leading-tight">
          <div className="font-display font-bold">CareerCompass</div>
          <div className="text-[10px] uppercase tracking-widest text-muted-foreground">AI</div>
        </div>
      </div>
      <nav className="flex-1 px-3 space-y-1 overflow-y-auto">
        {items.map(({ to, label, icon: Icon }) => {
          const active = pathname === to;
          return (
            <Link key={to} to={to}
              className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-all ${
                active
                  ? "bg-gradient-primary text-primary-foreground shadow-glow"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted"
              }`}
            >
              <Icon className="size-4" />{label}
            </Link>
          );
        })}
      </nav>
      <button onClick={signOut} className="m-3 flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-muted-foreground hover:text-destructive hover:bg-muted">
        <LogOut className="size-4" /> Sign out
      </button>
    </aside>
  );
}
