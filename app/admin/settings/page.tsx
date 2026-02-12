"use client"

import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Save, Upload } from "lucide-react"
import type { SiteSettings } from "@/lib/types"

export default function AdminSettingsPage() {
  const [settings, setSettings] = useState<SiteSettings | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState("")
  const [logoFile, setLogoFile] = useState<File | null>(null)
  const [logoPreview, setLogoPreview] = useState<string | null>(null)

  useEffect(() => {
    async function load() {
      const supabase = createClient()
      const { data } = await supabase
        .from("site_settings")
        .select("*")
        .limit(1)
        .single()
      if (data) {
        setSettings(data)
        if (data.logo_url) setLogoPreview(data.logo_url)
      }
      setLoading(false)
    }
    load()
  }, [])

  function handleChange(field: string, value: string) {
    if (!settings) return
    setSettings({ ...settings, [field]: value })
  }

  function handleSocialChange(key: string, value: string) {
    if (!settings) return
    setSettings({
      ...settings,
      social_links: { ...settings.social_links, [key]: value },
    })
  }

  function handleLogoSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setLogoFile(file)
    setLogoPreview(URL.createObjectURL(file))
  }

  async function handleSave() {
    if (!settings) return
    setSaving(true)
    setMessage("")
    const supabase = createClient()

    let logoUrl = settings.logo_url

    if (logoFile) {
      const ext = logoFile.name.split(".").pop()
      const path = `logos/logo-${Date.now()}.${ext}`
      const { error: uploadError } = await supabase.storage
        .from("uploads")
        .upload(path, logoFile, { upsert: true })
      if (!uploadError) {
        const { data: urlData } = supabase.storage
          .from("uploads")
          .getPublicUrl(path)
        logoUrl = urlData.publicUrl
      }
    }

    const { error } = await supabase
      .from("site_settings")
      .update({
        company_name: settings.company_name,
        tagline: settings.tagline,
        description: settings.description,
        contact_email: settings.contact_email,
        contact_phone: settings.contact_phone,
        address: settings.address,
        social_links: settings.social_links,
        payment_instructions: settings.payment_instructions,
        logo_url: logoUrl,
        updated_at: new Date().toISOString(),
      })
      .eq("id", settings.id)

    setSaving(false)
    setMessage(error ? "Failed to save." : "Settings saved successfully.")
    if (!error && logoUrl) {
      setSettings({ ...settings, logo_url: logoUrl })
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    )
  }

  if (!settings) return <p className="text-muted-foreground">No settings found.</p>

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div>
        <h1 className="font-heading text-2xl font-bold text-foreground">Site Settings</h1>
        <p className="text-sm text-muted-foreground">
          Manage your company branding, contact info, and payment instructions.
        </p>
      </div>

      {message && (
        <div className={`rounded-md p-3 text-sm ${message.includes("success") ? "bg-green-50 text-green-700" : "bg-red-50 text-red-700"}`}>
          {message}
        </div>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Branding</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="company_name">Company Name</Label>
            <Input
              id="company_name"
              value={settings.company_name}
              onChange={(e) => handleChange("company_name", e.target.value)}
            />
          </div>

          <div>
            <Label htmlFor="tagline">Tagline</Label>
            <Input
              id="tagline"
              value={settings.tagline}
              onChange={(e) => handleChange("tagline", e.target.value)}
            />
          </div>

          <div>
            <Label>Logo</Label>
            <div className="mt-1 flex items-center gap-4">
              {logoPreview && (
                <div className="flex h-16 w-16 items-center justify-center overflow-hidden rounded-md border bg-muted">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={logoPreview}
                    alt="Logo preview"
                    className="h-full w-full object-contain"
                  />
                </div>
              )}
              <label className="flex cursor-pointer items-center gap-2 rounded-md border px-4 py-2 text-sm font-medium hover:bg-muted">
                <Upload className="h-4 w-4" />
                Upload Logo
                <input
                  type="file"
                  accept="image/*"
                  className="sr-only"
                  onChange={handleLogoSelect}
                />
              </label>
            </div>
          </div>

          <div>
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              rows={4}
              value={settings.description}
              onChange={(e) => handleChange("description", e.target.value)}
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Contact Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="contact_email">Email</Label>
            <Input
              id="contact_email"
              type="email"
              value={settings.contact_email}
              onChange={(e) => handleChange("contact_email", e.target.value)}
            />
          </div>
          <div>
            <Label htmlFor="contact_phone">Phone</Label>
            <Input
              id="contact_phone"
              value={settings.contact_phone}
              onChange={(e) => handleChange("contact_phone", e.target.value)}
            />
          </div>
          <div>
            <Label htmlFor="address">Address</Label>
            <Textarea
              id="address"
              rows={2}
              value={settings.address}
              onChange={(e) => handleChange("address", e.target.value)}
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Social Links</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {["facebook", "twitter", "instagram", "linkedin", "youtube"].map(
            (platform) => (
              <div key={platform}>
                <Label htmlFor={platform} className="capitalize">
                  {platform}
                </Label>
                <Input
                  id={platform}
                  placeholder={`https://${platform}.com/...`}
                  value={settings.social_links?.[platform] || ""}
                  onChange={(e) => handleSocialChange(platform, e.target.value)}
                />
              </div>
            )
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Payment Instructions</CardTitle>
        </CardHeader>
        <CardContent>
          <Textarea
            rows={4}
            placeholder="Instructions shown to students for payment (bank details, etc.)"
            value={settings.payment_instructions}
            onChange={(e) => handleChange("payment_instructions", e.target.value)}
          />
        </CardContent>
      </Card>

      <div className="flex justify-end">
        <Button onClick={handleSave} disabled={saving} className="gap-2">
          <Save className="h-4 w-4" />
          {saving ? "Saving..." : "Save Settings"}
        </Button>
      </div>
    </div>
  )
}
