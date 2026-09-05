import { categories, categoryStyles } from '../data/causes'
import { ArrowRightIcon } from './Icon'

export function CategorySection() {
  return (
    <section id="categories" className="bg-white py-16 sm:py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="max-w-2xl">
          <h2 className="text-3xl font-extrabold tracking-tight text-ink sm:text-4xl">
            Give to a cause you care about
          </h2>
          <p className="mt-3 text-lg text-body">
            Every category is managed by verified organisations and
            overseen by our admin team, so you always know exactly what
            your donation supports.
          </p>
        </div>

        <div className="mt-10 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {categories.map((category) => {
            const style = categoryStyles[category.slug]
            return (
              <a
                key={category.slug}
                href={`#category-${category.slug}`}
                className="group flex flex-col rounded-2xl border border-slate-200 bg-white p-6 transition-all hover:-translate-y-1 hover:shadow-lg"
              >
                <span
                  className={`flex h-12 w-12 items-center justify-center rounded-xl text-2xl ${style.bg}`}
                >
                  {category.emoji}
                </span>
                <h3 className="mt-4 text-lg font-bold text-ink">
                  {category.name}
                </h3>
                <p className="mt-2 flex-1 text-sm leading-relaxed text-body">
                  {category.description}
                </p>
                <div className="mt-4 flex items-center justify-between">
                  <span className="text-xs font-medium text-body">
                    {category.causeCount} active causes
                  </span>
                  <span
                    className={`flex h-8 w-8 items-center justify-center rounded-full ${style.bg} ${style.text} transition-transform group-hover:translate-x-0.5`}
                  >
                    <ArrowRightIcon width={16} height={16} />
                  </span>
                </div>
              </a>
            )
          })}
        </div>
      </div>
    </section>
  )
}
