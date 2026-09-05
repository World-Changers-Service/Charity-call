import { Navbar } from './components/Navbar'
import { Hero } from './components/Hero'
import { TrustBar } from './components/TrustBar'
import { CategorySection } from './components/CategorySection'
import { FeaturedCauses } from './components/FeaturedCauses'
import { HowItWorks } from './components/HowItWorks'
import { OrgCTA } from './components/OrgCTA'
import { Footer } from './components/Footer'

function App() {
  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      <main>
        <Hero />
        <TrustBar />
        <CategorySection />
        <FeaturedCauses />
        <HowItWorks />
        <OrgCTA />
      </main>
      <Footer />
    </div>
  )
}

export default App
