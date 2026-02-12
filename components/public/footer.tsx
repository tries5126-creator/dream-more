import Link from "next/link"
import type { SiteSettings } from "@/lib/types"

export function Footer({ settings }: { settings: SiteSettings | null }) {
  const year = new Date().getFullYear()

  return (
    <footer className="border-t bg-[hsl(218,16%,28%)] py-12">
      <div className="mx-auto max-w-7xl px-6">
        <div className="grid gap-8 md:grid-cols-4">
          {/* Brand */}
          <div className="md:col-span-2">
            <h3 className="font-heading text-lg font-bold text-[hsl(30,25%,91%)]">
              {settings?.company_name || "CreativeHub"}
            </h3>
            <p className="mt-2 max-w-sm text-sm leading-relaxed text-[hsl(30,25%,91%)]/60">
              {settings?.description?.slice(0, 150) ||
                "Full-service digital agency specializing in web development, design, marketing, and training."}
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-semibold text-[hsl(30,25%,91%)]">
              Quick Links
            </h4>
            <ul className="mt-3 flex flex-col gap-2">
              {[
                { label: "Services", href: "#services" },
                { label: "Courses", href: "#courses" },
                { label: "Portfolio", href: "#portfolio" },
                { label: "Contact", href: "#contact" },
              ].map((link) => (
                <li key={link.href}>
                  <a
                    href={link.href}
                    className="text-sm text-[hsl(30,25%,91%)]/50 transition-colors hover:text-primary"
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Account */}
          <div>
            <h4 className="font-semibold text-[hsl(30,25%,91%)]">Account</h4>
            <ul className="mt-3 flex flex-col gap-2">
              <li>
                <Link
                  href="/auth/login"
                  className="text-sm text-[hsl(30,25%,91%)]/50 transition-colors hover:text-primary"
                >
                  Student Login
                </Link>
              </li>
              <li>
                <Link
                  href="/auth/sign-up"
                  className="text-sm text-[hsl(30,25%,91%)]/50 transition-colors hover:text-primary"
                >
                  Register
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-10 border-t border-[hsl(30,25%,91%)]/10 pt-6 text-center text-sm text-[hsl(30,25%,91%)]/40">
          {`\u00A9 ${year} ${settings?.company_name || "CreativeHub"}. All rights reserved.`}
        </div>
      </div>
    </footer>
  )
}
