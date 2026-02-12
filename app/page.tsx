import { LandingClient } from "@/components/public/landing-client"

export default async function HomePage() {
  // Fallback data when Supabase is not configured
  const fallbackSettings = {
    site_name: "CreativeHub",
    tagline: "Digital Services & Professional Training",
    description: "Full-service digital agency specializing in web development, design, marketing, and professional training courses.",
  }

  const fallbackServices = [
    {
      id: 1,
      title: "Web Development",
      description: "Custom web applications built with modern technologies",
      is_active: true,
    },
    {
      id: 2,
      title: "UI/UX Design",
      description: "Beautiful and intuitive user interfaces",
      is_active: true,
    },
    {
      id: 3,
      title: "Digital Marketing",
      description: "Strategic marketing solutions for your business",
      is_active: true,
    },
  ]

  const fallbackCourses = [
    {
      id: 1,
      title: "Web Development Bootcamp",
      description: "Learn modern web development from scratch",
      price: 999,
      is_active: true,
    },
    {
      id: 2,
      title: "UI/UX Design Masterclass",
      description: "Master design principles and tools",
      price: 799,
      is_active: true,
    },
  ]

  return (
    <LandingClient
      settings={fallbackSettings}
      services={fallbackServices}
      courses={fallbackCourses}
      portfolio={[]}
      testimonials={[]}
    />
  )
}
