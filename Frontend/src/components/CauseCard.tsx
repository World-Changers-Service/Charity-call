import type { Cause } from '../data/causes'
import { categories, categoryStyles } from '../data/causes'
import { formatCurrency, progressPercent } from '../lib/format'
import { ShieldCheckIcon, UsersIcon } from './Icon'

export function CauseCard({ cause }: { cause: Cause }) {
  const category = categories.find((c) => c.slug === cause.category)!
  const style = categoryStyles[cause.category]
  const percent = progressPercent(cause.raised, cause.target)
  const isFunded = percent >= 100

  return (
    <article className="group flex flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white transition-shadow hover:shadow-lg">
      <div className="relative aspect-[4/3] overflow-hidden">
        <img
          src={cause.image}
          alt={cause.title}
          className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
          loading="lazy"
        />
        <span
          className={`absolute left-3 top-3 inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold ${style.bg} ${style.text}`}
        >
          {category.emoji} {category.name}
        </span>
        {isFunded && (
          <span className="absolute right-3 top-3 rounded-full bg-brand px-2.5 py-1 text-xs font-semibold text-white">
            Fully funded
          </span>
        )}
      </div>

      <div className="flex flex-1 flex-col p-5">
        <div className="flex items-center gap-1.5 text-xs font-medium text-body">
          <ShieldCheckIcon width={14} height={14} className="text-brand" />
          {cause.organisation}
          <span aria-hidden className="text-slate-300">
            &middot;
          </span>
          {cause.location}
        </div>

        <h3 className="mt-2 line-clamp-2 text-base font-bold text-ink">
          {cause.title}
        </h3>

        <div className="mt-4">
          <div className="h-2 w-full overflow-hidden rounded-full bg-slate-100">
            <div
              className="h-full rounded-full bg-brand transition-all"
              style={{ width: `${percent}%` }}
            />
          </div>
          <div className="mt-2 flex items-baseline justify-between">
            <p className="text-sm font-bold text-ink">
              {formatCurrency(cause.raised)}
              <span className="ml-1 font-normal text-body">
                raised of {formatCurrency(cause.target)}
              </span>
            </p>
            <p className="text-sm font-semibold text-brand-dark">
              {percent}%
            </p>
          </div>
        </div>

        <div className="mt-3 flex items-center gap-1.5 text-xs text-body">
          <UsersIcon width={14} height={14} />
          {cause.donors.toLocaleString()} donors
        </div>

        <a
          href={`#cause-${cause.id}`}
          className="mt-4 rounded-full bg-brand py-2.5 text-center text-sm font-semibold text-white hover:bg-brand-dark transition-colors"
        >
          Donate now
        </a>
      </div>
    </article>
  )
}
