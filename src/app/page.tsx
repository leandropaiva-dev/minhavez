import Navbar from '@/components/landing/Navbar'
import Footer from '@/components/landing/Footer'
import Hero from '@/components/landing/Hero'
import BenefitsSections from '@/components/landing/BenefitsSections'
import Testimonials from '@/components/landing/Testimonials'
import Pricing from '@/components/landing/Pricing'
import SmarterWay from '@/components/landing/SmarterWay'
import FAQ from '@/components/landing/FAQ'

export default function Home() {
  return (
    <div className="bg-white text-gray-900 min-h-screen">
      <Navbar />
      <div className="pt-16">
        <Hero />
      <BenefitsSections />
      <Testimonials />
      <Pricing />
      <SmarterWay />
      <FAQ />
      <Footer />
      </div>
    </div>
  )
}
