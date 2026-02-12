"use client"

import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
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
import type { Service } from "@/lib/types"

const defaultService: Partial<Service> = {
  title: "",
  description: "",
  short_description: "",
  icon_name: "Globe",
  category: "general",
  features: [],
  is_active: true,
  sort_order: 0,
}

export default function AdminServicesPage() {
  const [services, setServices] = useState<Service[]>([])
  const [loading, setLoading] = useState(true)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editing, setEditing] = useState<Partial<Service>>(defaultService)
  const [isEdit, setIsEdit] = useState(false)
  const [saving, setSaving] = useState(false)
  const [featuresText, setFeaturesText] = useState("")

  async function loadServices() {
    const supabase = createClient()
    const { data } = await supabase
      .from("services")
      .select("*")
      .order("sort_order")
    setServices(data || [])
    setLoading(false)
  }

  useEffect(() => { loadServices() }, [])

  function openCreate() {
    setEditing({ ...defaultService })
    setFeaturesText("")
    setIsEdit(false)
    setDialogOpen(true)
  }

  function openEdit(service: Service) {
    setEditing({ ...service })
    setFeaturesText(Array.isArray(service.features) ? service.features.join("\n") : "")
    setIsEdit(true)
    setDialogOpen(true)
  }

  async function handleSave() {
    setSaving(true)
    const supabase = createClient()
    const features = featuresText
      .split("\n")
      .map((f) => f.trim())
      .filter(Boolean)

    const payload = {
      title: editing.title,
      description: editing.description,
      short_description: editing.short_description,
      icon_name: editing.icon_name,
      category: editing.category,
      features,
      is_active: editing.is_active,
      sort_order: editing.sort_order || 0,
    }

    if (isEdit && editing.id) {
      await supabase.from("services").update(payload).eq("id", editing.id)
    } else {
      await supabase.from("services").insert(payload)
    }

    setSaving(false)
    setDialogOpen(false)
    loadServices()
  }

  async function handleDelete(id: string) {
    if (!confirm("Are you sure you want to delete this service?")) return
    const supabase = createClient()
    await supabase.from("services").delete().eq("id", id)
    loadServices()
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
          <h1 className="font-heading text-2xl font-bold text-foreground">Services</h1>
          <p className="text-sm text-muted-foreground">Manage your service offerings</p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={openCreate} className="gap-2">
              <Plus className="h-4 w-4" />
              Add Service
            </Button>
          </DialogTrigger>
          <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-xl">
            <DialogHeader>
              <DialogTitle>{isEdit ? "Edit Service" : "Add Service"}</DialogTitle>
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
                  <Label>Icon Name (Lucide)</Label>
                  <Input value={editing.icon_name || ""} onChange={(e) => setEditing({ ...editing, icon_name: e.target.value })} placeholder="e.g. Globe, PenTool" />
                </div>
                <div>
                  <Label>Category</Label>
                  <Input value={editing.category || ""} onChange={(e) => setEditing({ ...editing, category: e.target.value })} />
                </div>
              </div>
              <div>
                <Label>Features (one per line)</Label>
                <Textarea rows={4} value={featuresText} onChange={(e) => setFeaturesText(e.target.value)} placeholder={"Feature 1\nFeature 2\nFeature 3"} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Sort Order</Label>
                  <Input type="number" value={editing.sort_order || 0} onChange={(e) => setEditing({ ...editing, sort_order: parseInt(e.target.value) || 0 })} />
                </div>
                <div className="flex items-end gap-2">
                  <label className="flex items-center gap-2 text-sm">
                    <input type="checkbox" checked={editing.is_active !== false} onChange={(e) => setEditing({ ...editing, is_active: e.target.checked })} className="rounded" />
                    Active
                  </label>
                </div>
              </div>
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
                <Button onClick={handleSave} disabled={saving}>
                  {saving ? "Saving..." : "Save"}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {services.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center text-muted-foreground">
            No services yet. Click &ldquo;Add Service&rdquo; to create one.
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {services.map((s) => (
            <Card key={s.id}>
              <CardContent className="flex flex-wrap items-center justify-between gap-4 p-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <h3 className="font-medium text-foreground">{s.title}</h3>
                    <Badge variant={s.is_active ? "default" : "secondary"}>
                      {s.is_active ? "Active" : "Inactive"}
                    </Badge>
                    <Badge variant="outline">{s.category}</Badge>
                  </div>
                  <p className="mt-1 text-sm text-muted-foreground">{s.short_description}</p>
                </div>
                <div className="flex items-center gap-2">
                  <Button variant="outline" size="sm" onClick={() => openEdit(s)} className="gap-1">
                    <Pencil className="h-3 w-3" /> Edit
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => handleDelete(s.id)} className="gap-1 text-destructive hover:text-destructive">
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
