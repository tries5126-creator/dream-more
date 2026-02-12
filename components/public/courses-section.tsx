import Link from "next/link"
import { Clock, BarChart3, Users, ArrowRight } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import type { Course } from "@/lib/types"

export function CoursesSection({ courses }: { courses: Course[] }) {
  return (
    <section id="courses" className="bg-[hsl(218,16%,28%)] py-24">
      <div className="mx-auto max-w-7xl px-6">
        <div className="text-center">
          <span className="text-sm font-semibold uppercase tracking-wider text-primary">
            Learn With Us
          </span>
          <h2 className="font-heading mt-2 text-balance text-3xl font-bold text-[hsl(30,25%,91%)] md:text-4xl">
            Professional Training Courses
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-pretty text-[hsl(30,25%,91%)]/70">
            Gain practical skills from industry experts. Our courses are
            designed to take you from beginner to professional.
          </p>
        </div>

        <div className="mt-16 grid gap-8 md:grid-cols-2 lg:grid-cols-3">
          {courses.map((course) => (
            <Card
              key={course.id}
              className="group overflow-hidden border-[hsl(30,25%,91%)]/10 bg-[hsl(218,16%,33%)] transition-all duration-300 hover:border-primary/40"
            >
              {course.image_url && (
                <div className="aspect-video overflow-hidden">
                  <img
                    src={course.image_url}
                    alt={course.title}
                    className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                </div>
              )}
              <CardContent className="p-6">
                <div className="flex items-center gap-2">
                  <Badge
                    variant="secondary"
                    className="bg-primary/15 text-primary border-0"
                  >
                    {course.category}
                  </Badge>
                  <Badge
                    variant="outline"
                    className="border-[hsl(30,25%,91%)]/20 text-[hsl(30,25%,91%)]/60"
                  >
                    {course.level}
                  </Badge>
                </div>

                <h3 className="font-heading mt-3 text-xl font-semibold text-[hsl(30,25%,91%)]">
                  {course.title}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-[hsl(30,25%,91%)]/60">
                  {course.short_description}
                </p>

                <div className="mt-4 flex items-center gap-4 text-xs text-[hsl(30,25%,91%)]/50">
                  <span className="flex items-center gap-1">
                    <Clock className="h-3.5 w-3.5" />
                    {course.duration}
                  </span>
                  <span className="flex items-center gap-1">
                    <BarChart3 className="h-3.5 w-3.5" />
                    {course.level}
                  </span>
                  <span className="flex items-center gap-1">
                    <Users className="h-3.5 w-3.5" />
                    {course.max_students} seats
                  </span>
                </div>

                <div className="mt-6 flex items-center justify-between">
                  <div className="font-heading text-2xl font-bold text-primary">
                    {course.currency === "USD" ? "$" : course.currency}
                    {Number(course.price).toFixed(2)}
                  </div>
                  <Link href="/auth/sign-up">
                    <Button
                      size="sm"
                      className="gap-1"
                    >
                      Enroll Now
                      <ArrowRight className="h-3.5 w-3.5" />
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  )
}
