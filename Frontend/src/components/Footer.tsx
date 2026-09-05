import { categories } from '../data/causes'
import { HeartIcon } from './Icon'

const companyLinks = ['About us', 'How it works', 'Careers', 'Press']
const supportLinks = ['Help centre', 'Trust & safety', 'Contact us']
const legalLinks = ['Terms of service', 'Privacy policy', 'Cookie policy']

export function Footer() {
  return (
    <footer className="border-t border-slate-200 bg-white">
      <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 gap-10 sm:grid-cols-3 lg:grid-cols-5">
          <div className="col-span-2 lg:col-span-2">
            <a href="#top" className="flex items-center gap-2">
              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-brand text-white">
                <HeartIcon width={18} height={18} />
              </span>
              <span className="text-lg font-bold text-ink">Charicall</span>
            </a>
            <p className="mt-4 max-w-xs text-sm leading-relaxed text-body">
              A transparent, cause-driven donation platform connecting
              donors with verified humanitarian organisations.
            </p>
          </div>

          <div>
            <h4 className="text-sm font-bold text-ink">Categories</h4>
            <ul className="mt-4 space-y-3">
              {categories.map((category) => (
                <li key={category.slug}>
                  <a
                    href={`#category-${category.slug}`}
                    className="text-sm text-body hover:text-brand-dark"
                  >
                    {category.name}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="text-sm font-bold text-ink">Company</h4>
            <ul className="mt-4 space-y-3">
              {companyLinks.map((link) => (
                <li key={link}>
                  <a href="#" className="text-sm text-body hover:text-brand-dark">
                    {link}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="text-sm font-bold text-ink">Support &amp; legal</h4>
            <ul className="mt-4 space-y-3">
              {[...supportLinks, ...legalLinks].map((link) => (
                <li key={link}>
                  <a href="#" className="text-sm text-body hover:text-brand-dark">
                    {link}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mt-12 flex flex-col items-center justify-between gap-4 border-t border-slate-100 pt-8 sm:flex-row">
          <p className="text-xs text-body">
            &copy; {new Date().getFullYear()} Charicall. Built with love for
            humanity.
          </p>
          <p className="text-xs text-body">
            Every donation is tracked, verified, and accounted for.
          </p>
        </div>
      </div>
    </footer>
  )
}
