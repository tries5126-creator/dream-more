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
import { Plus, Pencil, Trash2, Star } from "lucide-react"
import type { Testimonial } from "@/lib/types"

export default function AdminTestimonialsPage() {
  const [items, setItems] = useState<Testimonial[]>([])
  const [loading, setLoading] = useState(true)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editing, setEditing] = useState<Partial<Testimonial>>({ client_name: "", client_title: "", content: "", rating: 5, is_active: true })
  const [isEdit, setIsEdit] = useState(false)
  const [saving, setSaving] = useState(false)

  async function load() {
    const supabase = createClient()
    const { data } = await supabase.from("testimonials").select("*").order("sort_order")
    setItems(data || [])
    setLoading(false)
  }

  useEffect(() => { load() }, [])

  function openCreate() {
    setEditing({ client_name: "", client_title: "", content: "", rating: 5, is_active: true, sort_order: 0 })
    setIsEdit(false)
    setDialogOpen(true)
  }

  function openEdit(t: Testimonial) {
    setEditing({ ...t })
    setIsEdit(true)
    setDialogOpen(true)
  }

  async function handleSave() {
    setSaving(true)
    const supabase = createClient()
    const payload = { client_name: editing.client_name, client_title: editing.client_title, content: editing.content, rating: editing.rating || 5, is_active: editing.is_active, sort_order: editing.sort_order || 0 }
    if (isEdit && editing.id) {
      await supabase.from("testimonials").update(payload).eq("id", editing.id)
    } else {
      await supabase.from("testimonials").insert(payload)
    }
    setSaving(false)
    setDialogOpen(false)
    load()
  }

  async function handleDelete(id: string) {
    if (!confirm("Delete this testimonial?")) return
    const supabase = createClient()
    await supabase.from("testimonials").delete().eq("id", id)
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
          <h1 className="font-heading text-2xl font-bold text-foreground">Testimonials</h1>
          <p className="text-sm text-muted-foreground">Manage client testimonials</p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={openCreate} className="gap-2"><Plus className="h-4 w-4" /> Add Testimonial</Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-lg">
            <DialogHeader>
              <DialogTitle>{isEdit ? "Edit Testimonial" : "Add Testimonial"}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div><Label>Client Name</Label><Input value={editing.client_name || ""} onChange={(e) => setEditing({ ...editing, client_name: e.target.value })} /></div>
              <div><Label>Client Title / Company</Label><Input value={editing.client_title || ""} onChange={(e) => setEditing({ ...editing, client_title: e.target.value })} /></div>
              <div><Label>Testimonial</Label><Textarea rows={4} value={editing.content || ""} onChange={(e) => setEditing({ ...editing, content: e.target.value })} /></div>
              <div className="grid grid-cols-2 gap-4">
                <div><Label>Rating (1-5)</Label><Input type="number" min={1} max={5} value={editing.rating || 5} onChange={(e) => setEditing({ ...editing, rating: parseInt(e.target.value) || 5 })} /></div>
                <div><Label>Sort Order</Label><Input type="number" value={editing.sort_order || 0} onChange={(e) => setEditing({ ...editing, sort_order: parseInt(e.target.value) || 0 })} /></div>
              </div>
              <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={editing.is_active !== false} onChange={(e) => setEditing({ ...editing, is_active: e.target.checked })} className="rounded" />Active</label>
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
                <Button onClick={handleSave} disabled={saving}>{saving ? "Saving..." : "Save"}</Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {items.length === 0 ? (
        <Card><CardContent className="py-12 text-center text-muted-foreground">No testimonials yet.</CardContent></Card>
      ) : (
        <div className="grid gap-3">
          {items.map((t) => (
            <Card key={t.id}>
              <CardContent className="flex items-start justify-between gap-4 p-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <p className="font-medium text-foreground">{t.client_name}</p>
                    <span className="text-sm text-muted-foreground">{t.client_title}</span>
                    <Badge variant={t.is_active ? "default" : "secondary"}>{t.is_active ? "Active" : "Inactive"}</Badge>
                  </div>
                  <p className="mt-1 text-sm text-muted-foreground line-clamp-2">{t.content}</p>
                  <div className="mt-1 flex items-center gap-1">
                    {Array.from({ length: t.rating }).map((_, i) => (
                      <Star key={i} className="h-3 w-3 fill-primary text-primary" />
                    ))}
                  </div>
                </div>
                <div className="flex gap-1">
                  <Button variant="ghost" size="icon" onClick={() => openEdit(t)}><Pencil className="h-4 w-4" /></Button>
                  <Button variant="ghost" size="icon" onClick={() => handleDelete(t.id)} className="text-destructive"><Trash2 className="h-4 w-4" /></Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
