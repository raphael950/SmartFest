import { Calendar, Map, Info, Newspaper, ArrowRight } from "lucide-react";
import "../css/components/FeaturesSection.css";

const features = [
  {
    icon: Calendar,
    title: "Programme",
    description: "Consultez la timeline complète, filtrez par scène ou par genre et créez votre planning personnalisé.",
  },
  {
    icon: Map,
    title: "Plan & Zones",
    description: "Localisez les scènes, les points d'eau, les zones PMR et suivez l'affluence en temps réel sur la carte.",
  },
  {
    icon: Info,
    title: "Infos Pratiques",
    description: "FAQ, transports, règlement et toutes les informations essentielles pour une expérience sans stress.",
  },
  {
    icon: Newspaper,
    title: "Actualités",
    description: "Derniers communiqués, interviews d'artistes et galeries photos exclusives du festival.",
  },
];

const FeaturesSection = () => {
  return (
    <section className="sf-features">
      <div className="sf-features__container container mx-auto">
        <h2 className="sf-features__title">
          Tout le festival à portée de main
        </h2>
        <p className="sf-features__description">
          Organisez votre venue, restez informé des changements de dernière minute et optimisez votre parcours sur le site du festival.
        </p>
        <div className="sf-features__grid">
          {features.map((f) => (
            <div key={f.title} className="sf-features__card">
              <div className="sf-features__card-icon-wrap">
                <f.icon className="sf-features__card-icon" />
              </div>
              <h3 className="sf-features__card-title">{f.title}</h3>
              <p className="sf-features__card-description">{f.description}</p>
              <a href="#" className="sf-features__card-link">
                Accéder <ArrowRight className="sf-features__card-link-icon" />
              </a>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeaturesSection;
