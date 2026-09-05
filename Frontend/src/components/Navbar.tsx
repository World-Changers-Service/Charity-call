import { useState } from 'react'
import { HeartIcon, MenuIcon, XIcon } from './Icon'

const navLinks = [
  { label: 'Explore causes', href: '#causes' },
  { label: 'Categories', href: '#categories' },
  { label: 'How it works', href: '#how-it-works' },
  { label: 'For organisations', href: '#for-organisations' },
]

export function Navbar() {
  const [open, setOpen] = useState(false)

  return (
    <header className="sticky top-0 z-50 border-b border-slate-200 bg-white/90 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <a href="#top" className="flex items-center gap-2 shrink-0">
          <span className="flex h-8 w-8 items-center justify-center rounded-full bg-brand text-white">
            <HeartIcon width={18} height={18} />
          </span>
          <span className="text-lg font-bold tracking-tight text-ink">
            Charicall
          </span>
        </a>

        <nav className="hidden lg:flex items-center gap-8">
          {navLinks.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="text-sm font-medium text-body hover:text-ink transition-colors"
            >
              {link.label}
            </a>
          ))}
        </nav>

        <div className="hidden lg:flex items-center gap-3">
          <a
            href="#signin"
            className="text-sm font-semibold text-ink hover:text-brand transition-colors px-3 py-2"
          >
            Sign in
          </a>
          <a
            href="#start"
            className="rounded-full bg-brand px-5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-brand-dark transition-colors"
          >
            Start a cause
          </a>
        </div>

        <button
          type="button"
          aria-label="Toggle menu"
          onClick={() => setOpen((v) => !v)}
          className="lg:hidden flex h-10 w-10 items-center justify-center rounded-full text-ink hover:bg-slate-100"
        >
          {open ? <XIcon /> : <MenuIcon />}
        </button>
      </div>

      {open && (
        <div className="lg:hidden border-t border-slate-200 bg-white px-4 py-4 sm:px-6">
          <nav className="flex flex-col gap-1">
            {navLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                onClick={() => setOpen(false)}
                className="rounded-lg px-3 py-2.5 text-sm font-medium text-body hover:bg-slate-50 hover:text-ink"
              >
                {link.label}
              </a>
            ))}
          </nav>
          <div className="mt-3 flex flex-col gap-2 border-t border-slate-100 pt-3">
            <a
              href="#signin"
              className="rounded-lg px-3 py-2.5 text-center text-sm font-semibold text-ink hover:bg-slate-50"
            >
              Sign in
            </a>
            <a
              href="#start"
              className="rounded-full bg-brand px-5 py-2.5 text-center text-sm font-semibold text-white hover:bg-brand-dark"
            >
              Start a cause
            </a>
          </div>
        </div>
      )}
    </header>
  )
}
