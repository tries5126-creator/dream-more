"use client"

import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
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
import { Plus, Pencil, Trash2, Bell } from "lucide-react"
import type { Announcement, Course } from "@/lib/types"

export default function AdminAnnouncementsPage() {
  const [announcements, setAnnouncements] = useState<(Announcement & { course?: Course })[]>([])
  const [courses, setCourses] = useState<Course[]>([])
  const [loading, setLoading] = useState(true)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editing, setEditing] = useState<Partial<Announcement>>({ title: "", content: "", is_global: true, course_id: null })
  const [isEdit, setIsEdit] = useState(false)
  const [saving, setSaving] = useState(false)

  async function load() {
    const supabase = createClient()
    const [annResult, courseResult] = await Promise.all([
      supabase.from("announcements").select("*, course:courses(*)").order("created_at", { ascending: false }),
      supabase.from("courses").select("*").order("title"),
    ])
    setAnnouncements(annResult.data || [])
    setCourses(courseResult.data || [])
    setLoading(false)
  }

  useEffect(() => { load() }, [])

  function openCreate() {
    setEditing({ title: "", content: "", is_global: true, course_id: null })
    setIsEdit(false)
    setDialogOpen(true)
  }

  function openEdit(a: Announcement) {
    setEditing({ ...a })
    setIsEdit(true)
    setDialogOpen(true)
  }

  async function handleSave() {
    setSaving(true)
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    const payload = {
      title: editing.title,
      content: editing.content,
      is_global: editing.is_global,
      course_id: editing.is_global ? null : editing.course_id,
      created_by: user?.id,
    }
    if (isEdit && editing.id) {
      await supabase.from("announcements").update(payload).eq("id", editing.id)
    } else {
      await supabase.from("announcements").insert(payload)
    }
    setSaving(false)
    setDialogOpen(false)
    load()
  }

  async function handleDelete(id: string) {
    if (!confirm("Delete this announcement?")) return
    const supabase = createClient()
    await supabase.from("announcements").delete().eq("id", id)
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
          <h1 className="font-heading text-2xl font-bold text-foreground">Announcements</h1>
          <p className="text-sm text-muted-foreground">Post announcements for students</p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={openCreate} className="gap-2"><Plus className="h-4 w-4" /> New Announcement</Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-lg">
            <DialogHeader>
              <DialogTitle>{isEdit ? "Edit Announcement" : "New Announcement"}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label>Title</Label>
                <Input value={editing.title || ""} onChange={(e) => setEditing({ ...editing, title: e.target.value })} />
              </div>
              <div>
                <Label>Content</Label>
                <Textarea rows={5} value={editing.content || ""} onChange={(e) => setEditing({ ...editing, content: e.target.value })} />
              </div>
              <div>
                <label className="flex items-center gap-2 text-sm">
                  <input type="checkbox" checked={editing.is_global !== false} onChange={(e) => setEditing({ ...editing, is_global: e.target.checked })} className="rounded" />
                  Global announcement (visible to all students)
                </label>
              </div>
              {!editing.is_global && (
                <div>
                  <Label>Course</Label>
                  <Select value={editing.course_id || ""} onValueChange={(v) => setEditing({ ...editing, course_id: v })}>
                    <SelectTrigger><SelectValue placeholder="Select course" /></SelectTrigger>
                    <SelectContent>
                      {courses.map((c) => (
                        <SelectItem key={c.id} value={c.id}>{c.title}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
                <Button onClick={handleSave} disabled={saving}>{saving ? "Saving..." : "Post"}</Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {announcements.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center gap-2 py-12 text-center text-muted-foreground">
            <Bell className="h-10 w-10" />
            <p>No announcements yet.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-3">
          {announcements.map((a) => (
            <Card key={a.id}>
              <CardContent className="flex items-start justify-between gap-4 p-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <h3 className="font-medium text-foreground">{a.title}</h3>
                    <Badge variant={a.is_global ? "default" : "outline"}>
                      {a.is_global ? "Global" : a.course?.title || "Course"}
                    </Badge>
                  </div>
                  <p className="mt-1 text-sm text-muted-foreground line-clamp-2">{a.content}</p>
                  <p className="mt-1 text-xs text-muted-foreground">{new Date(a.created_at).toLocaleDateString()}</p>
                </div>
                <div className="flex gap-1">
                  <Button variant="ghost" size="icon" onClick={() => openEdit(a)}><Pencil className="h-4 w-4" /></Button>
                  <Button variant="ghost" size="icon" onClick={() => handleDelete(a.id)} className="text-destructive"><Trash2 className="h-4 w-4" /></Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
