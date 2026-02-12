-- Certificates table (manually uploaded by admin)
CREATE TABLE IF NOT EXISTS public.certificates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  course_id UUID NOT NULL REFERENCES public.courses(id) ON DELETE CASCADE,
  certificate_url TEXT NOT NULL,
  issued_at TIMESTAMPTZ DEFAULT now(),
  issued_by UUID REFERENCES public.profiles(id)
);

ALTER TABLE public.certificates ENABLE ROW LEVEL SECURITY;

-- Students can read their own certificates
CREATE POLICY "certificates_student_read" ON public.certificates
  FOR SELECT USING (auth.uid() = student_id);

-- Admins full CRUD
CREATE POLICY "certificates_admin_read" ON public.certificates
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
  );

CREATE POLICY "certificates_admin_insert" ON public.certificates
  FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
  );

CREATE POLICY "certificates_admin_update" ON public.certificates
  FOR UPDATE USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
  );

CREATE POLICY "certificates_admin_delete" ON public.certificates
  FOR DELETE USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
  );
