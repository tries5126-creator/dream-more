"use client"

import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Mail, MailOpen, Trash2, Eye } from "lucide-react"
import type { ContactMessage } from "@/lib/types"

export default function AdminMessagesPage() {
  const [messages, setMessages] = useState<ContactMessage[]>([])
  const [loading, setLoading] = useState(true)
  const [selected, setSelected] = useState<ContactMessage | null>(null)

  async function load() {
    const supabase = createClient()
    const { data } = await supabase
      .from("contact_messages")
      .select("*")
      .order("created_at", { ascending: false })
    setMessages(data || [])
    setLoading(false)
  }

  useEffect(() => {
    load()
  }, [])

  async function handleView(msg: ContactMessage) {
    setSelected(msg)
    if (!msg.is_read) {
      const supabase = createClient()
      await supabase
        .from("contact_messages")
        .update({ is_read: true })
        .eq("id", msg.id)
      setMessages((prev) =>
        prev.map((m) => (m.id === msg.id ? { ...m, is_read: true } : m))
      )
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("Delete this message?")) return
    const supabase = createClient()
    await supabase.from("contact_messages").delete().eq("id", id)
    setMessages((prev) => prev.filter((m) => m.id !== id))
    if (selected?.id === id) setSelected(null)
  }

  const unread = messages.filter((m) => !m.is_read).length

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-heading text-2xl font-bold text-foreground">
          Messages
        </h1>
        <p className="text-sm text-muted-foreground">
          Contact form submissions from visitors
          {unread > 0 && (
            <Badge className="ml-2 bg-primary text-primary-foreground">
              {unread} unread
            </Badge>
          )}
        </p>
      </div>

      {messages.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center gap-2 py-12 text-center text-muted-foreground">
            <Mail className="h-10 w-10" />
            <p>No messages yet.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-3">
          {messages.map((msg) => (
            <Card
              key={msg.id}
              className={!msg.is_read ? "border-primary/30 bg-primary/5" : ""}
            >
              <CardContent className="flex flex-wrap items-center justify-between gap-3 p-4">
                <div className="flex items-center gap-3">
                  <div
                    className={`flex h-10 w-10 items-center justify-center rounded-full ${
                      msg.is_read
                        ? "bg-muted text-muted-foreground"
                        : "bg-primary/10 text-primary"
                    }`}
                  >
                    {msg.is_read ? (
                      <MailOpen className="h-5 w-5" />
                    ) : (
                      <Mail className="h-5 w-5" />
                    )}
                  </div>
                  <div>
                    <p className="font-medium text-foreground">
                      {msg.name}
                      {!msg.is_read && (
                        <span className="ml-2 inline-block h-2 w-2 rounded-full bg-primary" />
                      )}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {msg.subject || "No subject"} &middot; {msg.email}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(msg.created_at).toLocaleDateString()} at{" "}
                      {new Date(msg.created_at).toLocaleTimeString()}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="gap-1"
                    onClick={() => handleView(msg)}
                  >
                    <Eye className="h-3 w-3" /> Read
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDelete(msg.id)}
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

      {/* Message detail dialog */}
      <Dialog open={!!selected} onOpenChange={(open) => !open && setSelected(null)}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Message from {selected?.name}</DialogTitle>
          </DialogHeader>
          {selected && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <span className="font-medium text-foreground">Name</span>
                  <p className="text-muted-foreground">{selected.name}</p>
                </div>
                <div>
                  <span className="font-medium text-foreground">Email</span>
                  <p className="text-muted-foreground">{selected.email}</p>
                </div>
                <div className="col-span-2">
                  <span className="font-medium text-foreground">Subject</span>
                  <p className="text-muted-foreground">
                    {selected.subject || "No subject"}
                  </p>
                </div>
              </div>
              <div>
                <span className="text-sm font-medium text-foreground">
                  Message
                </span>
                <div className="mt-1 whitespace-pre-wrap rounded-md border bg-muted/50 p-4 text-sm text-foreground">
                  {selected.message}
                </div>
              </div>
              <div className="flex justify-end gap-2">
                <a href={`mailto:${selected.email}?subject=Re: ${selected.subject}`}>
                  <Button className="gap-1">
                    <Mail className="h-4 w-4" /> Reply via Email
                  </Button>
                </a>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
