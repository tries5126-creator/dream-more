import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { AdminShell } from "@/components/admin/admin-shell"

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect("/auth/login")

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single()

  if (!profile || profile.role !== "admin") redirect("/")

  const { data: settings } = await supabase
    .from("site_settings")
    .select("*")
    .limit(1)
    .single()

  return (
    <AdminShell profile={profile} settings={settings}>
      {children}
    </AdminShell>
  )
}
