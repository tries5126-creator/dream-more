import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { StudentShell } from "@/components/student/student-shell"

export default async function StudentLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) redirect("/auth/login")

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single()

  if (!profile) redirect("/auth/login")

  // If admin, redirect to admin
  if (profile.role === "admin") redirect("/admin")

  const { data: settings } = await supabase
    .from("site_settings")
    .select("*")
    .limit(1)
    .single()

  return (
    <StudentShell profile={profile} settings={settings}>
      {children}
    </StudentShell>
  )
}
