import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import Link from "next/link"
import { Clock, BarChart3, BookOpen } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

export default async function StudentCoursesPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect("/auth/login")

  const [registrationsRes, coursesRes] = await Promise.all([
    supabase
      .from("registrations")
      .select("*, course:courses(*)")
      .eq("student_id", user.id)
      .order("registered_at", { ascending: false }),
    supabase.from("courses").select("*").eq("is_active", true).order("sort_order"),
  ])

  const registrations = registrationsRes.data ?? []
  const allCourses = coursesRes.data ?? []
  const enrolledIds = registrations.map((r) => r.course_id)
  const available = allCourses.filter((c) => !enrolledIds.includes(c.id))

  const statusColors: Record<string, string> = {
    pending: "bg-yellow-100 text-yellow-800",
    payment_review: "bg-blue-100 text-blue-800",
    approved: "bg-green-100 text-green-800",
    rejected: "bg-red-100 text-red-800",
    completed: "bg-primary/10 text-primary",
  }

  return (
    <div className="mx-auto max-w-5xl">
      <h1 className="font-heading text-2xl font-bold">Courses</h1>
      <p className="mt-1 text-muted-foreground">Manage your enrollments and browse new courses.</p>

      <Tabs defaultValue="enrolled" className="mt-6">
        <TabsList>
          <TabsTrigger value="enrolled">My Courses ({registrations.length})</TabsTrigger>
          <TabsTrigger value="available">Available ({available.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="enrolled" className="mt-6">
          {registrations.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center p-8 text-center">
                <BookOpen className="h-10 w-10 text-muted-foreground/40" />
                <p className="mt-3 font-medium">No enrollments yet</p>
                <p className="mt-1 text-sm text-muted-foreground">Start by browsing available courses</p>
              </CardContent>
            </Card>
          ) : (
            <div className="flex flex-col gap-4">
              {registrations.map((reg) => (
                <Card key={reg.id}>
                  <CardContent className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <h3 className="font-heading font-semibold">{reg.course?.title}</h3>
                        <Badge className={`${statusColors[reg.status]} border-0 text-xs`}>
                          {reg.status.replace("_", " ")}
                        </Badge>
                      </div>
                      <p className="mt-1 text-sm text-muted-foreground">{reg.course?.short_description}</p>
                      <div className="mt-2 flex items-center gap-4 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1"><Clock className="h-3.5 w-3.5" />{reg.course?.duration}</span>
                        <span className="flex items-center gap-1"><BarChart3 className="h-3.5 w-3.5" />{reg.course?.level}</span>
                      </div>
                      {reg.admin_note && (
                        <p className="mt-2 rounded-md bg-muted p-2 text-xs text-muted-foreground">
                          <strong>Note:</strong> {reg.admin_note}
                        </p>
                      )}
                    </div>
                    <div className="flex gap-2">
                      {reg.status === "approved" && (
                        <Link href={`/student/courses/learn/${reg.course_id}`}>
                          <Button size="sm">Learn</Button>
                        </Link>
                      )}
                      {(reg.status === "pending" || reg.status === "payment_review") && (
                        <Link href={`/student/courses/register/${reg.course_id}`}>
                          <Button size="sm" variant="outline">Upload Payment</Button>
                        </Link>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="available" className="mt-6">
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {available.map((course) => (
              <Card key={course.id} className="overflow-hidden">
                <CardContent className="p-5">
                  <Badge variant="secondary" className="mb-2 text-xs">{course.category}</Badge>
                  <h3 className="font-heading text-lg font-semibold">{course.title}</h3>
                  <p className="mt-1 text-sm text-muted-foreground line-clamp-2">{course.short_description}</p>
                  <div className="mt-3 flex items-center gap-3 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1"><Clock className="h-3.5 w-3.5" />{course.duration}</span>
                    <span className="flex items-center gap-1"><BarChart3 className="h-3.5 w-3.5" />{course.level}</span>
                  </div>
                  <div className="mt-4 flex items-center justify-between">
                    <span className="font-heading text-xl font-bold text-primary">${Number(course.price).toFixed(2)}</span>
                    <Link href={`/student/courses/register/${course.id}`}>
                      <Button size="sm">Enroll</Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
