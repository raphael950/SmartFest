import { Button } from "@/components/ui/button";
import { Star, Bell, ListChecks, Trophy } from "lucide-react";
import communityImage from "../images/home/main-home.png";
import "../css/components/CommunitySection.css";

const badges = [
  { icon: Star, label: "Favoris Illimités" },
  { icon: Bell, label: "Notifications Real-time" },
  { icon: ListChecks, label: "Programme Perso" },
];

const CommunitySection = () => {
  return (
    <section className="sf-community">
      <div className="sf-community__container container mx-auto">
        <div className="sf-community__grid">
          <div>
            <h2 className="sf-community__title">
              Rejoignez la communauté du Festival Intelligent
            </h2>
            <p className="sf-community__description">
              En créant un compte, vous débloquez des fonctionnalités exclusives : favoris synchronisés, alertes de passage d'artistes, système de points et accès prioritaire aux services du festival.
            </p>
            <div className="sf-community__badges">
              {badges.map((b) => (
                <span key={b.label} className="sf-community__badge">
                  <b.icon className="sf-community__badge-icon" />
                  {b.label}
                </span>
              ))}
            </div>
            <Button className="sf-community__cta">
              Créer mon compte maintenant
            </Button>
          </div>
          <div className="sf-community__visual">
            <img
              src={communityImage}
              alt="Communauté festival"
              className="sf-community__image"
              loading="lazy"
              width={1024}
              height={768}
            />
            <div className="sf-community__level-card">
              <div className="sf-community__level-icon-wrap">
                <Trophy className="sf-community__level-icon" />
              </div>
              <div>
                <p className="sf-community__level-title">Niveau Expert</p>
                <p className="sf-community__level-text">Plus que 450 pts pour le niveau suivant !</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CommunitySection;
