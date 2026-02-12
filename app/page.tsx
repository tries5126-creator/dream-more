import { createClient } from "@/lib/supabase/server"
import { LandingClient } from "@/components/public/landing-client"

export default async function HomePage() {
  const supabase = await createClient()

  const [settingsRes, servicesRes, coursesRes, portfolioRes, testimonialsRes] =
    await Promise.all([
      supabase.from("site_settings").select("*").limit(1).single(),
      supabase
        .from("services")
        .select("*")
        .eq("is_active", true)
        .order("sort_order"),
      supabase
        .from("courses")
        .select("*")
        .eq("is_active", true)
        .order("sort_order"),
      supabase.from("portfolio").select("*").order("sort_order"),
      supabase
        .from("testimonials")
        .select("*")
        .eq("is_active", true)
        .order("sort_order"),
    ])

  return (
    <LandingClient
      settings={settingsRes.data}
      services={servicesRes.data ?? []}
      courses={coursesRes.data ?? []}
      portfolio={portfolioRes.data ?? []}
      testimonials={testimonialsRes.data ?? []}
    />
  )
}
