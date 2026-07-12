
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS education text,
  ADD COLUMN IF NOT EXISTS domain_interest text,
  ADD COLUMN IF NOT EXISTS interests text[] DEFAULT '{}'::text[],
  ADD COLUMN IF NOT EXISTS selected_career text,
  ADD COLUMN IF NOT EXISTS career_readiness integer DEFAULT 0;

INSERT INTO public.achievements (code, title, description, icon, xp_reward, category) VALUES
  ('career_selected', 'Career Chosen', 'Selected your target career path', 'compass', 60, 'career'),
  ('first_roadmap', 'Path Charted', 'Generated your first learning roadmap', 'map', 75, 'roadmap'),
  ('first_mock_interview', 'First Mock', 'Completed your first mock interview', 'mic', 100, 'interview'),
  ('aptitude_completed', 'Sharp Mind', 'Completed an aptitude practice test', 'brain', 40, 'practice'),
  ('career_ready_50', 'Halfway There', 'Reached 50% career readiness', 'target', 150, 'progress')
ON CONFLICT (code) DO NOTHING;
