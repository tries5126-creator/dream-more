export interface SiteSettings {
  id: string
  company_name: string
  logo_url: string | null
  tagline: string
  description: string
  contact_email: string
  contact_phone: string
  address: string
  social_links: Record<string, string>
  payment_instructions: string
  created_at: string
  updated_at: string
}

export interface Profile {
  id: string
  full_name: string | null
  email: string | null
  phone: string | null
  role: 'admin' | 'student'
  avatar_url: string | null
  created_at: string
  updated_at: string
}

export interface Service {
  id: string
  title: string
  description: string
  short_description: string
  icon_name: string
  image_url: string | null
  category: string
  features: string[]
  is_active: boolean
  sort_order: number
  created_at: string
  updated_at: string
}

export interface CurriculumModule {
  module: string
  lessons: string[]
}

export interface Course {
  id: string
  title: string
  description: string
  short_description: string
  image_url: string | null
  category: string
  price: number
  currency: string
  duration: string
  level: string
  curriculum: CurriculumModule[]
  is_active: boolean
  max_students: number
  sort_order: number
  created_at: string
  updated_at: string
}

export interface Registration {
  id: string
  student_id: string
  course_id: string
  status: 'pending' | 'payment_review' | 'approved' | 'rejected' | 'completed'
  payment_screenshot_url: string | null
  payment_note: string
  admin_note: string
  registered_at: string
  approved_at: string | null
  completed_at: string | null
  course?: Course
  student?: Profile
}

export interface Announcement {
  id: string
  course_id: string | null
  title: string
  content: string
  is_global: boolean
  created_by: string | null
  created_at: string
  updated_at: string
}

export interface CourseMaterial {
  id: string
  course_id: string
  title: string
  description: string
  file_url: string
  file_type: string
  sort_order: number
  created_at: string
}

export interface StudentProgress {
  id: string
  student_id: string
  course_id: string
  lesson_key: string
  completed_at: string
}

export interface Certificate {
  id: string
  student_id: string
  course_id: string
  certificate_url: string
  issued_at: string
  issued_by: string | null
  course?: Course
}

export interface PortfolioItem {
  id: string
  title: string
  description: string
  image_url: string | null
  category: string
  service_id: string | null
  is_featured: boolean
  sort_order: number
  created_at: string
}

export interface Testimonial {
  id: string
  client_name: string
  client_title: string
  content: string
  avatar_url: string | null
  rating: number
  is_active: boolean
  sort_order: number
  created_at: string
}

export interface ContactMessage {
  id: string
  name: string
  email: string
  subject: string
  message: string
  is_read: boolean
  created_at: string
}
