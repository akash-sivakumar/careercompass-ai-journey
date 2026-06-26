## Scope reality check

You're asking for ~10 production-grade SaaS modules (LeetCode + Coursera + W3Schools + ATS tool + AI mentor). That is months of work, not one turn. If I try to ship all of it at once, every module ends up as a thin shell — exactly what you said the platform shouldn't be.

I'll deliver this in **focused, high-quality milestones**. Each milestone ships real, working features — not placeholders.

---

## Milestone 1 (this turn) — AI Career Mentor + Resume Analyzer v2

These two have the highest daily-use value and unlock context for every other module.

### 1. Global AI Career Mentor (floating chatbot)
- Floating launcher on every authenticated page (bottom-right, above HelpWidget)
- Full chat panel using AI Elements (`Conversation`, `Message`, `PromptInput`, `Shimmer`)
- Streams via new TanStack server route `/api/mentor` using AI SDK + Lovable AI Gateway (`google/gemini-3-flash-preview`)
- **Context-aware**: server fn injects user's profile, resume score, target role, recent activity, XP/level into system prompt
- Conversation persisted to localStorage (one conversation, per user) — fast, no schema churn
- Quick-start prompts: "Review my resume", "What should I learn next?", "Mock interview tips", "Salary for my role"
- `Mentor` system prompt scoped to career mentorship; refuses off-topic

### 2. Resume Analyzer v2
- Replace target-role textbox with **searchable grouped dropdown** (Data / Software / Cloud / Security / Other — full role list you specified)
- Accept **PDF + DOCX + TXT** uploads (parse PDF with `pdfjs-dist`, DOCX with `mammoth` — both browser-safe)
- New AI prompt returns expanded JSON: ats_breakdown (keywords, formatting, experience, education, projects, certifications, achievements — each scored 0-100), missing_keywords, action_verb_suggestions, star_rewrites (array of {original, rewritten}), industry_benchmark
- New UI: score gauge + 6-metric breakdown radar, keyword match panel, AI-rewritten bullets card with copy buttons, downloadable PDF report (using existing pdf skill pattern)
- Awards XP + unlocks `resume_pro` achievement on score ≥80

---

## Milestones 2-5 (future turns, in order)

2. **Learning Hub v1** — domain → language picker, hand-authored seed curriculum for Python + SQL + JavaScript (full theory + examples + quizzes), AI-generated lesson expansion for other languages on demand, progress tracking wired to XP/achievements
3. **Practice Arena v1** — Monaco editor + in-browser JS/Python runner (Pyodide), AI-generated problems by topic/difficulty, hidden test cases, SQL playground (sql.js), daily challenge, leaderboard (reads `user_stats`)
4. **Roadmap v2 + Skill Gap v2 + Career AI v2** — interconnected: skill gap feeds roadmap, roadmap completion feeds career readiness, all share a shared "target role" stored on profile. Real progress tracking with checkboxes, level unlocks, XP rewards.
5. **Mock Interview v2 + Interview Prep v2 + Aptitude v2** — voice interview via Web Speech API, multi-dimensional scoring, company/role/type filters, timed aptitude tests with sectional analytics, downloadable reports

Dashboard absorbs each milestone's data as it lands — no separate "dashboard turn" needed; it's already wired to `user_stats`, `activity_log`, and achievements.

---

## Why this order

- Mentor first → every other module gets "Ask Mentor" entry points for free
- Resume v2 → highest-rated career-tool feature, big visible win, unblocks role-aware personalization across the rest
- Then content-heavy modules (Learning, Practice) which need their own focused builds
- Then the interconnection layer (Roadmap/Skill/Career) where the data model matters most
- Interview/Aptitude last because they're most independent

---

## Technical notes (for reference)

- Mentor route: `src/routes/api/mentor.ts` with `streamText` + `toUIMessageStreamResponse`
- Mentor context: `src/lib/mentor-context.functions.ts` (`createServerFn` + `requireSupabaseAuth`) returns profile/stats snapshot the client passes into the chat request body
- Resume parsing: client-side (`pdfjs-dist`, `mammoth`) — keeps server fn small, no Worker-incompat native deps
- AI Elements: install `conversation message prompt-input shimmer` via `bunx ai-elements@latest add`
- No schema changes needed for M1 (gamification tables from last turn are sufficient)

---

## What I need from you

Confirm Milestone 1 scope and I'll build it now. If you'd rather start somewhere else (e.g. Practice Arena first), say so before I begin.
