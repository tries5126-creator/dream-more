"use client"

import { useEffect, useState } from "react"
import { useRouter, useParams } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Upload, CheckCircle, AlertCircle, Clock, BarChart3 } from "lucide-react"
import type { Course, Registration, SiteSettings } from "@/lib/types"

export default function RegisterCoursePage() {
  const params = useParams()
  const router = useRouter()
  const courseId = params.id as string

  const [course, setCourse] = useState<Course | null>(null)
  const [registration, setRegistration] = useState<Registration | null>(null)
  const [settings, setSettings] = useState<SiteSettings | null>(null)
  const [uploading, setUploading] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState("")
  const [screenshotUrl, setScreenshotUrl] = useState("")
  const [paymentNote, setPaymentNote] = useState("")
  const [success, setSuccess] = useState(false)

  useEffect(() => {
    async function load() {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const [courseRes, regRes, settingsRes] = await Promise.all([
        supabase.from("courses").select("*").eq("id", courseId).single(),
        supabase
          .from("registrations")
          .select("*")
          .eq("student_id", user.id)
          .eq("course_id", courseId)
          .maybeSingle(),
        supabase.from("site_settings").select("*").limit(1).single(),
      ])

      setCourse(courseRes.data)
      setRegistration(regRes.data)
      setSettings(settingsRes.data)
      if (regRes.data?.payment_screenshot_url) {
        setScreenshotUrl(regRes.data.payment_screenshot_url)
      }
    }
    load()
  }, [courseId])

  async function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setUploading(true)
    setError("")

    const supabase = createClient()
    const ext = file.name.split(".").pop()
    const path = `payments/${Date.now()}_${Math.random().toString(36).slice(2)}.${ext}`

    const { error: uploadErr } = await supabase.storage
      .from("uploads")
      .upload(path, file)

    if (uploadErr) {
      setError("Failed to upload screenshot")
      setUploading(false)
      return
    }

    const { data: urlData } = supabase.storage.from("uploads").getPublicUrl(path)
    setScreenshotUrl(urlData.publicUrl)
    setUploading(false)
  }

  async function handleSubmit() {
    if (!screenshotUrl) {
      setError("Please upload a payment screenshot")
      return
    }

    setSubmitting(true)
    setError("")
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    if (registration) {
      // Update existing
      await supabase
        .from("registrations")
        .update({
          payment_screenshot_url: screenshotUrl,
          payment_note: paymentNote,
          status: "payment_review",
        })
        .eq("id", registration.id)
    } else {
      // Create new
      await supabase.from("registrations").insert({
        student_id: user.id,
        course_id: courseId,
        payment_screenshot_url: screenshotUrl,
        payment_note: paymentNote,
        status: "payment_review",
      })
    }

    setSuccess(true)
    setSubmitting(false)
  }

  if (!course) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="text-muted-foreground">Loading course...</div>
      </div>
    )
  }

  if (success) {
    return (
      <div className="mx-auto max-w-lg">
        <Card>
          <CardContent className="flex flex-col items-center p-8 text-center">
            <div className="mb-4 rounded-full bg-green-100 p-4">
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
            <h2 className="font-heading text-xl font-bold">Registration Submitted!</h2>
            <p className="mt-2 text-sm text-muted-foreground">
              Your payment screenshot has been submitted for review. You will be notified once it is approved.
            </p>
            <Button className="mt-6" onClick={() => router.push("/student/courses")}>
              Back to Courses
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (registration && ["approved", "completed"].includes(registration.status)) {
    return (
      <div className="mx-auto max-w-lg">
        <Card>
          <CardContent className="flex flex-col items-center p-8 text-center">
            <div className="mb-4 rounded-full bg-green-100 p-4">
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
            <h2 className="font-heading text-xl font-bold">Already Enrolled!</h2>
            <p className="mt-2 text-sm text-muted-foreground">
              You are already enrolled in this course.
            </p>
            <Button className="mt-6" onClick={() => router.push(`/student/courses/learn/${courseId}`)}>
              Go to Course
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-2xl">
      <h1 className="font-heading text-2xl font-bold">Course Registration</h1>

      {/* Course info */}
      <Card className="mt-6">
        <CardContent className="p-5">
          <Badge variant="secondary" className="mb-2 text-xs">{course.category}</Badge>
          <h2 className="font-heading text-xl font-semibold">{course.title}</h2>
          <p className="mt-1 text-sm text-muted-foreground">{course.short_description}</p>
          <div className="mt-3 flex items-center gap-4 text-xs text-muted-foreground">
            <span className="flex items-center gap-1"><Clock className="h-3.5 w-3.5" />{course.duration}</span>
            <span className="flex items-center gap-1"><BarChart3 className="h-3.5 w-3.5" />{course.level}</span>
          </div>
          <div className="mt-4 font-heading text-2xl font-bold text-primary">
            ${Number(course.price).toFixed(2)}
          </div>
        </CardContent>
      </Card>

      {/* Payment instructions */}
      {settings?.payment_instructions && (
        <Card className="mt-4 border-primary/20 bg-primary/5">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-base">
              <AlertCircle className="h-4 w-4 text-primary" />
              Payment Instructions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">{settings.payment_instructions}</p>
          </CardContent>
        </Card>
      )}

      {/* Upload form */}
      <Card className="mt-4">
        <CardHeader>
          <CardTitle className="text-lg">Upload Payment Screenshot</CardTitle>
          <CardDescription>Take a screenshot of your payment receipt and upload it below.</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            <Label htmlFor="screenshot">Payment Screenshot</Label>
            <div className="flex items-center gap-4">
              <Input
                id="screenshot"
                type="file"
                accept="image/*"
                onChange={handleUpload}
                disabled={uploading}
                className="flex-1"
              />
              {uploading && <span className="text-sm text-muted-foreground">Uploading...</span>}
            </div>
            {screenshotUrl && (
              <div className="mt-2 overflow-hidden rounded-lg border">
                <img
                  src={screenshotUrl}
                  alt="Payment screenshot"
                  className="max-h-64 w-full object-contain"
                />
              </div>
            )}
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="note">Note (optional)</Label>
            <Textarea
              id="note"
              placeholder="Any additional details about your payment..."
              value={paymentNote}
              onChange={(e) => setPaymentNote(e.target.value)}
              rows={3}
            />
          </div>

          {error && (
            <p className="rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive">{error}</p>
          )}

          <Button onClick={handleSubmit} disabled={submitting || !screenshotUrl} className="gap-2">
            <Upload className="h-4 w-4" />
            {submitting ? "Submitting..." : "Submit Registration"}
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
