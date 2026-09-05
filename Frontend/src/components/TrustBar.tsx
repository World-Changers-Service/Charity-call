const stats = [
  { value: '$2.4M+', label: 'donated through Charicall' },
  { value: '12,400+', label: 'donors giving monthly' },
  { value: '330+', label: 'causes funded to date' },
  { value: '340+', label: 'verified organisations' },
]

export function TrustBar() {
  return (
    <section className="border-b border-slate-200 bg-white">
      <div className="mx-auto grid max-w-7xl grid-cols-2 gap-8 px-4 py-10 sm:px-6 lg:grid-cols-4 lg:px-8">
        {stats.map((stat) => (
          <div key={stat.label} className="text-center lg:text-left">
            <p className="text-2xl font-extrabold text-ink sm:text-3xl">
              {stat.value}
            </p>
            <p className="mt-1 text-sm text-body">{stat.label}</p>
          </div>
        ))}
      </div>
    </section>
  )
}
