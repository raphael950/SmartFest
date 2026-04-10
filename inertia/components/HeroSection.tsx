import { Button } from "../components/ui/button";
import heroImage from "../images/home/main-home.png";
import "../css/components/HeroSection.css";

const HeroSection = () => {
  return (
    <section className="sf-hero">
      <img
        src={heroImage}
        alt="Festival"
        className="sf-hero__image"
        width={1920}
        height={1080}
      />
      <div className="sf-hero__overlay" />
      <div className="sf-hero__content">
        <span className="sf-hero__badge">
          Édition 2026 • Maintenant en Live
        </span>
        <h1 className="sf-hero__title">
          Vivez le Festival
          <br />
          Intelligemment
        </h1>
        <p className="sf-hero__description">
          Votre compagnon digital pour une expérience fluide : programme en temps réel, carte interactive et alertes personnalisées.
        </p>
        <div className="sf-hero__actions">
          <Button className="sf-hero__btn sf-hero__btn--primary">
            Explorer le Festival
          </Button>
          <Button className="sf-hero__btn sf-hero__btn--secondary">
            S'inscrire gratuitement
          </Button>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
