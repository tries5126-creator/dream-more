-- Registration status enum
DO $$ BEGIN
  CREATE TYPE registration_status AS ENUM ('pending', 'payment_review', 'approved', 'rejected', 'completed');
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

-- Registrations table
CREATE TABLE IF NOT EXISTS public.registrations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  course_id UUID NOT NULL REFERENCES public.courses(id) ON DELETE CASCADE,
  status registration_status NOT NULL DEFAULT 'pending',
  payment_screenshot_url TEXT,
  payment_note TEXT DEFAULT '',
  admin_note TEXT DEFAULT '',
  registered_at TIMESTAMPTZ DEFAULT now(),
  approved_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ
);

ALTER TABLE public.registrations ENABLE ROW LEVEL SECURITY;

-- Students can read their own registrations
CREATE POLICY "registrations_student_read" ON public.registrations
  FOR SELECT USING (auth.uid() = student_id);

-- Students can insert their own registrations
CREATE POLICY "registrations_student_insert" ON public.registrations
  FOR INSERT WITH CHECK (auth.uid() = student_id);

-- Students can update their own pending registrations (e.g., upload screenshot)
CREATE POLICY "registrations_student_update" ON public.registrations
  FOR UPDATE USING (auth.uid() = student_id AND status IN ('pending', 'payment_review'));

-- Admins can read all registrations
CREATE POLICY "registrations_admin_read" ON public.registrations
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- Admins can update any registration
CREATE POLICY "registrations_admin_update" ON public.registrations
  FOR UPDATE USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- Admins can delete registrations
CREATE POLICY "registrations_admin_delete" ON public.registrations
  FOR DELETE USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
  );
