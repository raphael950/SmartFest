import { ArrowRight } from 'lucide-react'
import '@/css/components/home/HomeHero.css'

const HomeHero = () => {
  return (
    <section className="home-hero">
      <div className="home-hero__content">
        <span className="home-hero__badge">
          <span className="home-hero__badge-dot" />
          En direct
        </span>

        <div className="home-hero__copy">
          <h2>
            Bienvenue au
            <span>Circuit Bugatti</span>
          </h2>
          <p>
            Suivez en temps reel les evenements de course automobile sur le mythique circuit du
            Mans.
          </p>
        </div>

        <a href="/live-timing" className="home-hero__cta">
          <span>Suivre l&apos;evenement en direct</span>
          <ArrowRight className="home-hero__cta-icon" />
        </a>
      </div>
    </section>
  )
}

export default HomeHero
