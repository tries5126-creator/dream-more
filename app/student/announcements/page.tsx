import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { Bell, Megaphone } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

export default async function StudentAnnouncementsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect("/auth/login")

  const { data: announcements } = await supabase
    .from("announcements")
    .select("*, course:courses(title)")
    .order("created_at", { ascending: false })

  return (
    <div className="mx-auto max-w-3xl">
      <h1 className="font-heading text-2xl font-bold">Announcements</h1>
      <p className="mt-1 text-muted-foreground">Stay updated with the latest news and course updates.</p>

      {!announcements || announcements.length === 0 ? (
        <Card className="mt-6">
          <CardContent className="flex flex-col items-center p-8 text-center">
            <Bell className="h-10 w-10 text-muted-foreground/40" />
            <p className="mt-3 font-medium">No announcements yet</p>
            <p className="mt-1 text-sm text-muted-foreground">Check back later for updates.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="mt-6 flex flex-col gap-4">
          {announcements.map((a: Record<string, unknown>) => (
            <Card key={a.id as string}>
              <CardContent className="p-5">
                <div className="flex items-start gap-3">
                  <div className="mt-0.5 rounded-lg bg-primary/10 p-2">
                    <Megaphone className="h-4 w-4 text-primary" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <h3 className="font-heading font-semibold">{a.title as string}</h3>
                      {a.is_global ? (
                        <Badge variant="secondary" className="text-xs">Global</Badge>
                      ) : a.course ? (
                        <Badge variant="outline" className="text-xs">{(a.course as Record<string, string>).title}</Badge>
                      ) : null}
                    </div>
                    <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{a.content as string}</p>
                    <p className="mt-2 text-xs text-muted-foreground/60">
                      {new Date(a.created_at as string).toLocaleDateString("en-US", {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      })}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
