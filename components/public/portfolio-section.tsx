import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import type { PortfolioItem } from "@/lib/types"

export function PortfolioSection({ items }: { items: PortfolioItem[] }) {
  if (items.length === 0) {
    return (
      <section id="portfolio" className="py-24">
        <div className="mx-auto max-w-7xl px-6">
          <div className="text-center">
            <span className="text-sm font-semibold uppercase tracking-wider text-primary">
              Our Work
            </span>
            <h2 className="font-heading mt-2 text-balance text-3xl font-bold md:text-4xl">
              Portfolio
            </h2>
            <p className="mx-auto mt-4 max-w-2xl text-pretty text-muted-foreground">
              Our portfolio is growing. Check back soon to see our latest
              projects and creative work.
            </p>
          </div>
        </div>
      </section>
    )
  }

  return (
    <section id="portfolio" className="py-24">
      <div className="mx-auto max-w-7xl px-6">
        <div className="text-center">
          <span className="text-sm font-semibold uppercase tracking-wider text-primary">
            Our Work
          </span>
          <h2 className="font-heading mt-2 text-balance text-3xl font-bold md:text-4xl">
            Featured Projects
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-pretty text-muted-foreground">
            Take a look at some of our recent projects that showcase our
            expertise and creativity.
          </p>
        </div>

        <div className="mt-16 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((item) => (
            <Card
              key={item.id}
              className="group overflow-hidden border-border/50"
            >
              {item.image_url ? (
                <div className="aspect-[4/3] overflow-hidden">
                  <img
                    src={item.image_url}
                    alt={item.title}
                    className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                </div>
              ) : (
                <div className="flex aspect-[4/3] items-center justify-center bg-muted">
                  <span className="text-muted-foreground">No image</span>
                </div>
              )}
              <div className="p-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-heading font-semibold">{item.title}</h3>
                  <Badge variant="secondary" className="text-xs">
                    {item.category}
                  </Badge>
                </div>
                {item.description && (
                  <p className="mt-1 text-sm text-muted-foreground line-clamp-2">
                    {item.description}
                  </p>
                )}
              </div>
            </Card>
          ))}
        </div>
      </div>
    </section>
  )
}
