import { Zap } from "lucide-react";
import "../css/components/Footer.css";

const Footer = () => {
  return (
    <footer className="sf-footer">
      <div className="sf-footer__container container mx-auto">
        <div className="sf-footer__grid">
          <div>
            <div className="sf-footer__brand">
              <div className="sf-footer__logo-wrap">
                <Zap className="sf-footer__logo-icon" />
              </div>
              <span className="sf-footer__brand-title">Festival Intelligent</span>
            </div>
            <p className="sf-footer__brand-description">
              La technologie au service de l'émotion. Profitez de chaque instant grâce à notre plateforme intelligente.
            </p>
          </div>

          <div>
            <h4 className="sf-footer__heading">Navigation</h4>
            <ul className="sf-footer__list">
              {["Programme", "Plan Interactif", "Infos Pratiques", "Se Connecter"].map((l) => (
                <li key={l}>
                  <a href="#" className="sf-footer__link">{l}</a>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="sf-footer__heading">Légal</h4>
            <ul className="sf-footer__list">
              {["Mentions Légales", "CGU / CGV", "Politique de Confidentialité", "Cookies"].map((l) => (
                <li key={l}>
                  <a href="#" className="sf-footer__link">{l}</a>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="sf-footer__heading">Suivez-nous</h4>
            <div className="sf-footer__socials">
              {["Facebook", "Twitter", "Instagram"].map((s) => (
                <a key={s} href="#" className="sf-footer__social-link">
                  {s[0]}
                </a>
              ))}
            </div>
          </div>
        </div>

        <div className="sf-footer__bottom">
          <p>© 2024 Festival Intelligent. Tous droits réservés.</p>
          <div className="sf-footer__bottom-links">
            <a href="#" className="sf-footer__bottom-link">Site Officiel</a>
            <a href="#" className="sf-footer__bottom-link">Presse</a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
