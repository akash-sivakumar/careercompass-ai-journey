
Your request covers ~10 major workstreams. Trying them in one turn would take hours and almost certainly break finished modules. I'll split into 3 sequential turns, each independently shippable. Turn 1 focuses on the highest-impact fixes you called out first.

## Turn 1 — Core Learning + Roadmap fixes (this turn)

**P1: Full lesson study page** (`learn.$track.$slug.tsx`)
- Rebuild lesson viewer with tabbed sections: Overview & Objectives, Theory, Syntax, Examples, Practice Exercises, MCQ Quiz, Assignment, Notes, Resources.
- Notes persist to `lesson_progress.notes` (add column).
- Prev/Next lesson navigation, Mark Complete, XP award (already wired to gamification).
- Resources section auto-generates links to W3Schools / MDN / GeeksforGeeks / official docs based on track+lesson.
- Seeded tracks (Python/SQL/JS) render hand-authored content; other tracks use existing AI expansion + `ai_artifacts` cache.

**P2: Learning Hub category expansion** (`src/content/learn/index.ts`)
- Programming: add Java, C, C++, TypeScript (R already present).
- Domain: expand to your full taxonomy (Data Analytics, Data Science, AI Engineering, Web Dev, Mobile, Cloud, Cyber Security, UI/UX, Software Engineering) with syllabi. Existing seeded content preserved.

**P3: Roadmap completion tracking** (`roadmap.tsx`)
- Per-topic status: Not Started / In Progress / Completed (not just per-level).
- Persist to a new `roadmap_progress` table (user_id, domain, topic, status).
- Progress %, XP on completion, activity_log entry, achievement check.

## Turn 2 — Dashboard, Mentor, Activity, Responsive polish

- **P4** Dashboard charts with Recharts pulling real data (Radar, Weekly XP bar, Learning progress line, Skill donut, Monthly trend).
- **P5** Career Mentor rewrite: mode selector (Learning / Career / Resume / Interview / Project), markdown rendering with `react-markdown`, tightened system prompts per mode, structured output format.
- **P6** Recent Activity: audit all XP-awarding code paths, ensure every one writes to `activity_log`; render on dashboard with grouped date headers.
- **P7** Responsive audit: sidebar → drawer on mobile, bottom nav for authenticated routes on <768px, chart containers, tables → cards on mobile.

## Turn 3 — Milestone 3 kickoff

- **P8/P9** Framer Motion page transitions, XP popups, confetti on completion, streak system polish, badge grid page.
- **P10** New routes: `/planner` (AI study planner), `/projects` (AI project generator), `/predictor` (career predictor), `/portfolio` (portfolio builder), `/jobs` (job tracker), `/analytics` (learning analytics). Each backed by a table + AI server fn.

## Out of scope / clarifications needed
- "Interactive code snippets" in P1: I'll ship syntax-highlighted read-only blocks with a Copy button this turn. Live in-browser execution (Monaco + Pyodide + SQL.js) is Milestone 3 Practice Arena — a separate large workstream.
- I will NOT regenerate any existing completed feature. Files I'll touch are limited to those listed under each priority.

Reply "go" to execute Turn 1 as-is, or tell me which priorities to reshuffle / drop / expand.
