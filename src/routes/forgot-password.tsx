import { createFileRoute, Link } from "@tanstack/react-router";
import { useState, type FormEvent } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { ArrowLeft, Mail } from "lucide-react";

export const Route = createFileRoute("/forgot-password")({ component: Forgot });

function Forgot() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  async function submit(e: FormEvent) {
    e.preventDefault();
    setLoading(true);
    const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), {
      redirectTo: `${window.location.origin}/reset-password`,
    });
    setLoading(false);
    if (error) { toast.error(error.message); return; }
    setSent(true);
    toast.success("Reset link sent. Check your email.");
  }

  return (
    <div className="min-h-screen bg-gradient-hero grid place-items-center p-6">
      <form onSubmit={submit} className="w-full max-w-md bg-gradient-card border border-border rounded-2xl p-8 shadow-card">
        <Link to="/auth" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-6"><ArrowLeft className="size-4" /> Back to login</Link>
        <h1 className="text-2xl font-bold">Forgot password?</h1>
        <p className="text-sm text-muted-foreground mt-1">We'll email you a link to reset it.</p>
        {sent ? (
          <div className="mt-6 p-4 rounded-xl bg-success/10 border border-success/30 text-sm flex gap-2">
            <Mail className="size-4 text-success shrink-0 mt-0.5" />
            <div>If an account exists for <span className="font-medium">{email}</span>, you'll receive a reset link shortly.</div>
          </div>
        ) : (
          <>
            <label className="block mt-6">
              <span className="text-sm font-medium text-muted-foreground">Email</span>
              <input type="email" required value={email} onChange={e=>setEmail(e.target.value)}
                className="input-base mt-1.5" placeholder="you@example.com" />
            </label>
            <button disabled={loading} className="w-full mt-6 bg-gradient-primary text-primary-foreground font-medium py-3 rounded-xl shadow-glow disabled:opacity-60">
              {loading ? "Sending..." : "Send Reset Link"}
            </button>
          </>
        )}
      </form>
      <style>{`.input-base{width:100%;background:var(--color-input);border:1px solid var(--color-border);border-radius:0.625rem;padding:0.625rem 0.875rem;color:var(--color-foreground);font-size:0.875rem;outline:none}.input-base:focus{border-color:var(--color-ring);box-shadow:0 0 0 3px oklch(0.68 0.20 285 / 0.18)}`}</style>
    </div>
  );
}
