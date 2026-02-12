-- Student progress tracking
CREATE TABLE IF NOT EXISTS public.student_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  course_id UUID NOT NULL REFERENCES public.courses(id) ON DELETE CASCADE,
  lesson_key TEXT NOT NULL,
  completed_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(student_id, course_id, lesson_key)
);

ALTER TABLE public.student_progress ENABLE ROW LEVEL SECURITY;

-- Students can read their own progress
CREATE POLICY "progress_student_read" ON public.student_progress
  FOR SELECT USING (auth.uid() = student_id);

-- Students can insert their own progress
CREATE POLICY "progress_student_insert" ON public.student_progress
  FOR INSERT WITH CHECK (auth.uid() = student_id);

-- Students can delete their own progress (uncheck)
CREATE POLICY "progress_student_delete" ON public.student_progress
  FOR DELETE USING (auth.uid() = student_id);

-- Admins can read all progress
CREATE POLICY "progress_admin_read" ON public.student_progress
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
  );
