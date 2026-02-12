"use client"

import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  Users,
  BookOpen,
  Briefcase,
  ClipboardList,
  Mail,
  DollarSign,
} from "lucide-react"

export default function AdminDashboard() {
  const [stats, setStats] = useState({
    students: 0,
    courses: 0,
    services: 0,
    pendingRegistrations: 0,
    unreadMessages: 0,
    approvedRegistrations: 0,
  })
  const [recentRegistrations, setRecentRegistrations] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      const supabase = createClient()
      const [students, courses, services, pending, messages, approved, recent] =
        await Promise.all([
          supabase
            .from("profiles")
            .select("id", { count: "exact", head: true })
            .eq("role", "student"),
          supabase
            .from("courses")
            .select("id", { count: "exact", head: true }),
          supabase
            .from("services")
            .select("id", { count: "exact", head: true }),
          supabase
            .from("registrations")
            .select("id", { count: "exact", head: true })
            .in("status", ["pending", "payment_review"]),
          supabase
            .from("contact_messages")
            .select("id", { count: "exact", head: true })
            .eq("is_read", false),
          supabase
            .from("registrations")
            .select("id", { count: "exact", head: true })
            .eq("status", "approved"),
          supabase
            .from("registrations")
            .select("*, course:courses(*), student:profiles!registrations_student_id_fkey(*)")
            .order("registered_at", { ascending: false })
            .limit(5),
        ])

      setStats({
        students: students.count || 0,
        courses: courses.count || 0,
        services: services.count || 0,
        pendingRegistrations: pending.count || 0,
        unreadMessages: messages.count || 0,
        approvedRegistrations: approved.count || 0,
      })
      setRecentRegistrations(recent.data || [])
      setLoading(false)
    }
    load()
  }, [])

  const statCards = [
    { label: "Total Students", value: stats.students, icon: Users, color: "text-blue-500" },
    { label: "Active Courses", value: stats.courses, icon: BookOpen, color: "text-green-500" },
    { label: "Services", value: stats.services, icon: Briefcase, color: "text-purple-500" },
    { label: "Pending Reviews", value: stats.pendingRegistrations, icon: ClipboardList, color: "text-orange-500" },
    { label: "Unread Messages", value: stats.unreadMessages, icon: Mail, color: "text-red-500" },
    { label: "Active Enrollments", value: stats.approvedRegistrations, icon: DollarSign, color: "text-emerald-500" },
  ]

  const statusColors: Record<string, string> = {
    pending: "bg-yellow-100 text-yellow-800",
    payment_review: "bg-blue-100 text-blue-800",
    approved: "bg-green-100 text-green-800",
    rejected: "bg-red-100 text-red-800",
    completed: "bg-gray-100 text-gray-800",
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-heading text-2xl font-bold text-foreground">Dashboard</h1>
        <p className="text-sm text-muted-foreground">Overview of your business</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {statCards.map((s) => (
          <Card key={s.label}>
            <CardContent className="flex items-center gap-4 p-6">
              <div className={`rounded-lg bg-muted p-3 ${s.color}`}>
                <s.icon className="h-5 w-5" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">{s.value}</p>
                <p className="text-sm text-muted-foreground">{s.label}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Recent Registrations</CardTitle>
        </CardHeader>
        <CardContent>
          {recentRegistrations.length === 0 ? (
            <p className="text-sm text-muted-foreground">No registrations yet.</p>
          ) : (
            <div className="space-y-3">
              {recentRegistrations.map((r: any) => (
                <div
                  key={r.id}
                  className="flex flex-wrap items-center justify-between gap-2 rounded-md border p-3"
                >
                  <div>
                    <p className="text-sm font-medium text-foreground">
                      {r.student?.full_name || r.student?.email || "Unknown"}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {r.course?.title || "Unknown course"}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary" className={statusColors[r.status] || ""}>
                      {r.status.replace("_", " ")}
                    </Badge>
                    <span className="text-xs text-muted-foreground">
                      {new Date(r.registered_at).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
