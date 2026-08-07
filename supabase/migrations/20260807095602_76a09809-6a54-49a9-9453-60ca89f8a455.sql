ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS experience text,
  ADD COLUMN IF NOT EXISTS career_goals text,
  ADD COLUMN IF NOT EXISTS preferred_industry text,
  ADD COLUMN IF NOT EXISTS portfolio_url text,
  ADD COLUMN IF NOT EXISTS github_url text,
  ADD COLUMN IF NOT EXISTS linkedin_url text,
  ADD COLUMN IF NOT EXISTS preferred_domains text[] DEFAULT '{}'::text[],
  ADD COLUMN IF NOT EXISTS resume_role_match integer,
  ADD COLUMN IF NOT EXISTS resume_salary_prediction text;