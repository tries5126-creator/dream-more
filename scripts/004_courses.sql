-- Courses table
CREATE TABLE IF NOT EXISTS public.courses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT NOT NULL DEFAULT '',
  short_description TEXT DEFAULT '',
  image_url TEXT,
  category TEXT DEFAULT 'general',
  price DECIMAL(10,2) DEFAULT 0,
  currency TEXT DEFAULT 'USD',
  duration TEXT DEFAULT '',
  level TEXT DEFAULT 'beginner',
  curriculum JSONB DEFAULT '[]',
  is_active BOOLEAN DEFAULT true,
  max_students INTEGER DEFAULT 50,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.courses ENABLE ROW LEVEL SECURITY;

-- Public can read courses
CREATE POLICY "courses_public_read" ON public.courses
  FOR SELECT USING (true);

-- Admins full CRUD
CREATE POLICY "courses_admin_insert" ON public.courses
  FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
  );

CREATE POLICY "courses_admin_update" ON public.courses
  FOR UPDATE USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
  );

CREATE POLICY "courses_admin_delete" ON public.courses
  FOR DELETE USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
  );
