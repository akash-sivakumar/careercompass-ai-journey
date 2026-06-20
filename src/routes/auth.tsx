import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState, type FormEvent } from "react";
import { z } from "zod";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Eye, EyeOff, Sparkles, ArrowLeft } from "lucide-react";

export const Route = createFileRoute("/auth")({
  validateSearch: (s: Record<string, unknown>) => ({
    mode: s.mode === "signup" ? "signup" as const : "login" as const,
  }),
  component: AuthPage,
});

const COMMON_PATTERNS = [
  /^password/i, /^qwerty/i, /^admin/i, /^welcome/i, /^letmein/i, /^iloveyou/i,
  /^[a-z]+@?\d{1,4}$/i, /^[a-z]+@123$/i, /^[a-z]+#123$/i, /^[a-z]+123$/i,
  /^123456/, /^abc123/i,
];
function isCommonPassword(p: string, name?: string, email?: string) {
  if (COMMON_PATTERNS.some(r => r.test(p))) return true;
  const lower = p.toLowerCase();
  if (name && name.trim().length >= 3 && lower.includes(name.trim().toLowerCase().split(/\s+/)[0])) return true;
  if (email) {
    const handle = email.split("@")[0]?.toLowerCase();
    if (handle && handle.length >= 3 && lower.includes(handle)) return true;
  }
  return false;
}
function strength(p: string, common: boolean) {
  if (!p) return 0;
  let s = 0;
  if (p.length >= 8) s++;
  if (/[A-Z]/.test(p)) s++;
  if (/[0-9]/.test(p)) s++;
  if (/[^A-Za-z0-9]/.test(p)) s++;
  if (p.length >= 12) s++;
  if (common) s = Math.min(s, 1);
  return Math.min(s, 4);
}

