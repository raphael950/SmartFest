import { Users, Sun, AlertTriangle, ArrowRight } from "lucide-react";
import { Link } from "@adonisjs/inertia/react";
import "../css/components/LivePreview.css";

const stats = [
  { icon: Users, label: "AFFLUENCE", value: "Modérée" },
  { icon: Sun, label: "MÉTÉO", value: "24°C Soleil" },
  { icon: AlertTriangle, label: "ALERTES", value: "2 Actives" },
];

const LivePreview = () => {
  return (
    <section className="sf-live-preview container mx-auto">
      <div className="sf-live-preview__header">
        <div>
          <h2 className="sf-live-preview__title">
            <span className="sf-live-preview__pulse" />
            Aperçu en Direct
          </h2>
          <p className="sf-live-preview__updated-at">Informations actualisées il y a 2 minutes</p>
        </div>
        <div className="sf-live-preview__stats">
          {stats.map((stat) => (
            <div key={stat.label} className="sf-live-preview__stat-card">
              <stat.icon className="sf-live-preview__stat-icon" />
              <div>
                <p className="sf-live-preview__stat-label">{stat.label}</p>
                <p className="sf-live-preview__stat-value">{stat.value}</p>
              </div>
            </div>
          ))}
        </div>
        <Link route="session.create" className="sf-live-preview__details-link">
          Détails complets <ArrowRight className="sf-live-preview__details-icon" />
        </Link>
      </div>

      <div className="sf-live-preview__alert">
        <div className="sf-live-preview__alert-content">
          <AlertTriangle className="sf-live-preview__alert-icon" />
          <p className="sf-live-preview__alert-text">
            Connexion requise pour consulter les détails des alertes de sécurité et recevoir des notifications push.
          </p>
        </div>
        <Link route="session.create" className="sf-live-preview__alert-link">
          S'identifier
        </Link>
      </div>
    </section>
  );
};

export default LivePreview;
