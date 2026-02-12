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
import { Plus, Pencil, Trash2, Upload } from "lucide-react"
import type { PortfolioItem } from "@/lib/types"

export default function AdminPortfolioPage() {
  const [items, setItems] = useState<PortfolioItem[]>([])
  const [loading, setLoading] = useState(true)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editing, setEditing] = useState<Partial<PortfolioItem>>({ title: "", description: "", category: "general", is_featured: false })
  const [isEdit, setIsEdit] = useState(false)
  const [saving, setSaving] = useState(false)
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(null)

  async function load() {
    const supabase = createClient()
    const { data } = await supabase.from("portfolio").select("*").order("sort_order")
    setItems(data || [])
    setLoading(false)
  }

  useEffect(() => { load() }, [])

  function openCreate() {
    setEditing({ title: "", description: "", category: "general", is_featured: false, sort_order: 0 })
    setImageFile(null)
    setImagePreview(null)
    setIsEdit(false)
    setDialogOpen(true)
  }

  function openEdit(item: PortfolioItem) {
    setEditing({ ...item })
    setImagePreview(item.image_url)
    setImageFile(null)
    setIsEdit(true)
    setDialogOpen(true)
  }

  async function handleSave() {
    setSaving(true)
    const supabase = createClient()
    let imageUrl = editing.image_url || null
    if (imageFile) {
      const ext = imageFile.name.split(".").pop()
      const path = `portfolio/${Date.now()}.${ext}`
      const { error } = await supabase.storage.from("uploads").upload(path, imageFile)
      if (!error) {
        const { data } = supabase.storage.from("uploads").getPublicUrl(path)
        imageUrl = data.publicUrl
      }
    }
    const payload = { title: editing.title, description: editing.description, image_url: imageUrl, category: editing.category, is_featured: editing.is_featured, sort_order: editing.sort_order || 0 }
    if (isEdit && editing.id) {
      await supabase.from("portfolio").update(payload).eq("id", editing.id)
    } else {
      await supabase.from("portfolio").insert(payload)
    }
    setSaving(false)
    setDialogOpen(false)
    load()
  }

  async function handleDelete(id: string) {
    if (!confirm("Delete this portfolio item?")) return
    const supabase = createClient()
    await supabase.from("portfolio").delete().eq("id", id)
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
          <h1 className="font-heading text-2xl font-bold text-foreground">Portfolio</h1>
          <p className="text-sm text-muted-foreground">Showcase your work</p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={openCreate} className="gap-2"><Plus className="h-4 w-4" /> Add Item</Button>
          </DialogTrigger>
          <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
            <DialogHeader>
              <DialogTitle>{isEdit ? "Edit Item" : "Add Item"}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div><Label>Title</Label><Input value={editing.title || ""} onChange={(e) => setEditing({ ...editing, title: e.target.value })} /></div>
              <div><Label>Description</Label><Textarea rows={3} value={editing.description || ""} onChange={(e) => setEditing({ ...editing, description: e.target.value })} /></div>
              <div><Label>Category</Label><Input value={editing.category || ""} onChange={(e) => setEditing({ ...editing, category: e.target.value })} /></div>
              <div>
                <Label>Image</Label>
                <div className="mt-1 flex items-center gap-4">
                  {imagePreview && (
                    <div className="h-20 w-20 overflow-hidden rounded-md border">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={imagePreview} alt="Preview" className="h-full w-full object-cover" />
                    </div>
                  )}
                  <label className="flex cursor-pointer items-center gap-2 rounded-md border px-4 py-2 text-sm hover:bg-muted">
                    <Upload className="h-4 w-4" /> Upload
                    <input type="file" accept="image/*" className="sr-only" onChange={(e) => {
                      const f = e.target.files?.[0]
                      if (f) { setImageFile(f); setImagePreview(URL.createObjectURL(f)) }
                    }} />
                  </label>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div><Label>Sort Order</Label><Input type="number" value={editing.sort_order || 0} onChange={(e) => setEditing({ ...editing, sort_order: parseInt(e.target.value) || 0 })} /></div>
                <div className="flex items-end"><label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={!!editing.is_featured} onChange={(e) => setEditing({ ...editing, is_featured: e.target.checked })} className="rounded" />Featured</label></div>
              </div>
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
                <Button onClick={handleSave} disabled={saving}>{saving ? "Saving..." : "Save"}</Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {items.length === 0 ? (
        <Card><CardContent className="py-12 text-center text-muted-foreground">No portfolio items yet.</CardContent></Card>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((item) => (
            <Card key={item.id} className="overflow-hidden">
              {item.image_url && (
                <div className="aspect-video overflow-hidden bg-muted">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={item.image_url} alt={item.title} className="h-full w-full object-cover" />
                </div>
              )}
              <CardContent className="p-4">
                <div className="flex items-center gap-2">
                  <h3 className="font-medium text-foreground">{item.title}</h3>
                  {item.is_featured && <Badge>Featured</Badge>}
                </div>
                <p className="mt-1 text-sm text-muted-foreground line-clamp-2">{item.description}</p>
                <div className="mt-3 flex gap-2">
                  <Button variant="outline" size="sm" onClick={() => openEdit(item)} className="gap-1"><Pencil className="h-3 w-3" /> Edit</Button>
                  <Button variant="outline" size="sm" onClick={() => handleDelete(item.id)} className="gap-1 text-destructive"><Trash2 className="h-3 w-3" /> Delete</Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
