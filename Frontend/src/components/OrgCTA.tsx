import { CheckCircleIcon } from './Icon'

const benefits = [
  'Admin-verified badge on your public profile',
  'Full campaign management dashboard',
  'Secure, trackable fund disbursement',
  'Donor analytics and impact reporting tools',
]

export function OrgCTA() {
  return (
    <section id="for-organisations" className="bg-ink py-16 sm:py-20">
      <div className="mx-auto grid max-w-7xl grid-cols-1 items-center gap-10 px-4 sm:px-6 lg:grid-cols-2 lg:px-8">
        <div>
          <span className="inline-flex rounded-full bg-white/10 px-3 py-1 text-xs font-semibold text-brand-light">
            For nonprofits &amp; NGOs
          </span>
          <h2 className="mt-4 text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
            Are you an organisation ready to raise funds?
          </h2>
          <p className="mt-4 max-w-xl text-lg text-slate-300">
            Apply to become a verified organisation on Charicall and reach
            thousands of donors ready to support your cause.
          </p>
          <div className="mt-8 flex flex-wrap gap-4">
            <a
              href="#apply"
              className="rounded-full bg-brand px-6 py-3 text-sm font-semibold text-white hover:bg-brand-dark transition-colors"
            >
              Apply to fundraise
            </a>
            <a
              href="#learn-more"
              className="rounded-full border border-white/30 px-6 py-3 text-sm font-semibold text-white hover:border-white/60 transition-colors"
            >
              Learn how it works
            </a>
          </div>
        </div>

        <div className="rounded-2xl bg-white/5 p-8 ring-1 ring-white/10">
          <ul className="space-y-4">
            {benefits.map((benefit) => (
              <li key={benefit} className="flex items-start gap-3">
                <CheckCircleIcon
                  width={20}
                  height={20}
                  className="mt-0.5 shrink-0 text-brand"
                />
                <span className="text-sm text-slate-200">{benefit}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  )
}
