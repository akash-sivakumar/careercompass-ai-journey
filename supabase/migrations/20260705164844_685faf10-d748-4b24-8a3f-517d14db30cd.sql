
ALTER TABLE public.lesson_progress ADD COLUMN IF NOT EXISTS notes text;

CREATE TABLE IF NOT EXISTS public.roadmap_progress (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  domain text NOT NULL,
  level_index integer NOT NULL,
  topic text NOT NULL,
  status text NOT NULL DEFAULT 'not_started',
  completed_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, domain, level_index, topic)
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.roadmap_progress TO authenticated;
GRANT ALL ON public.roadmap_progress TO service_role;

ALTER TABLE public.roadmap_progress ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users manage own roadmap progress" ON public.roadmap_progress;
CREATE POLICY "Users manage own roadmap progress" ON public.roadmap_progress
  FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS roadmap_progress_user_domain_idx ON public.roadmap_progress(user_id, domain);

DROP TRIGGER IF EXISTS roadmap_progress_updated_at ON public.roadmap_progress;
CREATE TRIGGER roadmap_progress_updated_at BEFORE UPDATE ON public.roadmap_progress
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
