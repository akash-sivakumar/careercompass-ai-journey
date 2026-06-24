import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Settings as SettingsIcon, Moon, Sun, Bell, KeyRound, LogOut } from "lucide-react";
import { Card, PageHeader, GhostBtn } from "@/components/ui-kit";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/settings")({ component: Settings });

function Settings() {
  const navigate = useNavigate();
  const [dark, setDark] = useState(true);
  const [notif, setNotif] = useState(true);

  useEffect(() => {
    const stored = localStorage.getItem("theme");
    const isLight = stored === "light";
    setDark(!isLight);
    document.documentElement.classList.toggle("light", isLight);
  }, []);

  function toggleTheme(v: boolean) {
    setDark(v);
    const next = v ? "dark" : "light";
    document.documentElement.classList.toggle("light", !v);
    localStorage.setItem("theme", next);
    window.dispatchEvent(new CustomEvent("themechange", { detail: next }));
  }

  async function changePassword() {
    const { data } = await supabase.auth.getUser();
    if (!data.user?.email) return;
    const { error } = await supabase.auth.resetPasswordForEmail(data.user.email, { redirectTo: `${window.location.origin}/reset-password` });
    if (error) toast.error(error.message); else toast.success("Password reset link sent");
  }

  async function logout() { await supabase.auth.signOut(); navigate({ to: "/auth", replace: true }); }

  return (
    <div className="max-w-2xl">
      <PageHeader title="Settings" subtitle="Manage your preferences and account." icon={SettingsIcon} />
      <Card className="mb-4">
        <Toggle icon={dark?Moon:Sun} title="Dark Mode" desc="Switch between dark and light themes." value={dark} onChange={toggleTheme} />
      </Card>
      <Card className="mb-4">
        <Toggle icon={Bell} title="Notifications" desc="Receive product and progress updates." value={notif} onChange={setNotif} />
      </Card>
      <Card className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-3"><div className="size-10 rounded-xl bg-muted grid place-items-center"><KeyRound className="size-5" /></div>
          <div><div className="font-medium">Change Password</div><div className="text-sm text-muted-foreground">Send a reset link to your email.</div></div></div>
        <GhostBtn onClick={changePassword}>Send link</GhostBtn>
      </Card>
      <Card className="flex items-center justify-between">
        <div className="flex items-center gap-3"><div className="size-10 rounded-xl bg-destructive/10 text-destructive grid place-items-center"><LogOut className="size-5" /></div>
          <div><div className="font-medium">Logout</div><div className="text-sm text-muted-foreground">Sign out of CareerCompass AI.</div></div></div>
        <GhostBtn onClick={logout} className="text-destructive">Logout</GhostBtn>
      </Card>
    </div>
  );
}

function Toggle({ icon: Icon, title, desc, value, onChange }: { icon: React.ComponentType<{className?:string}>; title: string; desc: string; value: boolean; onChange: (v:boolean)=>void }) {
  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-3"><div className="size-10 rounded-xl bg-muted grid place-items-center"><Icon className="size-5" /></div>
        <div><div className="font-medium">{title}</div><div className="text-sm text-muted-foreground">{desc}</div></div></div>
      <button onClick={()=>onChange(!value)} className={`w-11 h-6 rounded-full p-0.5 transition ${value?"bg-gradient-primary":"bg-muted"}`}>
        <div className={`size-5 rounded-full bg-white transition ${value?"translate-x-5":""}`} />
      </button>
    </div>
  );
}
