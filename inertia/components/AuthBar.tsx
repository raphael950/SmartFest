import { ArrowLeft, Zap } from "lucide-react";
import "../css/components/Navbar.css";

const AuthBar = () => {
  const goBack = () => {
    if (window.history.length > 1) {
      window.history.back();
      return;
    }

    window.location.assign("/");
  };

  return (
    <nav className="sf-navbar">
      <div className="sf-navbar__container">
        <div className="sf-authbar__left">
          <button
            type="button"
            className="sf-authbar__back-btn"
            onClick={goBack}
            aria-label="Revenir à la page précédente"
          >
            <ArrowLeft className="sf-authbar__back-icon" />
          </button>
          <div className="sf-navbar__brand">
            <div className="sf-navbar__logo">
              <Zap className="sf-navbar__logo-icon" />
            </div>
            <span className="sf-navbar__title">Festival Intelligent</span>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default AuthBar;
