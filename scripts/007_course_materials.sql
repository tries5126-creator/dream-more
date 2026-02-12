-- Course materials table (downloadable files)
CREATE TABLE IF NOT EXISTS public.course_materials (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  course_id UUID NOT NULL REFERENCES public.courses(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT DEFAULT '',
  file_url TEXT NOT NULL,
  file_type TEXT DEFAULT 'pdf',
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.course_materials ENABLE ROW LEVEL SECURITY;

-- Students can read materials for courses they're enrolled in
CREATE POLICY "materials_student_read" ON public.course_materials
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.registrations
      WHERE registrations.student_id = auth.uid()
        AND registrations.course_id = course_materials.course_id
        AND registrations.status IN ('approved', 'completed')
    )
    OR EXISTS (
      SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Admins full CRUD
CREATE POLICY "materials_admin_insert" ON public.course_materials
  FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
  );

CREATE POLICY "materials_admin_update" ON public.course_materials
  FOR UPDATE USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
  );

CREATE POLICY "materials_admin_delete" ON public.course_materials
  FOR DELETE USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
  );
