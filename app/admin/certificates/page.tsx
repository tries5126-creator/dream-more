"use client"

import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Plus, Trash2, Upload, Award, ExternalLink } from "lucide-react"
import type { Certificate, Course, Profile } from "@/lib/types"

export default function AdminCertificatesPage() {
  const [certificates, setCertificates] = useState<(Certificate & { student?: Profile; course?: Course })[]>([])
  const [courses, setCourses] = useState<Course[]>([])
  const [students, setStudents] = useState<Profile[]>([])
  const [loading, setLoading] = useState(true)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [selectedStudent, setSelectedStudent] = useState("")
  const [selectedCourse, setSelectedCourse] = useState("")
  const [certFile, setCertFile] = useState<File | null>(null)
  const [saving, setSaving] = useState(false)

  async function load() {
    const supabase = createClient()
    const [certResult, courseResult, studentResult] = await Promise.all([
      supabase.from("certificates").select("*, student:profiles!certificates_student_id_fkey(*), course:courses(*)").order("issued_at", { ascending: false }),
      supabase.from("courses").select("*").order("title"),
      supabase.from("profiles").select("*").eq("role", "student").order("full_name"),
    ])
    setCertificates(certResult.data || [])
    setCourses(courseResult.data || [])
    setStudents(studentResult.data || [])
    setLoading(false)
  }

  useEffect(() => { load() }, [])

  async function handleIssue() {
    if (!selectedStudent || !selectedCourse || !certFile) return
    setSaving(true)
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()

    const ext = certFile.name.split(".").pop()
    const path = `certificates/${Date.now()}.${ext}`
    const { error: uploadError } = await supabase.storage.from("uploads").upload(path, certFile)
    if (uploadError) { setSaving(false); return }

    const { data: urlData } = supabase.storage.from("uploads").getPublicUrl(path)
    await supabase.from("certificates").insert({
      student_id: selectedStudent,
      course_id: selectedCourse,
      certificate_url: urlData.publicUrl,
      issued_by: user?.id,
    })

    // Also mark the registration as completed
    await supabase.from("registrations")
      .update({ status: "completed", completed_at: new Date().toISOString() })
      .eq("student_id", selectedStudent)
      .eq("course_id", selectedCourse)

    setSaving(false)
    setDialogOpen(false)
    setSelectedStudent("")
    setSelectedCourse("")
    setCertFile(null)
    load()
  }

  async function handleDelete(id: string) {
    if (!confirm("Delete this certificate?")) return
    const supabase = createClient()
    await supabase.from("certificates").delete().eq("id", id)
    load()
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
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-heading text-2xl font-bold text-foreground">Certificates</h1>
          <p className="text-sm text-muted-foreground">Issue certificates to students who completed courses</p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2"><Plus className="h-4 w-4" /> Issue Certificate</Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-lg">
            <DialogHeader>
              <DialogTitle>Issue Certificate</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label>Student</Label>
                <Select value={selectedStudent} onValueChange={setSelectedStudent}>
                  <SelectTrigger><SelectValue placeholder="Select student" /></SelectTrigger>
                  <SelectContent>
                    {students.map((s) => (
                      <SelectItem key={s.id} value={s.id}>
                        {s.full_name || s.email || "Unknown"}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Course</Label>
                <Select value={selectedCourse} onValueChange={setSelectedCourse}>
                  <SelectTrigger><SelectValue placeholder="Select course" /></SelectTrigger>
                  <SelectContent>
                    {courses.map((c) => (
                      <SelectItem key={c.id} value={c.id}>{c.title}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Certificate File (PDF or Image)</Label>
                <label className="mt-1 flex cursor-pointer items-center gap-2 rounded-md border px-4 py-3 text-sm hover:bg-muted">
                  <Upload className="h-4 w-4" />
                  {certFile ? certFile.name : "Choose file..."}
                  <input type="file" accept="image/*,application/pdf" className="sr-only" onChange={(e) => setCertFile(e.target.files?.[0] || null)} />
                </label>
              </div>
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
                <Button onClick={handleIssue} disabled={saving || !selectedStudent || !selectedCourse || !certFile}>
                  {saving ? "Issuing..." : "Issue Certificate"}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {certificates.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center gap-2 py-12 text-center text-muted-foreground">
            <Award className="h-10 w-10" />
            <p>No certificates issued yet.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-3">
          {certificates.map((cert) => (
            <Card key={cert.id}>
              <CardContent className="flex flex-wrap items-center justify-between gap-3 p-4">
                <div>
                  <p className="font-medium text-foreground">{cert.student?.full_name || cert.student?.email || "Unknown"}</p>
                  <p className="text-sm text-muted-foreground">{cert.course?.title || "Unknown course"}</p>
                  <p className="text-xs text-muted-foreground">Issued {new Date(cert.issued_at).toLocaleDateString()}</p>
                </div>
                <div className="flex items-center gap-2">
                  <a href={cert.certificate_url} target="_blank" rel="noreferrer">
                    <Button variant="outline" size="sm" className="gap-1">
                      <ExternalLink className="h-3 w-3" /> View
                    </Button>
                  </a>
                  <Button variant="outline" size="sm" onClick={() => handleDelete(cert.id)} className="gap-1 text-destructive">
                    <Trash2 className="h-3 w-3" /> Delete
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
