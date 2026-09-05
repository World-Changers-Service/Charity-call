import { CompassIcon, HeartIcon, TrendingUpIcon } from './Icon'

const steps = [
  {
    icon: CompassIcon,
    title: 'Browse verified causes',
    description:
      'Explore causes by category, urgency, or location. Every cause is reviewed and approved by our admin team before it goes live.',
  },
  {
    icon: HeartIcon,
    title: 'Give securely',
    description:
      'Donate any amount in a few clicks. Choose to give publicly or anonymously — you always get a confirmation and receipt.',
  },
  {
    icon: TrendingUpIcon,
    title: 'Track your impact',
    description:
      'Follow funding progress in real time and receive updates directly from the organisation on how your donation is used.',
  },
]

export function HowItWorks() {
  return (
    <section id="how-it-works" className="bg-white py-16 sm:py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-extrabold tracking-tight text-ink sm:text-4xl">
            Giving made simple and transparent
          </h2>
          <p className="mt-3 text-lg text-body">
            From browsing to impact reporting, every step is designed for
            trust.
          </p>
        </div>

        <div className="mt-14 grid grid-cols-1 gap-10 sm:grid-cols-3">
          {steps.map((step, index) => (
            <div key={step.title} className="relative text-center">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-brand-light text-brand-dark">
                <step.icon width={28} height={28} />
              </div>
              <span className="mt-4 block text-sm font-bold text-brand">
                Step {index + 1}
              </span>
              <h3 className="mt-1 text-lg font-bold text-ink">
                {step.title}
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-body">
                {step.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
