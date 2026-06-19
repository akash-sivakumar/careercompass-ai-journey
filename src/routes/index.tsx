import { createFileRoute, Link } from "@tanstack/react-router";
import { Sparkles, Brain, FileSearch, Target, Map, MessageSquare, ArrowRight, CheckCircle2, Star } from "lucide-react";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "CareerCompass AI — AI-Powered Career Guidance" },
      { name: "description", content: "Land your dream role with AI: resume analysis, skill gap insights, mock interviews, and personalized roadmaps." },
    ],
  }),
  component: Landing,
});

const features = [
  { icon: FileSearch, title: "AI Resume Analyzer", desc: "ATS score, missing skills, and tailored suggestions in seconds." },
  { icon: Target, title: "Skill Gap Analysis", desc: "Compare your stack against target roles and close the gap." },
  { icon: Brain, title: "AI Career Guidance", desc: "Personalized career paths matched to your skills and interests." },
  { icon: Map, title: "Learning Roadmaps", desc: "Beginner → Advanced roadmaps with progress tracking." },
  { icon: MessageSquare, title: "Mock Interviews", desc: "AI interviewer with real-time feedback and scoring." },
  { icon: Sparkles, title: "Aptitude Practice", desc: "Quant, logical, and verbal ability with timed tests." },
];

const testimonials = [
  { name: "Aarav Sharma", role: "CSE, IIT Roorkee", quote: "Cracked my placement at a top product company — the mock interviews were a game changer." },
  { name: "Priya Verma", role: "Data Analytics, NIT Trichy", quote: "Skill gap analysis showed me exactly what to learn. Got Data Analyst offer in 6 weeks." },
  { name: "Rahul Kapoor", role: "ECE, BITS Pilani", quote: "Resume score jumped from 58 to 92. Recruiter calls tripled." },
];

function Landing() {
  return (
    <div className="min-h-screen bg-gradient-hero">
      {/* Nav */}
      <header className="px-6 md:px-12 py-5 flex items-center justify-between max-w-7xl mx-auto">
        <div className="flex items-center gap-2">
          <div className="size-9 rounded-xl bg-gradient-primary grid place-items-center shadow-glow">
            <Sparkles className="size-5 text-primary-foreground" />
          </div>
          <div className="font-display font-bold text-lg">CareerCompass <span className="gradient-text">AI</span></div>
        </div>
        <div className="flex items-center gap-2">
          <Link to="/auth" className="text-sm text-muted-foreground hover:text-foreground px-4 py-2">Login</Link>
          <Link to="/auth" search={{ mode: "signup" }} className="text-sm bg-gradient-primary text-primary-foreground px-4 py-2 rounded-lg shadow-glow">Get Started</Link>
        </div>
      </header>

      {/* Hero */}
      <section className="px-6 md:px-12 pt-16 pb-24 max-w-7xl mx-auto text-center">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full glass text-xs text-muted-foreground mb-6">
          <Sparkles className="size-3 text-accent" /> Powered by Lovable AI
        </div>
        <h1 className="text-5xl md:text-7xl font-bold leading-tight">
          Your AI co-pilot for<br/><span className="gradient-text">career & placement readiness</span>
        </h1>
        <p className="mt-6 text-lg text-muted-foreground max-w-2xl mx-auto">
          Resume analysis, skill gap mapping, personalized roadmaps, and AI mock interviews — everything you need to land the role you deserve.
        </p>
        <div className="mt-8 flex justify-center gap-3">
          <Link to="/auth" search={{ mode: "signup" }} className="bg-gradient-primary text-primary-foreground px-6 py-3 rounded-xl font-medium shadow-glow inline-flex items-center gap-2">
            Get Started Free <ArrowRight className="size-4" />
          </Link>
          <Link to="/auth" className="glass px-6 py-3 rounded-xl font-medium">Login</Link>
        </div>
        <div className="mt-12 flex flex-wrap justify-center gap-6 text-sm text-muted-foreground">
          {["No credit card", "Free forever tier", "Built for students"].map(t => (
            <span key={t} className="inline-flex items-center gap-2"><CheckCircle2 className="size-4 text-success" />{t}</span>
          ))}
        </div>
      </section>

      {/* Features */}
      <section className="px-6 md:px-12 py-20 max-w-7xl mx-auto">
        <h2 className="text-3xl md:text-4xl font-bold text-center">Everything you need, in one place</h2>
        <p className="text-center text-muted-foreground mt-3 max-w-xl mx-auto">Six AI-powered modules built for placement-ready students and early-career professionals.</p>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5 mt-12">
          {features.map(f => (
            <div key={f.title} className="bg-gradient-card border border-border rounded-2xl p-6 shadow-card hover:shadow-glow transition-all">
              <div className="size-11 rounded-xl bg-gradient-primary grid place-items-center mb-4">
                <f.icon className="size-5 text-primary-foreground" />
              </div>
              <h3 className="font-display font-semibold text-lg">{f.title}</h3>
              <p className="text-sm text-muted-foreground mt-2">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Testimonials */}
      <section className="px-6 md:px-12 py-20 max-w-7xl mx-auto">
        <h2 className="text-3xl md:text-4xl font-bold text-center">Loved by students at top colleges</h2>
        <div className="grid md:grid-cols-3 gap-5 mt-12">
          {testimonials.map(t => (
            <div key={t.name} className="bg-gradient-card border border-border rounded-2xl p-6 shadow-card">
              <div className="flex gap-1 text-warning mb-3">
                {[...Array(5)].map((_,i) => <Star key={i} className="size-4 fill-current" />)}
              </div>
              <p className="text-sm">{t.quote}</p>
              <div className="mt-4 pt-4 border-t border-border">
                <div className="font-medium text-sm">{t.name}</div>
                <div className="text-xs text-muted-foreground">{t.role}</div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="px-6 md:px-12 py-20 max-w-4xl mx-auto text-center">
        <div className="bg-gradient-card border border-border rounded-3xl p-12 shadow-glow">
          <h2 className="text-3xl md:text-4xl font-bold">Ready to land your dream role?</h2>
          <p className="text-muted-foreground mt-3">Join thousands of students using CareerCompass AI to get placement-ready.</p>
          <Link to="/auth" search={{ mode: "signup" }} className="mt-6 inline-flex items-center gap-2 bg-gradient-primary text-primary-foreground px-6 py-3 rounded-xl font-medium shadow-glow">
            Create your account <ArrowRight className="size-4" />
          </Link>
        </div>
      </section>

      <footer className="px-6 md:px-12 py-10 border-t border-border text-sm text-muted-foreground flex flex-col md:flex-row gap-3 justify-between max-w-7xl mx-auto">
        <div>© 2026 CareerCompass AI. Built for the next generation of talent.</div>
        <div className="flex gap-6"><a href="#">Privacy</a><a href="#">Terms</a><a href="#">Contact</a></div>
      </footer>
    </div>
  );
}
