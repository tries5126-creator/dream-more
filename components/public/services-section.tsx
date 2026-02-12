import {
  Globe,
  Palette,
  PenTool,
  FileImage,
  Video,
  TrendingUp,
  CheckCircle,
  type LucideIcon,
} from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import type { Service } from "@/lib/types"

const iconMap: Record<string, LucideIcon> = {
  Globe,
  Palette,
  PenTool,
  FileImage,
  Video,
  TrendingUp,
}

export function ServicesSection({ services }: { services: Service[] }) {
  return (
    <section id="services" className="py-24">
      <div className="mx-auto max-w-7xl px-6">
        <div className="text-center">
          <span className="text-sm font-semibold uppercase tracking-wider text-primary">
            What We Do
          </span>
          <h2 className="font-heading mt-2 text-balance text-3xl font-bold md:text-4xl">
            Our Services
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-pretty text-muted-foreground">
            From concept to launch, we provide end-to-end digital solutions that
            help your business thrive in the modern landscape.
          </p>
        </div>

        <div className="mt-16 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {services.map((service) => {
            const Icon = iconMap[service.icon_name] || Globe
            const features: string[] = Array.isArray(service.features)
              ? service.features
              : []

            return (
              <Card
                key={service.id}
                className="group relative overflow-hidden border-border/50 transition-all duration-300 hover:border-primary/30 hover:shadow-lg"
              >
                <CardContent className="p-6">
                  <div className="mb-4 inline-flex rounded-lg bg-primary/10 p-3">
                    <Icon className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="font-heading text-xl font-semibold">
                    {service.title}
                  </h3>
                  <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                    {service.short_description}
                  </p>
                  {features.length > 0 && (
                    <ul className="mt-4 flex flex-col gap-2">
                      {features.slice(0, 4).map((f) => (
                        <li
                          key={f}
                          className="flex items-center gap-2 text-sm text-muted-foreground"
                        >
                          <CheckCircle className="h-3.5 w-3.5 shrink-0 text-primary" />
                          {f}
                        </li>
                      ))}
                    </ul>
                  )}
                </CardContent>
              </Card>
            )
          })}
        </div>
      </div>
    </section>
  )
}
