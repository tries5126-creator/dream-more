"use client"

import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
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
import { Plus, Trash2, Upload, FileBox, Download } from "lucide-react"
import type { CourseMaterial, Course } from "@/lib/types"

export default function AdminMaterialsPage() {
  const [materials, setMaterials] = useState<(CourseMaterial & { course?: Course })[]>([])
  const [courses, setCourses] = useState<Course[]>([])
  const [loading, setLoading] = useState(true)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [saving, setSaving] = useState(false)
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [selectedCourse, setSelectedCourse] = useState("")
  const [file, setFile] = useState<File | null>(null)

  async function load() {
    const supabase = createClient()
    const [matRes, courseRes] = await Promise.all([
      supabase
        .from("course_materials")
        .select("*, course:courses(*)")
        .order("sort_order"),
      supabase.from("courses").select("*").order("title"),
    ])
    setMaterials(matRes.data || [])
    setCourses(courseRes.data || [])
    setLoading(false)
  }

  useEffect(() => {
    load()
  }, [])

  async function handleAdd() {
    if (!title || !selectedCourse || !file) return
    setSaving(true)
    const supabase = createClient()

    const ext = file.name.split(".").pop()
    const path = `materials/${Date.now()}.${ext}`
    const { error: uploadError } = await supabase.storage
      .from("uploads")
      .upload(path, file)
    if (uploadError) {
      setSaving(false)
      return
    }

    const { data: urlData } = supabase.storage
      .from("uploads")
      .getPublicUrl(path)

    const fileType = ext === "pdf" ? "pdf" : "file"
    await supabase.from("course_materials").insert({
      course_id: selectedCourse,
      title,
      description,
      file_url: urlData.publicUrl,
      file_type: fileType,
      sort_order: materials.length,
    })

    setSaving(false)
    setDialogOpen(false)
    setTitle("")
    setDescription("")
    setSelectedCourse("")
    setFile(null)
    load()
  }

  async function handleDelete(id: string) {
    if (!confirm("Delete this material?")) return
    const supabase = createClient()
    await supabase.from("course_materials").delete().eq("id", id)
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
          <h1 className="font-heading text-2xl font-bold text-foreground">
            Course Materials
          </h1>
          <p className="text-sm text-muted-foreground">
            Upload downloadable materials for enrolled students
          </p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus className="h-4 w-4" /> Add Material
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-lg">
            <DialogHeader>
              <DialogTitle>Add Course Material</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label>Course</Label>
                <Select
                  value={selectedCourse}
                  onValueChange={setSelectedCourse}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select course" />
                  </SelectTrigger>
                  <SelectContent>
                    {courses.map((c) => (
                      <SelectItem key={c.id} value={c.id}>
                        {c.title}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Title</Label>
                <Input
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Week 1 - Introduction PDF"
                />
              </div>
              <div>
                <Label>Description (optional)</Label>
                <Textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Brief description of the material"
                  rows={2}
                />
              </div>
              <div>
                <Label>File (PDF, images, etc.)</Label>
                <label className="mt-1 flex cursor-pointer items-center gap-2 rounded-md border px-4 py-3 text-sm hover:bg-muted">
                  <Upload className="h-4 w-4" />
                  {file ? file.name : "Choose file..."}
                  <input
                    type="file"
                    accept="image/*,application/pdf"
                    className="sr-only"
                    onChange={(e) => setFile(e.target.files?.[0] || null)}
                  />
                </label>
              </div>
              <div className="flex justify-end gap-2">
                <Button
                  variant="outline"
                  onClick={() => setDialogOpen(false)}
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleAdd}
                  disabled={saving || !title || !selectedCourse || !file}
                >
                  {saving ? "Uploading..." : "Add Material"}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {materials.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center gap-2 py-12 text-center text-muted-foreground">
            <FileBox className="h-10 w-10" />
            <p>No course materials uploaded yet.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-3">
          {materials.map((mat) => (
            <Card key={mat.id}>
              <CardContent className="flex flex-wrap items-center justify-between gap-3 p-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-md bg-primary/10 text-primary">
                    <FileBox className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="font-medium text-foreground">{mat.title}</p>
                    <p className="text-xs text-muted-foreground">
                      {mat.course?.title || "Unknown course"} &middot;{" "}
                      {mat.file_type.toUpperCase()}
                    </p>
                    {mat.description && (
                      <p className="text-xs text-muted-foreground">
                        {mat.description}
                      </p>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <a href={mat.file_url} target="_blank" rel="noreferrer">
                    <Button variant="outline" size="sm" className="gap-1">
                      <Download className="h-3 w-3" /> Download
                    </Button>
                  </a>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDelete(mat.id)}
                    className="gap-1 text-destructive"
                  >
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
