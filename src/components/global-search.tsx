import { useEffect, useState } from "react";
import { Search } from "lucide-react";
import { CommandDialog, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { useRouter } from "@tanstack/react-router";

const routes = [
  { label: "Dashboard", route: "/dashboard", group: "Pages" },
  { label: "Resume Analyzer", route: "/resume", group: "Pages" },
  { label: "Skill Gap Analysis", route: "/skill-gap", group: "Pages" },
  { label: "Career AI", route: "/career", group: "Pages" },
  { label: "Roadmap Generator", route: "/roadmap", group: "Pages" },
  { label: "Interview Preparation", route: "/interview-prep", group: "Pages" },
  { label: "Mock Interview", route: "/mock-interview", group: "Pages" },
  { label: "Aptitude Practice", route: "/aptitude", group: "Pages" },
  { label: "Profile", route: "/profile", group: "Account" },
  { label: "Settings", route: "/settings", group: "Account" },
];

export function GlobalSearch() {
  const [open, setOpen] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setOpen(o => !o);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const grouped = routes.reduce<Record<string, typeof routes>>((acc, r) => {
    (acc[r.group] ||= []).push(r);
    return acc;
  }, {});

  return (
    <>
      <button onClick={() => setOpen(true)} className="hidden md:inline-flex items-center gap-2 h-10 px-3 rounded-xl glass hover:bg-muted text-sm text-muted-foreground transition min-w-[220px]">
        <Search className="size-4" />
        <span>Search anything…</span>
        <kbd className="ml-auto text-[10px] px-1.5 py-0.5 rounded bg-muted">⌘K</kbd>
      </button>
      <button onClick={() => setOpen(true)} className="md:hidden size-10 rounded-xl glass hover:bg-muted grid place-items-center" aria-label="Search">
        <Search className="size-4" />
      </button>
      <CommandDialog open={open} onOpenChange={setOpen}>
        <CommandInput placeholder="Search pages, tools, topics…" />
        <CommandList>
          <CommandEmpty>No results found.</CommandEmpty>
          {Object.entries(grouped).map(([group, items]) => (
            <CommandGroup key={group} heading={group}>
              {items.map(item => (
                <CommandItem key={item.route} onSelect={() => { setOpen(false); router.navigate({ to: item.route }); }}>
                  {item.label}
                </CommandItem>
              ))}
            </CommandGroup>
          ))}
        </CommandList>
      </CommandDialog>
    </>
  );
}
