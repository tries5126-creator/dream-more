"use client"

import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { CheckCircle, XCircle, Eye, Image } from "lucide-react"
import type { Registration } from "@/lib/types"

export default function AdminRegistrationsPage() {
  const [registrations, setRegistrations] = useState<Registration[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState("all")
  const [selected, setSelected] = useState<Registration | null>(null)
  const [adminNote, setAdminNote] = useState("")
  const [saving, setSaving] = useState(false)
  const [screenshotOpen, setScreenshotOpen] = useState(false)
  const [screenshotUrl, setScreenshotUrl] = useState("")

  async function loadRegistrations() {
    const supabase = createClient()
    let query = supabase
      .from("registrations")
      .select("*, course:courses(*), student:profiles!registrations_student_id_fkey(*)")
      .order("registered_at", { ascending: false })
    if (filter !== "all") {
      query = query.eq("status", filter)
    }
    const { data } = await query
    setRegistrations(data || [])
    setLoading(false)
  }

  useEffect(() => { loadRegistrations() }, [filter])

  async function handleAction(id: string, status: "approved" | "rejected") {
    setSaving(true)
    const supabase = createClient()
    const updates: Record<string, any> = {
      status,
      admin_note: adminNote,
    }
    if (status === "approved") {
      updates.approved_at = new Date().toISOString()
    }
    await supabase.from("registrations").update(updates).eq("id", id)
    setSaving(false)
    setSelected(null)
    setAdminNote("")
    loadRegistrations()
  }

  function viewScreenshot(url: string) {
    setScreenshotUrl(url)
    setScreenshotOpen(true)
  }

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
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-heading text-2xl font-bold text-foreground">Registrations</h1>
          <p className="text-sm text-muted-foreground">
            Review student registrations and payment screenshots
          </p>
        </div>
        <Select value={filter} onValueChange={setFilter}>
          <SelectTrigger className="w-44">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="payment_review">Payment Review</SelectItem>
            <SelectItem value="approved">Approved</SelectItem>
            <SelectItem value="rejected">Rejected</SelectItem>
            <SelectItem value="completed">Completed</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {registrations.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center text-muted-foreground">
            No registrations found for this filter.
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {registrations.map((r) => (
            <Card key={r.id}>
              <CardContent className="p-4">
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div className="flex-1 space-y-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="font-medium text-foreground">
                        {r.student?.full_name || r.student?.email || "Unknown Student"}
                      </p>
                      <Badge className={statusColors[r.status]}>{r.status.replace("_", " ")}</Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      <span className="font-medium">Course:</span> {r.course?.title || "Unknown"}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      <span className="font-medium">Email:</span> {r.student?.email}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      <span className="font-medium">Date:</span>{" "}
                      {new Date(r.registered_at).toLocaleDateString()} at{" "}
                      {new Date(r.registered_at).toLocaleTimeString()}
                    </p>
                    {r.payment_note && (
                      <p className="text-sm text-muted-foreground">
                        <span className="font-medium">Student Note:</span> {r.payment_note}
                      </p>
                    )}
                    {r.admin_note && (
                      <p className="text-sm text-muted-foreground">
                        <span className="font-medium">Admin Note:</span> {r.admin_note}
                      </p>
                    )}
                  </div>
                  <div className="flex flex-col gap-2">
                    {r.payment_screenshot_url && (
                      <Button
                        variant="outline"
                        size="sm"
                        className="gap-1"
                        onClick={() => viewScreenshot(r.payment_screenshot_url!)}
                      >
                        <Image className="h-3 w-3" />
                        View Payment
                      </Button>
                    )}
                    {(r.status === "pending" || r.status === "payment_review") && (
                      <Button
                        variant="outline"
                        size="sm"
                        className="gap-1"
                        onClick={() => {
                          setSelected(r)
                          setAdminNote(r.admin_note || "")
                        }}
                      >
                        <Eye className="h-3 w-3" />
                        Review
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Review dialog */}
      <Dialog open={!!selected} onOpenChange={(open) => !open && setSelected(null)}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Review Registration</DialogTitle>
          </DialogHeader>
          {selected && (
            <div className="space-y-4">
              <div className="rounded-md border p-3">
                <p className="text-sm"><span className="font-medium">Student:</span> {selected.student?.full_name || selected.student?.email}</p>
                <p className="text-sm"><span className="font-medium">Course:</span> {selected.course?.title}</p>
                <p className="text-sm"><span className="font-medium">Price:</span> {selected.course?.currency} {selected.course?.price}</p>
              </div>

              {selected.payment_screenshot_url && (
                <div>
                  <Label>Payment Screenshot</Label>
                  <div className="mt-1 overflow-hidden rounded-md border">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={selected.payment_screenshot_url}
                      alt="Payment screenshot"
                      className="w-full"
                    />
                  </div>
                </div>
              )}

              {selected.payment_note && (
                <div>
                  <Label>Student Note</Label>
                  <p className="mt-1 rounded-md border p-2 text-sm">{selected.payment_note}</p>
                </div>
              )}

              <div>
                <Label>Admin Note</Label>
                <Textarea
                  rows={3}
                  value={adminNote}
                  onChange={(e) => setAdminNote(e.target.value)}
                  placeholder="Optional note for the student..."
                />
              </div>

              <div className="flex justify-end gap-2">
                <Button
                  variant="outline"
                  onClick={() => handleAction(selected.id, "rejected")}
                  disabled={saving}
                  className="gap-1 text-destructive"
                >
                  <XCircle className="h-4 w-4" />
                  Reject
                </Button>
                <Button
                  onClick={() => handleAction(selected.id, "approved")}
                  disabled={saving}
                  className="gap-1"
                >
                  <CheckCircle className="h-4 w-4" />
                  Approve
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Screenshot viewer */}
      <Dialog open={screenshotOpen} onOpenChange={setScreenshotOpen}>
        <DialogContent className="sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>Payment Screenshot</DialogTitle>
          </DialogHeader>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={screenshotUrl} alt="Payment screenshot" className="w-full rounded-md" />
        </DialogContent>
      </Dialog>
    </div>
  )
}