function AuthPage() {
  const { mode } = Route.useSearch();
  const navigate = useNavigate();
  const isSignup = mode === "signup";

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [show, setShow] = useState(false);
  const [remember, setRemember] = useState(true);
  const [loading, setLoading] = useState(false);
  const [commonWarning, setCommonWarning] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      if (isSignup) {
        const schema = z.object({
          fullName: z.string().trim().min(2, "Enter your full name").max(100),
          email: z.string().trim().email().max(255),
          password: z.string().min(8, "Password must be 8+ chars").max(72),
          confirm: z.string(),
        }).refine(d => d.password === d.confirm, { message: "Passwords don't match", path: ["confirm"] });
        const parsed = schema.safeParse({ fullName, email, password, confirm });
        if (!parsed.success) { toast.error(parsed.error.issues[0].message); return; }

        if (isCommonPassword(password, fullName, email)) {
          toast.error("Please choose a stronger, less common password.");
          setCommonWarning(true);
          return;
        }

        const { error } = await supabase.auth.signUp({
          email, password,
          options: { data: { full_name: fullName }, emailRedirectTo: `${window.location.origin}/dashboard` },
        });
        if (error) {
          const m = error.message.toLowerCase();
          if (m.includes("registered") || m.includes("already")) toast.error("This email is already registered");
          else if (m.includes("weak") || m.includes("pwned") || m.includes("leak") || m.includes("compromise") || m.includes("common") || m.includes("password")) {
            setCommonWarning(true);
            toast.error("Please choose a stronger, less common password.");
          } else toast.error("Something went wrong. Please try again.");
          return;
        }
        toast.success("Account created successfully. Please login.");
        navigate({ to: "/auth", search: { mode: "login" } });
      } else {
        const schema = z.object({ email: z.string().trim().email(), password: z.string().min(1) });
        const parsed = schema.safeParse({ email, password });
        if (!parsed.success) { toast.error(parsed.error.issues[0].message); return; }
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) { toast.error(error.message); return; }
        toast.success("Welcome back!");
        navigate({ to: "/dashboard" });
      }
    } finally { setLoading(false); }
  }

  const isCommon = isCommonPassword(password, fullName, email);
  const s = strength(password, isCommon);
  const strengthColors = ["bg-destructive", "bg-destructive", "bg-warning", "bg-accent", "bg-success"];
  const strengthLabel = ["Too weak","Weak","Fair","Good","Strong"][s];

  return (
    <div className="min-h-screen bg-gradient-hero grid md:grid-cols-2">
      <div className="hidden md:flex flex-col justify-between p-12 bg-gradient-card border-r border-border">
        <Link to="/" className="flex items-center gap-2 w-fit text-muted-foreground hover:text-foreground">
          <ArrowLeft className="size-4" /> Back to home
        </Link>
        <div>
          <div className="size-12 rounded-2xl bg-gradient-primary grid place-items-center shadow-glow mb-6">
            <Sparkles className="size-6 text-primary-foreground" />
          </div>
          <h2 className="text-4xl font-bold">Build your <span className="gradient-text">placement-ready</span> profile.</h2>
          <p className="text-muted-foreground mt-3 max-w-md">AI-powered resume analysis, skill gap insights, mock interviews, and personalized roadmaps — built to help you land the role you deserve.</p>
        </div>
        <div className="text-xs text-muted-foreground">Trusted by students at IITs, NITs, BITS & top colleges across India.</div>
      </div>
      <div className="flex items-center justify-center p-6 md:p-12">
        <form onSubmit={handleSubmit} className="w-full max-w-md bg-gradient-card border border-border rounded-2xl p-8 shadow-card">
          <h1 className="text-2xl font-bold">{isSignup ? "Create your account" : "Welcome back"}</h1>
          <p className="text-sm text-muted-foreground mt-1">
            {isSignup ? "Get started with CareerCompass AI" : "Login to your CareerCompass AI account"}
          </p>

          <div className="space-y-4 mt-6">
            {isSignup && (
              <Field label="Full Name">
                <input value={fullName} onChange={e=>setFullName(e.target.value)} required maxLength={100}
                  className="input-base" placeholder="Aarav Sharma" />
              </Field>
            )}
            <Field label="Email Address">
              <input type="email" value={email} onChange={e=>setEmail(e.target.value)} required maxLength={255}
                className="input-base" placeholder="you@example.com" />
            </Field>
            <Field label="Password">
              <div className="relative">
                <input type={show?"text":"password"} value={password} onChange={e=>setPassword(e.target.value)} required maxLength={72}
                  className="input-base pr-10" placeholder="••••••••" />
                <button type="button" onClick={()=>setShow(!show)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                  {show ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                </button>
              </div>
              {isSignup && password && (
                <div className="mt-2">
                  <div className="flex gap-1">
                    {[0,1,2,3].map(i => (
                      <div key={i} className={`h-1 flex-1 rounded-full ${i < s ? strengthColors[s] : "bg-muted"}`} />
                    ))}
                  </div>
                  <div className="text-xs text-muted-foreground mt-1">{strengthLabel}</div>
                </div>
              )}
              {isSignup && (commonWarning || (password && isCommon)) && (
                <div className="mt-3 rounded-xl border border-warning/40 bg-warning/10 p-3 text-xs">
                  <div className="font-medium text-warning mb-1">Please use a less common password</div>
                  <p className="text-muted-foreground">Avoid using your name or common combinations like Name@123. Try a mix of uppercase letters, numbers, and special characters.</p>
                  <div className="mt-2 space-y-0.5 text-foreground/80 font-mono">
                    <div>✓ CareerCompass@2026</div>
                    <div>✓ DataAnalyst#Akash26</div>
                    <div>✓ LearnAI$2026</div>
                  </div>
                </div>
              )}
            </Field>
            {isSignup && (
              <Field label="Confirm Password">
                <input type={show?"text":"password"} value={confirm} onChange={e=>setConfirm(e.target.value)} required
                  className="input-base" placeholder="••••••••" />
              </Field>
            )}
            {!isSignup && (
              <div className="flex items-center justify-between text-sm">
                <label className="flex items-center gap-2 text-muted-foreground">
                  <input type="checkbox" checked={remember} onChange={e=>setRemember(e.target.checked)} className="accent-primary" /> Remember me
                </label>
                <Link to="/forgot-password" className="text-primary hover:underline">Forgot password?</Link>
              </div>
            )}
          </div>

          <button disabled={loading} type="submit"
            className="w-full mt-6 bg-gradient-primary text-primary-foreground font-medium py-3 rounded-xl shadow-glow disabled:opacity-60">
            {loading ? "Please wait..." : isSignup ? "Create Account" : "Login"}
          </button>

          <p className="text-sm text-muted-foreground text-center mt-6">
            {isSignup ? "Already have an account? " : "Don't have an account? "}
            <Link to="/auth" search={{ mode: isSignup ? "login" : "signup" }} className="text-primary hover:underline">
              {isSignup ? "Login" : "Sign up"}
            </Link>
          </p>
        </form>
      </div>
      <style>{`
        .input-base{width:100%;background:var(--color-input);border:1px solid var(--color-border);border-radius:0.625rem;padding:0.625rem 0.875rem;color:var(--color-foreground);font-size:0.875rem;outline:none;transition:all .15s}
        .input-base:focus{border-color:var(--color-ring);box-shadow:0 0 0 3px oklch(0.68 0.20 285 / 0.18)}
      `}</style>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="text-sm font-medium text-muted-foreground">{label}</span>
      <div className="mt-1.5">{children}</div>
    </label>
  );
}
