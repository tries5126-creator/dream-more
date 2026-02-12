"use client"

import { useEffect, useState, useCallback } from "react"
import { useParams, useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Checkbox } from "@/components/ui/checkbox"
import {
  BookOpen,
  Download,
  FileText,
  ChevronDown,
  ChevronRight,
  ArrowLeft,
} from "lucide-react"
import type { Course, CourseMaterial, StudentProgress, CurriculumModule } from "@/lib/types"

export default function LearnCoursePage() {
  const params = useParams()
  const router = useRouter()
  const courseId = params.id as string

  const [course, setCourse] = useState<Course | null>(null)
  const [materials, setMaterials] = useState<CourseMaterial[]>([])
  const [progress, setProgress] = useState<StudentProgress[]>([])
  const [expandedModules, setExpandedModules] = useState<Set<number>>(new Set([0]))
  const [userId, setUserId] = useState<string>("")

  const totalLessons = course?.curriculum
    ? (course.curriculum as CurriculumModule[]).reduce(
        (sum, m) => sum + m.lessons.length,
        0
      )
    : 0
  const completedLessons = progress.length
  const progressPercent = totalLessons > 0 ? Math.round((completedLessons / totalLessons) * 100) : 0

  const loadData = useCallback(async () => {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return
    setUserId(user.id)

    const [courseRes, materialsRes, progressRes] = await Promise.all([
      supabase.from("courses").select("*").eq("id", courseId).single(),
      supabase.from("course_materials").select("*").eq("course_id", courseId).order("sort_order"),
      supabase.from("student_progress").select("*").eq("student_id", user.id).eq("course_id", courseId),
    ])

    setCourse(courseRes.data)
    setMaterials(materialsRes.data ?? [])
    setProgress(progressRes.data ?? [])
  }, [courseId])

  useEffect(() => {
    loadData()
  }, [loadData])

  async function toggleLesson(lessonKey: string, completed: boolean) {
    const supabase = createClient()
    if (completed) {
      await supabase
        .from("student_progress")
        .delete()
        .eq("student_id", userId)
        .eq("course_id", courseId)
        .eq("lesson_key", lessonKey)
      setProgress((prev) => prev.filter((p) => p.lesson_key !== lessonKey))
    } else {
      await supabase.from("student_progress").insert({
        student_id: userId,
        course_id: courseId,
        lesson_key: lessonKey,
      })
      setProgress((prev) => [
        ...prev,
        { id: "", student_id: userId, course_id: courseId, lesson_key: lessonKey, completed_at: new Date().toISOString() },
      ])
    }
  }

  function toggleModule(index: number) {
    setExpandedModules((prev) => {
      const next = new Set(prev)
      if (next.has(index)) next.delete(index)
      else next.add(index)
      return next
    })
  }

  if (!course) {
    return (
      <div className="flex h-64 items-center justify-center text-muted-foreground">
        Loading course...
      </div>
    )
  }

  const curriculum = (course.curriculum || []) as CurriculumModule[]

  return (
    <div className="mx-auto max-w-4xl">
      <Button variant="ghost" size="sm" className="mb-4 gap-1" onClick={() => router.push("/student/courses")}>
        <ArrowLeft className="h-4 w-4" /> Back to Courses
      </Button>

      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-heading text-2xl font-bold">{course.title}</h1>
          <p className="mt-1 text-sm text-muted-foreground">{course.short_description}</p>
        </div>
        <Badge variant="secondary">{course.level}</Badge>
      </div>

      {/* Progress bar */}
      <Card className="mt-6">
        <CardContent className="p-5">
          <div className="flex items-center justify-between text-sm">
            <span className="font-medium">Course Progress</span>
            <span className="text-muted-foreground">{completedLessons}/{totalLessons} lessons</span>
          </div>
          <Progress value={progressPercent} className="mt-2" />
          <p className="mt-1 text-xs text-muted-foreground">{progressPercent}% complete</p>
        </CardContent>
      </Card>

      <div className="mt-6 grid gap-6 lg:grid-cols-3">
        {/* Curriculum */}
        <div className="lg:col-span-2">
          <h2 className="font-heading text-lg font-semibold">Curriculum</h2>
          <div className="mt-4 flex flex-col gap-3">
            {curriculum.map((mod, mIdx) => {
              const isExpanded = expandedModules.has(mIdx)
              const moduleCompleted = mod.lessons.filter((l) =>
                progress.some((p) => p.lesson_key === `${mIdx}-${l}`)
              ).length

              return (
                <Card key={mIdx}>
                  <button
                    onClick={() => toggleModule(mIdx)}
                    className="flex w-full items-center justify-between p-4 text-left"
                  >
                    <div className="flex items-center gap-3">
                      {isExpanded ? (
                        <ChevronDown className="h-4 w-4 text-muted-foreground" />
                      ) : (
                        <ChevronRight className="h-4 w-4 text-muted-foreground" />
                      )}
                      <div>
                        <h3 className="text-sm font-semibold">{mod.module}</h3>
                        <p className="text-xs text-muted-foreground">
                          {moduleCompleted}/{mod.lessons.length} completed
                        </p>
                      </div>
                    </div>
                    <Badge variant="outline" className="text-xs">
                      {mod.lessons.length} lessons
                    </Badge>
                  </button>
                  {isExpanded && (
                    <div className="border-t px-4 pb-4">
                      {mod.lessons.map((lesson, lIdx) => {
                        const lessonKey = `${mIdx}-${lesson}`
                        const isCompleted = progress.some((p) => p.lesson_key === lessonKey)
                        return (
                          <div
                            key={lIdx}
                            className="flex items-center gap-3 border-b py-3 last:border-0"
                          >
                            <Checkbox
                              checked={isCompleted}
                              onCheckedChange={() => toggleLesson(lessonKey, isCompleted)}
                            />
                            <span
                              className={`text-sm ${isCompleted ? "text-muted-foreground line-through" : ""}`}
                            >
                              {lesson}
                            </span>
                          </div>
                        )
                      })}
                    </div>
                  )}
                </Card>
              )
            })}
          </div>
        </div>

        {/* Materials sidebar */}
        <div>
          <h2 className="font-heading text-lg font-semibold">Materials</h2>
          {materials.length === 0 ? (
            <Card className="mt-4">
              <CardContent className="p-6 text-center text-sm text-muted-foreground">
                <FileText className="mx-auto mb-2 h-8 w-8 text-muted-foreground/40" />
                No materials available yet
              </CardContent>
            </Card>
          ) : (
            <div className="mt-4 flex flex-col gap-3">
              {materials.map((mat) => (
                <Card key={mat.id}>
                  <CardContent className="flex items-center justify-between p-4">
                    <div className="flex items-center gap-3">
                      <FileText className="h-5 w-5 text-primary" />
                      <div>
                        <h4 className="text-sm font-medium">{mat.title}</h4>
                        <p className="text-xs text-muted-foreground">{mat.file_type.toUpperCase()}</p>
                      </div>
                    </div>
                    <a href={mat.file_url} target="_blank" rel="noopener noreferrer">
                      <Button size="icon" variant="ghost">
                        <Download className="h-4 w-4" />
                      </Button>
                    </a>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
