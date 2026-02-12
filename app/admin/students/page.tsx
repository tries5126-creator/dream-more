"use client"

import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Search, Users } from "lucide-react"
import type { Profile } from "@/lib/types"

export default function AdminStudentsPage() {
  const [students, setStudents] = useState<(Profile & { registration_count?: number })[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")

  useEffect(() => {
    async function load() {
      const supabase = createClient()
      const { data: profiles } = await supabase
        .from("profiles")
        .select("*")
        .eq("role", "student")
        .order("created_at", { ascending: false })

      if (profiles) {
        const withCounts = await Promise.all(
          profiles.map(async (p) => {
            const { count } = await supabase
              .from("registrations")
              .select("id", { count: "exact", head: true })
              .eq("student_id", p.id)
            return { ...p, registration_count: count || 0 }
          })
        )
        setStudents(withCounts)
      }
      setLoading(false)
    }
    load()
  }, [])

  const filtered = students.filter(
    (s) =>
      s.full_name?.toLowerCase().includes(search.toLowerCase()) ||
      s.email?.toLowerCase().includes(search.toLowerCase())
  )

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-heading text-2xl font-bold text-foreground">Students</h1>
          <p className="text-sm text-muted-foreground">{students.length} registered students</p>
        </div>
        <div className="relative w-64">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search students..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
      </div>

      {filtered.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center gap-2 py-12 text-center text-muted-foreground">
            <Users className="h-10 w-10" />
            <p>No students found.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-3">
          {filtered.map((s) => (
            <Card key={s.id}>
              <CardContent className="flex flex-wrap items-center justify-between gap-3 p-4">
                <div>
                  <p className="font-medium text-foreground">{s.full_name || "Unnamed"}</p>
                  <p className="text-sm text-muted-foreground">{s.email}</p>
                  {s.phone && (
                    <p className="text-sm text-muted-foreground">{s.phone}</p>
                  )}
                </div>
                <div className="flex items-center gap-3">
                  <Badge variant="outline">{s.registration_count} courses</Badge>
                  <span className="text-xs text-muted-foreground">
                    Joined {new Date(s.created_at).toLocaleDateString()}
                  </span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
