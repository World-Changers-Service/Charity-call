import { causes } from '../data/causes'
import { CauseCard } from './CauseCard'
import { ArrowRightIcon } from './Icon'

export function FeaturedCauses() {
  return (
    <section id="causes" className="bg-slate-50 py-16 sm:py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div className="max-w-2xl">
            <h2 className="text-3xl font-extrabold tracking-tight text-ink sm:text-4xl">
              Causes making an impact right now
            </h2>
            <p className="mt-3 text-lg text-body">
              Real campaigns from verified organisations. Track progress
              in real time and see exactly where your donation goes.
            </p>
          </div>
          <a
            href="#all-causes"
            className="inline-flex items-center gap-1.5 text-sm font-semibold text-brand-dark hover:gap-2.5 transition-all"
          >
            View all causes
            <ArrowRightIcon width={16} height={16} />
          </a>
        </div>

        <div className="mt-10 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {causes.map((cause) => (
            <CauseCard key={cause.id} cause={cause} />
          ))}
        </div>
      </div>
    </section>
  )
}
