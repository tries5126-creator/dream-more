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
import { Badge } from "@/components/ui/badge"
import { Plus, Pencil, Trash2 } from "lucide-react"
import type { Course, CurriculumModule } from "@/lib/types"

const defaultCourse: Partial<Course> = {
  title: "",
  description: "",
  short_description: "",
  category: "general",
  price: 0,
  currency: "USD",
  duration: "",
  level: "beginner",
  curriculum: [],
  is_active: true,
  max_students: 50,
  sort_order: 0,
}

export default function AdminCoursesPage() {
  const [courses, setCourses] = useState<Course[]>([])
  const [loading, setLoading] = useState(true)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editing, setEditing] = useState<Partial<Course>>(defaultCourse)
  const [isEdit, setIsEdit] = useState(false)
  const [saving, setSaving] = useState(false)
  const [curriculumText, setCurriculumText] = useState("")

  async function loadCourses() {
    const supabase = createClient()
    const { data } = await supabase
      .from("courses")
      .select("*")
      .order("sort_order")
    setCourses(data || [])
    setLoading(false)
  }

  useEffect(() => { loadCourses() }, [])

  function curriculumToText(modules: CurriculumModule[]): string {
    if (!modules || !Array.isArray(modules)) return ""
    return modules
      .map((m) => `## ${m.module}\n${m.lessons.map((l) => `- ${l}`).join("\n")}`)
      .join("\n\n")
  }

  function textToCurriculum(text: string): CurriculumModule[] {
    const modules: CurriculumModule[] = []
    let currentModule: CurriculumModule | null = null
    text.split("\n").forEach((line) => {
      const trimmed = line.trim()
      if (trimmed.startsWith("## ")) {
        if (currentModule) modules.push(currentModule)
        currentModule = { module: trimmed.replace("## ", ""), lessons: [] }
      } else if (trimmed.startsWith("- ") && currentModule) {
        currentModule.lessons.push(trimmed.replace("- ", ""))
      }
    })
    if (currentModule) modules.push(currentModule)
    return modules
  }

  function openCreate() {
    setEditing({ ...defaultCourse })
    setCurriculumText("")
    setIsEdit(false)
    setDialogOpen(true)
  }

  function openEdit(course: Course) {
    setEditing({ ...course })
    setCurriculumText(curriculumToText(course.curriculum))
    setIsEdit(true)
    setDialogOpen(true)
  }

  async function handleSave() {
    setSaving(true)
    const supabase = createClient()
    const curriculum = textToCurriculum(curriculumText)
    const payload = {
      title: editing.title,
      description: editing.description,
      short_description: editing.short_description,
      category: editing.category,
      price: editing.price || 0,
      currency: editing.currency || "USD",
      duration: editing.duration,
      level: editing.level,
      curriculum,
      is_active: editing.is_active,
      max_students: editing.max_students || 50,
      sort_order: editing.sort_order || 0,
    }
    if (isEdit && editing.id) {
      await supabase.from("courses").update(payload).eq("id", editing.id)
    } else {
      await supabase.from("courses").insert(payload)
    }
    setSaving(false)
    setDialogOpen(false)
    loadCourses()
  }

  async function handleDelete(id: string) {
    if (!confirm("Delete this course? This will also remove all registrations.")) return
    const supabase = createClient()
    await supabase.from("courses").delete().eq("id", id)
    loadCourses()
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
          <h1 className="font-heading text-2xl font-bold text-foreground">Courses</h1>
          <p className="text-sm text-muted-foreground">Manage your training courses</p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={openCreate} className="gap-2">
              <Plus className="h-4 w-4" /> Add Course
            </Button>
          </DialogTrigger>
          <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl">
            <DialogHeader>
              <DialogTitle>{isEdit ? "Edit Course" : "Add Course"}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label>Title</Label>
                <Input value={editing.title || ""} onChange={(e) => setEditing({ ...editing, title: e.target.value })} />
              </div>
              <div>
                <Label>Short Description</Label>
                <Input value={editing.short_description || ""} onChange={(e) => setEditing({ ...editing, short_description: e.target.value })} />
              </div>
              <div>
                <Label>Full Description</Label>
                <Textarea rows={4} value={editing.description || ""} onChange={(e) => setEditing({ ...editing, description: e.target.value })} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Price</Label>
                  <Input type="number" step="0.01" value={editing.price || 0} onChange={(e) => setEditing({ ...editing, price: parseFloat(e.target.value) || 0 })} />
                </div>
                <div>
                  <Label>Currency</Label>
                  <Input value={editing.currency || "USD"} onChange={(e) => setEditing({ ...editing, currency: e.target.value })} />
                </div>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <Label>Duration</Label>
                  <Input value={editing.duration || ""} onChange={(e) => setEditing({ ...editing, duration: e.target.value })} placeholder="e.g. 12 weeks" />
                </div>
                <div>
                  <Label>Level</Label>
                  <Input value={editing.level || ""} onChange={(e) => setEditing({ ...editing, level: e.target.value })} placeholder="beginner" />
                </div>
                <div>
                  <Label>Max Students</Label>
                  <Input type="number" value={editing.max_students || 50} onChange={(e) => setEditing({ ...editing, max_students: parseInt(e.target.value) || 50 })} />
                </div>
              </div>
              <div>
                <Label>Category</Label>
                <Input value={editing.category || ""} onChange={(e) => setEditing({ ...editing, category: e.target.value })} />
              </div>
              <div>
                <Label>Curriculum</Label>
                <p className="mb-1 text-xs text-muted-foreground">{"Use ## Module Name for modules and - Lesson for lessons"}</p>
                <Textarea rows={10} value={curriculumText} onChange={(e) => setCurriculumText(e.target.value)} placeholder={"## Module 1\n- Lesson 1\n- Lesson 2\n\n## Module 2\n- Lesson 3"} className="font-mono text-sm" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Sort Order</Label>
                  <Input type="number" value={editing.sort_order || 0} onChange={(e) => setEditing({ ...editing, sort_order: parseInt(e.target.value) || 0 })} />
                </div>
                <div className="flex items-end">
                  <label className="flex items-center gap-2 text-sm">
                    <input type="checkbox" checked={editing.is_active !== false} onChange={(e) => setEditing({ ...editing, is_active: e.target.checked })} className="rounded" />
                    Active
                  </label>
                </div>
              </div>
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
                <Button onClick={handleSave} disabled={saving}>{saving ? "Saving..." : "Save"}</Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {courses.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center text-muted-foreground">
            No courses yet. Click &ldquo;Add Course&rdquo; to create one.
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {courses.map((c) => (
            <Card key={c.id}>
              <CardContent className="flex flex-wrap items-center justify-between gap-4 p-4">
                <div className="flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="font-medium text-foreground">{c.title}</h3>
                    <Badge variant={c.is_active ? "default" : "secondary"}>{c.is_active ? "Active" : "Inactive"}</Badge>
                    <Badge variant="outline">{c.level}</Badge>
                    <Badge variant="outline">{c.category}</Badge>
                  </div>
                  <p className="mt-1 text-sm text-muted-foreground">{c.short_description}</p>
                  <p className="mt-1 text-sm font-medium text-foreground">{c.currency} {c.price} &middot; {c.duration}</p>
                </div>
                <div className="flex items-center gap-2">
                  <Button variant="outline" size="sm" onClick={() => openEdit(c)} className="gap-1">
                    <Pencil className="h-3 w-3" /> Edit
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => handleDelete(c.id)} className="gap-1 text-destructive hover:text-destructive">
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
