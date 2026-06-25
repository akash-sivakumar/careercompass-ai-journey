import { useEffect, useState } from "react";
import { Bell, Check } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { useRouter } from "@tanstack/react-router";

type N = { id: string; title: string; body: string | null; route: string | null; read_at: string | null; created_at: string };

export function NotificationBell() {
  const [items, setItems] = useState<N[]>([]);
  const router = useRouter();

  async function load() {
    const { data: u } = await supabase.auth.getUser();
    if (!u.user) return;
    const { data } = await supabase
      .from("notifications")
      .select("*")
      .eq("user_id", u.user.id)
      .order("created_at", { ascending: false })
      .limit(15);
    setItems((data as N[]) ?? []);
  }
  useEffect(() => { load(); }, []);

  const unread = items.filter(i => !i.read_at).length;

  async function markAllRead() {
    const { data: u } = await supabase.auth.getUser();
    if (!u.user) return;
    await supabase.from("notifications").update({ read_at: new Date().toISOString() }).is("read_at", null).eq("user_id", u.user.id);
    load();
  }

  return (
    <Popover>
      <PopoverTrigger asChild>
        <button onClick={load} className="relative size-10 rounded-xl glass hover:bg-muted grid place-items-center transition" aria-label="Notifications">
          <Bell className="size-4" />
          {unread > 0 && <span className="absolute -top-1 -right-1 min-w-5 h-5 px-1 grid place-items-center text-[10px] font-bold bg-destructive text-destructive-foreground rounded-full">{unread}</span>}
        </button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-80 p-0">
        <div className="flex items-center justify-between p-3 border-b border-border">
          <div className="font-semibold text-sm">Notifications</div>
          {unread > 0 && (
            <button onClick={markAllRead} className="text-xs text-primary hover:underline inline-flex items-center gap-1">
              <Check className="size-3" /> Mark all read
            </button>
          )}
        </div>
        <div className="max-h-80 overflow-y-auto">
          {items.length === 0 ? (
            <div className="p-6 text-center text-sm text-muted-foreground">You're all caught up ✨</div>
          ) : items.map(n => (
            <button
              key={n.id}
              onClick={() => n.route && router.navigate({ to: n.route })}
              className={`w-full text-left p-3 border-b border-border/50 hover:bg-muted/50 transition ${!n.read_at ? "bg-primary/5" : ""}`}
            >
              <div className="font-medium text-sm">{n.title}</div>
              {n.body && <div className="text-xs text-muted-foreground mt-0.5">{n.body}</div>}
              <div className="text-[10px] text-muted-foreground mt-1">{new Date(n.created_at).toLocaleString()}</div>
            </button>
          ))}
        </div>
      </PopoverContent>
    </Popover>
  );
}
