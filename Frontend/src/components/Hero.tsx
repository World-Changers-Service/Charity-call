import { useState, type FormEvent } from 'react'
import { SearchIcon, ShieldCheckIcon, TrendingUpIcon } from './Icon'

const quickCategories = [
  'Relief Funds',
  'Cancer Patients',
  'Hurricane Victims',
  'HIV / AIDS',
]

export function Hero() {
  const [query, setQuery] = useState('')

  function handleSubmit(e: FormEvent) {
    e.preventDefault()
  }

  return (
    <section id="top" className="relative overflow-hidden bg-brand-light">
      <div className="mx-auto grid max-w-7xl grid-cols-1 items-center gap-12 px-4 py-16 sm:px-6 lg:grid-cols-2 lg:gap-8 lg:px-8 lg:py-24">
        <div>
          <span className="inline-flex items-center gap-1.5 rounded-full bg-white px-3 py-1 text-xs font-semibold text-brand-dark ring-1 ring-brand/20">
            <ShieldCheckIcon width={14} height={14} />
            Trusted by 340+ verified organisations
          </span>

          <h1 className="mt-5 text-4xl font-extrabold tracking-tight text-ink sm:text-5xl lg:text-6xl">
            Give with confidence.
            <br />
            Change a life today.
          </h1>

          <p className="mt-5 max-w-xl text-lg text-body">
            Charicall connects you directly with verified humanitarian
            causes — relief funds, cancer care, hurricane recovery, and
            HIV/AIDS support — so every donation is transparent, tracked,
            and accountable.
          </p>

          <form
            onSubmit={handleSubmit}
            className="mt-8 flex max-w-lg items-center gap-2 rounded-full bg-white p-1.5 shadow-lg ring-1 ring-slate-200"
          >
            <SearchIcon className="ml-3 shrink-0 text-slate-400" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search causes, e.g. &ldquo;flood relief&rdquo;"
              className="w-full bg-transparent px-1 py-2 text-sm text-ink placeholder:text-slate-400 focus:outline-none"
            />
            <button
              type="submit"
              className="shrink-0 rounded-full bg-brand px-5 py-2.5 text-sm font-semibold text-white hover:bg-brand-dark transition-colors"
            >
              Search
            </button>
          </form>

          <div className="mt-4 flex flex-wrap gap-2">
            {quickCategories.map((c) => (
              <a
                key={c}
                href="#categories"
                className="rounded-full bg-white px-3.5 py-1.5 text-xs font-medium text-body ring-1 ring-slate-200 hover:text-brand-dark hover:ring-brand/30 transition-colors"
              >
                {c}
              </a>
            ))}
          </div>

          <div className="mt-8 flex flex-wrap items-center gap-4">
            <a
              href="#causes"
              className="rounded-full bg-ink px-6 py-3 text-sm font-semibold text-white hover:bg-slate-800 transition-colors"
            >
              Donate now
            </a>
            <a
              href="#start"
              className="rounded-full border border-slate-300 bg-white px-6 py-3 text-sm font-semibold text-ink hover:border-slate-400 transition-colors"
            >
              Start a cause
            </a>
          </div>
        </div>

        <div className="relative">
          <div className="overflow-hidden rounded-3xl shadow-2xl ring-1 ring-black/5">
            <img
              src="https://picsum.photos/seed/charicall-hero/900/720"
              alt="Volunteers distributing aid to a community"
              className="h-full w-full object-cover"
              width={900}
              height={720}
            />
          </div>

          <div className="absolute -bottom-6 -left-6 hidden sm:flex items-center gap-3 rounded-2xl bg-white p-4 shadow-xl ring-1 ring-slate-100">
            <span className="flex h-11 w-11 items-center justify-center rounded-full bg-brand-light text-brand-dark">
              <TrendingUpIcon />
            </span>
            <div>
              <p className="text-sm font-bold text-ink">$2.4M+ raised</p>
              <p className="text-xs text-body">in the last 30 days</p>
            </div>
          </div>

          <div className="absolute -top-6 -right-4 hidden sm:flex items-center gap-3 rounded-2xl bg-white p-4 shadow-xl ring-1 ring-slate-100">
            <span className="flex h-11 w-11 items-center justify-center rounded-full bg-brand-light text-brand-dark">
              <ShieldCheckIcon />
            </span>
            <div>
              <p className="text-sm font-bold text-ink">100% verified</p>
              <p className="text-xs text-body">organisations, admin-reviewed</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
