import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState, type FormEvent } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const Route = createFileRoute("/reset-password")({ component: Reset });

function Reset() {
  const navigate = useNavigate();
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);

  async function submit(e: FormEvent) {
    e.preventDefault();
    if (password.length < 8) { toast.error("Password must be 8+ characters"); return; }
    if (password !== confirm) { toast.error("Passwords don't match"); return; }
    setLoading(true);
    const { error } = await supabase.auth.updateUser({ password });
    setLoading(false);
    if (error) { toast.error(error.message); return; }
    toast.success("Password updated. Please login.");
    await supabase.auth.signOut();
    navigate({ to: "/auth" });
  }

  return (
    <div className="min-h-screen bg-gradient-hero grid place-items-center p-6">
      <form onSubmit={submit} className="w-full max-w-md bg-gradient-card border border-border rounded-2xl p-8 shadow-card">
        <h1 className="text-2xl font-bold">Set a new password</h1>
        <p className="text-sm text-muted-foreground mt-1">Choose a strong password for your account.</p>
        <label className="block mt-6"><span className="text-sm text-muted-foreground">New password</span>
          <input type="password" value={password} onChange={e=>setPassword(e.target.value)} required className="input-base mt-1.5" /></label>
        <label className="block mt-4"><span className="text-sm text-muted-foreground">Confirm password</span>
          <input type="password" value={confirm} onChange={e=>setConfirm(e.target.value)} required className="input-base mt-1.5" /></label>
        <button disabled={loading} className="w-full mt-6 bg-gradient-primary text-primary-foreground font-medium py-3 rounded-xl shadow-glow disabled:opacity-60">
          {loading ? "Updating..." : "Update Password"}
        </button>
      </form>
      <style>{`.input-base{width:100%;background:var(--color-input);border:1px solid var(--color-border);border-radius:0.625rem;padding:0.625rem 0.875rem;color:var(--color-foreground);font-size:0.875rem;outline:none}.input-base:focus{border-color:var(--color-ring);box-shadow:0 0 0 3px oklch(0.68 0.20 285 / 0.18)}`}</style>
    </div>
  );
}
