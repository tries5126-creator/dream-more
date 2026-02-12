import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import Link from "next/link"
import { BookOpen, Clock, CheckCircle, Award, Bell, ArrowRight } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"

export default async function StudentDashboard() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect("/auth/login")

  const [registrationsRes, announcementsRes, certificatesRes, coursesRes] = await Promise.all([
    supabase
      .from("registrations")
      .select("*, course:courses(*)")
      .eq("student_id", user.id)
      .order("registered_at", { ascending: false }),
    supabase
      .from("announcements")
      .select("*")
      .or(`is_global.eq.true`)
      .order("created_at", { ascending: false })
      .limit(3),
    supabase
      .from("certificates")
      .select("*, course:courses(title)")
      .eq("student_id", user.id),
    supabase
      .from("courses")
      .select("*")
      .eq("is_active", true)
      .order("sort_order"),
  ])

  const registrations = registrationsRes.data ?? []
  const announcements = announcementsRes.data ?? []
  const certificates = certificatesRes.data ?? []
  const allCourses = coursesRes.data ?? []

  const approved = registrations.filter((r) => r.status === "approved")
  const pending = registrations.filter((r) => ["pending", "payment_review"].includes(r.status))
  const enrolledCourseIds = registrations.map((r) => r.course_id)
  const availableCourses = allCourses.filter((c) => !enrolledCourseIds.includes(c.id))

  const statusColors: Record<string, string> = {
    pending: "bg-yellow-100 text-yellow-800",
    payment_review: "bg-blue-100 text-blue-800",
    approved: "bg-green-100 text-green-800",
    rejected: "bg-red-100 text-red-800",
    completed: "bg-primary/10 text-primary",
  }

  return (
    <div className="mx-auto max-w-6xl">
      <h1 className="font-heading text-2xl font-bold">Dashboard</h1>
      <p className="mt-1 text-muted-foreground">Welcome back! Here is your learning overview.</p>

      {/* Stats */}
      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardContent className="flex items-center gap-4 p-4">
            <div className="rounded-lg bg-primary/10 p-2.5">
              <BookOpen className="h-5 w-5 text-primary" />
            </div>
            <div>
              <div className="text-2xl font-bold">{approved.length}</div>
              <div className="text-xs text-muted-foreground">Active Courses</div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-4 p-4">
            <div className="rounded-lg bg-yellow-100 p-2.5">
              <Clock className="h-5 w-5 text-yellow-700" />
            </div>
            <div>
              <div className="text-2xl font-bold">{pending.length}</div>
              <div className="text-xs text-muted-foreground">Pending</div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-4 p-4">
            <div className="rounded-lg bg-green-100 p-2.5">
              <CheckCircle className="h-5 w-5 text-green-700" />
            </div>
            <div>
              <div className="text-2xl font-bold">{registrations.filter(r => r.status === "completed").length}</div>
              <div className="text-xs text-muted-foreground">Completed</div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-4 p-4">
            <div className="rounded-lg bg-primary/10 p-2.5">
              <Award className="h-5 w-5 text-primary" />
            </div>
            <div>
              <div className="text-2xl font-bold">{certificates.length}</div>
              <div className="text-xs text-muted-foreground">Certificates</div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="mt-8 grid gap-8 lg:grid-cols-3">
        {/* My Courses */}
        <div className="lg:col-span-2">
          <div className="flex items-center justify-between">
            <h2 className="font-heading text-lg font-semibold">My Courses</h2>
            <Link href="/student/courses">
              <Button variant="ghost" size="sm" className="gap-1 text-primary">
                View All <ArrowRight className="h-3.5 w-3.5" />
              </Button>
            </Link>
          </div>

          {registrations.length === 0 ? (
            <Card className="mt-4">
              <CardContent className="flex flex-col items-center p-8 text-center">
                <BookOpen className="h-10 w-10 text-muted-foreground/40" />
                <p className="mt-3 font-medium">No courses yet</p>
                <p className="mt-1 text-sm text-muted-foreground">Browse available courses to get started</p>
                <Link href="/student/courses" className="mt-4">
                  <Button size="sm">Browse Courses</Button>
                </Link>
              </CardContent>
            </Card>
          ) : (
            <div className="mt-4 flex flex-col gap-3">
              {registrations.slice(0, 4).map((reg) => (
                <Card key={reg.id}>
                  <CardContent className="flex items-center justify-between p-4">
                    <div className="flex-1">
                      <h3 className="font-semibold">{reg.course?.title}</h3>
                      <p className="mt-0.5 text-xs text-muted-foreground">
                        Registered {new Date(reg.registered_at).toLocaleDateString()}
                      </p>
                    </div>
                    <Badge className={`${statusColors[reg.status]} border-0`}>
                      {reg.status.replace("_", " ")}
                    </Badge>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {/* Available courses */}
          {availableCourses.length > 0 && (
            <>
              <h2 className="mt-8 font-heading text-lg font-semibold">Available Courses</h2>
              <div className="mt-4 grid gap-4 sm:grid-cols-2">
                {availableCourses.slice(0, 4).map((course) => (
                  <Card key={course.id}>
                    <CardContent className="p-4">
                      <Badge variant="secondary" className="mb-2 text-xs">{course.category}</Badge>
                      <h3 className="font-semibold">{course.title}</h3>
                      <p className="mt-1 text-xs text-muted-foreground line-clamp-2">{course.short_description}</p>
                      <div className="mt-3 flex items-center justify-between">
                        <span className="font-heading font-bold text-primary">
                          ${Number(course.price).toFixed(2)}
                        </span>
                        <Link href={`/student/courses/register/${course.id}`}>
                          <Button size="sm" variant="outline">Enroll</Button>
                        </Link>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </>
          )}
        </div>

        {/* Announcements sidebar */}
        <div>
          <div className="flex items-center justify-between">
            <h2 className="font-heading text-lg font-semibold">Announcements</h2>
            <Link href="/student/announcements">
              <Button variant="ghost" size="sm" className="gap-1 text-primary">
                All <ArrowRight className="h-3.5 w-3.5" />
              </Button>
            </Link>
          </div>
          {announcements.length === 0 ? (
            <Card className="mt-4">
              <CardContent className="p-6 text-center text-sm text-muted-foreground">
                No announcements yet
              </CardContent>
            </Card>
          ) : (
            <div className="mt-4 flex flex-col gap-3">
              {announcements.map((a) => (
                <Card key={a.id}>
                  <CardContent className="p-4">
                    <div className="flex items-start gap-3">
                      <Bell className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                      <div>
                        <h4 className="text-sm font-semibold">{a.title}</h4>
                        <p className="mt-1 text-xs text-muted-foreground line-clamp-2">{a.content}</p>
                        <p className="mt-1 text-xs text-muted-foreground/60">
                          {new Date(a.created_at).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
