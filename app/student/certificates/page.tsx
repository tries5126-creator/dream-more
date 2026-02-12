import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { Award, Download } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

export default async function StudentCertificatesPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect("/auth/login")

  const { data: certificates } = await supabase
    .from("certificates")
    .select("*, course:courses(title)")
    .eq("student_id", user.id)
    .order("issued_at", { ascending: false })

  return (
    <div className="mx-auto max-w-3xl">
      <h1 className="font-heading text-2xl font-bold">My Certificates</h1>
      <p className="mt-1 text-muted-foreground">Download your earned certificates.</p>

      {!certificates || certificates.length === 0 ? (
        <Card className="mt-6">
          <CardContent className="flex flex-col items-center p-8 text-center">
            <Award className="h-10 w-10 text-muted-foreground/40" />
            <p className="mt-3 font-medium">No certificates yet</p>
            <p className="mt-1 text-sm text-muted-foreground">
              Complete your courses to earn certificates.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          {certificates.map((cert: Record<string, unknown>) => (
            <Card key={cert.id as string}>
              <CardContent className="p-5">
                <div className="flex items-start gap-3">
                  <div className="rounded-lg bg-primary/10 p-2.5">
                    <Award className="h-5 w-5 text-primary" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-heading font-semibold">
                      {(cert.course as Record<string, string>)?.title || "Course Certificate"}
                    </h3>
                    <p className="mt-1 text-xs text-muted-foreground">
                      Issued {new Date(cert.issued_at as string).toLocaleDateString("en-US", {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      })}
                    </p>
                  </div>
                </div>
                <a
                  href={cert.certificate_url as string}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-4 block"
                >
                  <Button variant="outline" size="sm" className="w-full gap-2">
                    <Download className="h-4 w-4" />
                    Download Certificate
                  </Button>
                </a>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
