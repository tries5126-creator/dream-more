import Link from "next/link"
import { ArrowRight, Sparkles } from "lucide-react"
import { Button } from "@/components/ui/button"
import type { SiteSettings } from "@/lib/types"

export function Hero({ settings }: { settings: SiteSettings | null }) {
  return (
    <section className="relative flex min-h-[90vh] items-center overflow-hidden bg-[hsl(218,16%,28%)]">
      {/* Decorative grid */}
      <div className="absolute inset-0 opacity-[0.04]">
        <div
          className="h-full w-full"
          style={{
            backgroundImage:
              "linear-gradient(hsl(30,25%,91%) 1px, transparent 1px), linear-gradient(to right, hsl(30,25%,91%) 1px, transparent 1px)",
            backgroundSize: "60px 60px",
          }}
        />
      </div>

      {/* Gradient overlay */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-[hsl(218,16%,22%)] to-transparent" />

      <div className="relative mx-auto flex max-w-7xl flex-col items-center px-6 py-32 text-center">
        <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-[hsl(30,25%,91%)]/20 bg-[hsl(30,25%,91%)]/10 px-4 py-1.5">
          <Sparkles className="h-4 w-4 text-primary" />
          <span className="text-sm font-medium text-[hsl(30,25%,91%)]">
            Services & Training
          </span>
        </div>

        <h1 className="font-heading max-w-4xl text-balance text-4xl font-bold leading-tight text-[hsl(30,25%,91%)] md:text-6xl lg:text-7xl">
          {settings?.tagline || "Transforming Ideas Into Digital Reality"}
        </h1>

        <p className="mt-6 max-w-2xl text-pretty text-lg leading-relaxed text-[hsl(30,25%,91%)]/70 md:text-xl">
          {settings?.description ||
            "We are a full-service digital agency specializing in web development, design, marketing, and professional training."}
        </p>

        <div className="mt-10 flex flex-col gap-4 sm:flex-row">
          <Link href="#services">
            <Button size="lg" className="gap-2 text-base">
              Explore Our Services
              <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
          <Link href="#courses">
            <Button
              size="lg"
              variant="outline"
              className="gap-2 border-[hsl(30,25%,91%)]/20 bg-transparent text-base text-[hsl(30,25%,91%)] hover:bg-[hsl(30,25%,91%)]/10 hover:text-[hsl(30,25%,91%)]"
            >
              Browse Courses
            </Button>
          </Link>
        </div>

        {/* Stats */}
        <div className="mt-20 grid grid-cols-2 gap-8 md:grid-cols-4">
          {[
            { label: "Projects Completed", value: "200+" },
            { label: "Students Trained", value: "500+" },
            { label: "Happy Clients", value: "150+" },
            { label: "Years Experience", value: "5+" },
          ].map((stat) => (
            <div key={stat.label} className="text-center">
              <div className="font-heading text-3xl font-bold text-primary">
                {stat.value}
              </div>
              <div className="mt-1 text-sm text-[hsl(30,25%,91%)]/60">
                {stat.label}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
