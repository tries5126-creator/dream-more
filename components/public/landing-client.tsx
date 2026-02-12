"use client"

import { Navbar } from "./navbar"
import { Hero } from "./hero"
import { ServicesSection } from "./services-section"
import { CoursesSection } from "./courses-section"
import { PortfolioSection } from "./portfolio-section"
import { TestimonialsSection } from "./testimonials-section"
import { ContactSection } from "./contact-section"
import { Footer } from "./footer"
import type {
  SiteSettings,
  Service,
  Course,
  PortfolioItem,
  Testimonial,
} from "@/lib/types"

interface LandingClientProps {
  settings: SiteSettings | null
  services: Service[]
  courses: Course[]
  portfolio: PortfolioItem[]
  testimonials: Testimonial[]
}

export function LandingClient({
  settings,
  services,
  courses,
  portfolio,
  testimonials,
}: LandingClientProps) {
  return (
    <main>
      <Navbar settings={settings} />
      <Hero settings={settings} />
      <ServicesSection services={services} />
      <CoursesSection courses={courses} />
      <PortfolioSection items={portfolio} />
      <TestimonialsSection testimonials={testimonials} />
      <ContactSection settings={settings} />
      <Footer settings={settings} />
    </main>
  )
}
